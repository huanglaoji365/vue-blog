const express = require('express')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')
const { auth, admin } = require('../middleware/auth')

const router = express.Router()

// 获取用户列表 (仅管理员)
router.get('/', auth, admin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role, isActive } = req.query
    const pageNum = parseInt(page) || 1
    const limitNum = parseInt(limit) || 10
    
    const query = {}
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }
    
    if (role) {
      query.role = role
    }

    if (isActive !== undefined && isActive !== null) {
      query.isActive = isActive === 'true' || isActive === true
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .exec()

    const total = await User.countDocuments(query)

    res.json({
      users,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total
    })
  } catch (error) {
    console.error('获取用户列表错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 获取单个用户信息 (仅管理员)
router.get('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    res.json(user)
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 更新用户信息 (仅管理员)
router.put('/:id', auth, admin, [
  body('username').optional().isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间'),
  body('email').optional().isEmail().withMessage('请输入有效的邮箱地址'),
  body('role').optional().isIn(['user', 'admin']).withMessage('角色必须是 user 或 admin'),
  body('isActive').optional().isBoolean().withMessage('isActive 必须是布尔值')
], async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { username, email, role, isActive, bio, avatar } = req.body

    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({ message: '邮箱已被使用' })
      }
    }

    // 检查用户名是否已被其他用户使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) {
        return res.status(400).json({ message: '用户名已被使用' })
      }
    }

    const updates = {}
    if (username) updates.username = username
    if (email) updates.email = email
    if (role) updates.role = role
    if (isActive !== undefined) updates.isActive = isActive
    if (bio !== undefined) updates.bio = bio
    if (avatar) updates.avatar = avatar

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password')

    res.json({
      message: '用户更新成功',
      user: updatedUser
    })
  } catch (error) {
    console.error('更新用户错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 删除用户 (仅管理员)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 不能删除自己
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: '不能删除自己的账户' })
    }

    await User.findByIdAndDelete(req.params.id)

    res.json({ message: '用户删除成功' })
  } catch (error) {
    console.error('删除用户错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

// 重置用户密码 (仅管理员)
router.post('/:id/reset-password', auth, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' })
    }

    // 生成随机密码
    const newPassword = Math.random().toString(36).slice(-8)
    user.password = newPassword
    await user.save()

    res.json({
      message: '密码重置成功',
      newPassword
    })
  } catch (error) {
    console.error('重置密码错误:', error)
    res.status(500).json({ message: '服务器错误' })
  }
})

module.exports = router
