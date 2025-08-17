const express = require('express')
const { body, validationResult } = require('express-validator')
const Post = require('../models/Post')
const { auth, admin } = require('../middleware/auth')
const Tag = require('../models/Tag') // Added Tag import

const router = express.Router()

// 获取文章列表
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, tag, search, status } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    const skip = (pageNum - 1) * limitNum

    let query = {}
    // 如果没有指定status，则返回所有文章（管理页面）
    if (status) {
      query.status = status
    }
    if (category) query.category = category
    if (tag) query.tags = tag
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ]
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .populate('category', 'name')
      .populate('tags', 'name')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .exec()

    const total = await Post.countDocuments(query)

    res.json({
      posts,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    res.status(500).json({ message: '获取文章列表失败' })
  }
})

// 获取单个文章
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar')
      .populate('category', 'name')
      .populate('tags', 'name')
      .exec()

    if (!post) {
      return res.status(404).json({ message: '文章不存在' })
    }

    // 增加浏览量
    post.views += 1
    await post.save()

    res.json(post)
  } catch (error) {
    console.error('获取文章失败:', error)
    res.status(500).json({ message: '获取文章失败' })
  }
})

// 创建文章
router.post('/', auth, [
  body('title').notEmpty().withMessage('标题不能为空'),
  body('content').notEmpty().withMessage('内容不能为空'),
  body('category').notEmpty().withMessage('分类不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { title, content, excerpt, category, tags = [], status, featured, coverImage } = req.body

    const post = new Post({
      title,
      content,
      excerpt,
      author: req.user._id,
      category,
      tags,
      status: status || 'draft',
      featured: featured || false,
      coverImage: coverImage || ''
    })

    await post.save()
    
    // 更新标签使用次数
    if (tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: tags } },
        { $inc: { count: 1 } }
      )
    }

    res.status(201).json(post)
  } catch (error) {
    console.error('创建文章失败:', error)
    res.status(500).json({ message: '创建文章失败' })
  }
})

// 更新文章
router.put('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: '文章不存在' })
    }

    // 检查权限
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限修改此文章' })
    }

    const { title, content, excerpt, category, tags = [], status, featured, coverImage } = req.body

    // 获取旧的标签ID列表
    const oldTags = post.tags.map(tag => tag.toString())
    const newTags = tags

    // 更新文章
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        excerpt,
        category,
        tags: newTags,
        status,
        featured,
        coverImage
      },
      { new: true }
    )

    // 更新标签使用次数
    const removedTags = oldTags.filter(tagId => !newTags.includes(tagId))
    const addedTags = newTags.filter(tagId => !oldTags.includes(tagId))

    if (removedTags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: removedTags } },
        { $inc: { count: -1 } }
      )
    }

    if (addedTags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: addedTags } },
        { $inc: { count: 1 } }
      )
    }

    res.json(updatedPost)
  } catch (error) {
    console.error('更新文章失败:', error)
    res.status(500).json({ message: '更新文章失败' })
  }
})

// 删除文章
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) {
      return res.status(404).json({ message: '文章不存在' })
    }

    // 检查权限
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限删除此文章' })
    }

    // 减少标签使用次数
    if (post.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: post.tags } },
        { $inc: { count: -1 } }
      )
    }

    await Post.findByIdAndDelete(req.params.id)
    res.json({ message: '文章删除成功' })
  } catch (error) {
    console.error('删除文章失败:', error)
    res.status(500).json({ message: '删除文章失败' })
  }
})

// 点赞文章
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
    
    if (!post) {
      return res.status(404).json({ message: '文章不存在' })
    }

    const likeIndex = post.likes.indexOf(req.user._id)
    
    if (likeIndex > -1) {
      // 取消点赞
      post.likes.splice(likeIndex, 1)
    } else {
      // 添加点赞
      post.likes.push(req.user._id)
    }

    await post.save()

    res.json({
      message: likeIndex > -1 ? '取消点赞成功' : '点赞成功',
      likes: post.likes.length
    })
  } catch (error) {
    console.error('点赞错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

module.exports = router
