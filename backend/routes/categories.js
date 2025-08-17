const express = require('express')
const { body, validationResult } = require('express-validator')
const Category = require('../models/Category')
const Post = require('../models/Post')
const { auth, admin } = require('../middleware/auth')

const router = express.Router()

// 获取所有分类
router.get('/', async (req, res) => {
  try {
    const { page, limit, search } = req.query
    
    // 如果没有分页参数，返回所有分类（兼容旧版本）
    if (!page && !limit) {
      const categories = await Category.find({ isActive: true }).sort({ name: 1 })
      
      // 获取每个分类的文章数量
      const categoriesWithCount = await Promise.all(
        categories.map(async (category) => {
          const count = await Post.countDocuments({ 
            category: category._id, 
            status: 'published' 
          })
          return {
            ...category.toObject(),
            count
          }
        })
      )

      return res.json(categoriesWithCount)
    }
    
    // 分页查询
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    const skip = (pageNum - 1) * limitNum
    
    let query = {}
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }
    
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .exec()
    
    // 获取每个分类的文章数量
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Post.countDocuments({ 
          category: category._id, 
          status: 'published' 
        })
        return {
          ...category.toObject(),
          count
        }
      })
    )
    
    const total = await Category.countDocuments(query)
    
    res.json({
      categories: categoriesWithCount,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    })
  } catch (error) {
    console.error('获取分类错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取分类列表（管理员，带分页）
router.get('/admin', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    const skip = (pageNum - 1) * limitNum

    const query = {}
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .exec()

    // 附带文章数量（仅统计已发布）
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const count = await Post.countDocuments({ category: category._id, status: 'published' })
        return { ...category.toObject(), count }
      })
    )

    const total = await Category.countDocuments(query)

    res.json({
      categories: categoriesWithCount,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    })
  } catch (error) {
    console.error('获取分类列表失败:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取单个分类
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' })
    }

    res.json(category)
  } catch (error) {
    console.error('获取分类详情错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 创建分类
router.post('/', auth, admin, [
  body('name').notEmpty().withMessage('分类名称不能为空'),
  body('description').optional().isLength({ max: 200 }).withMessage('描述不能超过200个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { name, description } = req.body

    // 检查分类是否已存在
    const existingCategory = await Category.findOne({ name })
    if (existingCategory) {
      return res.status(400).json({ message: '分类名称已存在' })
    }

    const category = new Category({
      name,
      description
    })

    await category.save()

    res.status(201).json({
      message: '分类创建成功',
      category
    })
  } catch (error) {
    console.error('创建分类错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 更新分类
router.put('/:id', auth, admin, [
  body('name').optional().notEmpty().withMessage('分类名称不能为空'),
  body('description').optional().isLength({ max: 200 }).withMessage('描述不能超过200个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { name, description, isActive } = req.body

    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ message: '分类不存在' })
    }

    const updates = {}
    if (name) updates.name = name
    if (description !== undefined) updates.description = description
    if (isActive !== undefined) updates.isActive = isActive

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    )

    res.json({
      message: '分类更新成功',
      category: updatedCategory
    })
  } catch (error) {
    console.error('更新分类错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 删除分类
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    
    if (!category) {
      return res.status(404).json({ message: '分类不存在' })
    }

    // 检查是否有文章使用此分类
    const postCount = await Post.countDocuments({ category: req.params.id })
    if (postCount > 0) {
      return res.status(400).json({ message: '该分类下还有文章，无法删除' })
    }

    await Category.findByIdAndDelete(req.params.id)

    res.json({ message: '分类删除成功' })
  } catch (error) {
    console.error('删除分类错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

module.exports = router
