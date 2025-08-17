const express = require('express')
const { body, validationResult } = require('express-validator')
const Comment = require('../models/Comment')
const Post = require('../models/Post')
const { auth, admin } = require('../middleware/auth')

const router = express.Router()

// 获取所有评论 (仅管理员)
router.get('/', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isApproved } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    
    const query = {}
    
    if (search) {
      query.content = { $regex: search, $options: 'i' }
    }
    
    if (isApproved !== undefined && isApproved !== null) {
      query.isApproved = isApproved === 'true' || isApproved === true
    }

    const comments = await Comment.find(query)
      .populate('author', 'username avatar')
      .populate('post', 'title')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .exec()

    const total = await Comment.countDocuments(query)

    res.json({
      comments,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    })
  } catch (error) {
    console.error('获取评论列表错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取文章的评论
router.get('/post/:postId', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query
    
    const comments = await Comment.find({ 
      post: req.params.postId,
      isApproved: true,
      parent: null
    })
      .populate('author', 'username avatar')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'username avatar'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const total = await Comment.countDocuments({ 
      post: req.params.postId,
      isApproved: true,
      parent: null
    })

    res.json({
      comments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    })
  } catch (error) {
    console.error('获取评论错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 创建评论
router.post('/', auth, [
  body('content').notEmpty().withMessage('评论内容不能为空'),
  body('postId').notEmpty().withMessage('文章ID不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { content, postId, parentId } = req.body

    // 检查文章是否存在
    const post = await Post.findById(postId)
    if (!post) {
      return res.status(404).json({ message: '文章不存在' })
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      post: postId,
      parent: parentId || null
    })

    await comment.save()
    await comment.populate('author', 'username avatar')

    // 如果是回复，更新父评论的replies数组
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { replies: comment._id }
      })
    }

    res.status(201).json({
      message: '评论创建成功',
      comment
    })
  } catch (error) {
    console.error('创建评论错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 更新评论
router.put('/:id', auth, [
  body('content').optional().notEmpty().withMessage('评论内容不能为空')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const comment = await Comment.findById(req.params.id)
    
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' })
    }

    // 检查权限
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限修改此评论' })
    }

    const { content, isApproved } = req.body
    const updates = {}

    // 普通用户只能修改内容
    if (content && comment.author.toString() === req.user._id.toString()) {
      updates.content = content
    }

    // 管理员可以修改内容和审核状态
    if (req.user.role === 'admin') {
      if (content) updates.content = content
      if (isApproved !== undefined) updates.isApproved = isApproved
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar')

    res.json({
      message: '评论更新成功',
      comment: updatedComment
    })
  } catch (error) {
    console.error('更新评论错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 删除评论
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' })
    }

    // 检查权限
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: '没有权限删除此评论' })
    }

    // 删除回复
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } })
    }

    // 如果是回复，从父评论的replies数组中移除
    if (comment.parent) {
      await Comment.findByIdAndUpdate(comment.parent, {
        $pull: { replies: comment._id }
      })
    }

    await Comment.findByIdAndDelete(req.params.id)

    res.json({ message: '评论删除成功' })
  } catch (error) {
    console.error('删除评论错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 点赞评论
router.post('/:id/like', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' })
    }

    const likeIndex = comment.likes.indexOf(req.user._id)
    
    if (likeIndex > -1) {
      // 取消点赞
      comment.likes.splice(likeIndex, 1)
    } else {
      // 添加点赞
      comment.likes.push(req.user._id)
    }

    await comment.save()

    res.json({
      message: likeIndex > -1 ? '取消点赞成功' : '点赞成功',
      likes: comment.likes.length
    })
  } catch (error) {
    console.error('点赞评论错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

module.exports = router
