const express = require('express')
const { body, validationResult } = require('express-validator')
const Tag = require('../models/Tag')
const { auth, admin } = require('../middleware/auth')

const router = express.Router()

// 获取所有标签 (公开)
router.get('/', async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 })
    res.json(tags)
  } catch (error) {
    console.error('获取标签失败:', error)
    res.status(500).json({ message: '获取标签失败' })
  }
})

// 获取标签列表 (管理员)
router.get('/admin', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    const skip = (pageNum - 1) * limitNum
    
    let query = {}
    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }
    
    const tags = await Tag.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
    
    const total = await Tag.countDocuments(query)
    
    res.json({
      tags,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum
    })
  } catch (error) {
    console.error('获取标签列表失败:', error)
    res.status(500).json({ message: '获取标签列表失败' })
  }
})

// 创建标签 (管理员)
router.post('/', auth, admin, [
  body('name').notEmpty().withMessage('标签名称不能为空')
    .isLength({ min: 1, max: 20 }).withMessage('标签名称长度在1到20个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { name, description = '' } = req.body
    
    // 检查标签是否已存在
    const existingTag = await Tag.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } })
    if (existingTag) {
      return res.status(400).json({ message: '标签已存在' })
    }
    
    const tag = new Tag({
      name: name.trim(),
      description: description.trim()
    })
    
    await tag.save()
    res.status(201).json(tag)
  } catch (error) {
    console.error('创建标签失败:', error)
    res.status(500).json({ message: '创建标签失败' })
  }
})

// 获取单个标签 (管理员)
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id)
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' })
    }
    res.json(tag)
  } catch (error) {
    console.error('获取标签失败:', error)
    res.status(500).json({ message: '获取标签失败' })
  }
})

// 更新标签 (管理员)
router.put('/:id', auth, admin, [
  body('name').notEmpty().withMessage('标签名称不能为空')
    .isLength({ min: 1, max: 20 }).withMessage('标签名称长度在1到20个字符')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { name, description = '' } = req.body
    
    // 检查标签是否已存在（排除当前标签）
    const existingTag = await Tag.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: req.params.id }
    })
    if (existingTag) {
      return res.status(400).json({ message: '标签名称已存在' })
    }
    
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      {
        name: name.trim(),
        description: description.trim()
      },
      { new: true }
    )
    
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' })
    }
    
    res.json(tag)
  } catch (error) {
    console.error('更新标签失败:', error)
    res.status(500).json({ message: '更新标签失败' })
  }
})

// 删除标签 (管理员)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id)
    if (!tag) {
      return res.status(404).json({ message: '标签不存在' })
    }
    
    res.json({ message: '标签删除成功' })
  } catch (error) {
    console.error('删除标签失败:', error)
    res.status(500).json({ message: '删除标签失败' })
  }
})

module.exports = router
