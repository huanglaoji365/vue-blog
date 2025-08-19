const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const router = express.Router()

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 配置 multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const fileFilter = (req, file, cb) => {
  // 检查文件类型
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)
  } else {
    cb(new Error('只允许上传图片文件'), false)
  }
}

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
})

// 兼容多种字段名（Element Plus: file / UEditor: upfile）
const uploadAny = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024
  }
}).any()

// UEditor 配置获取（服务端路由 serverUrl?action=config）
router.get('/', async (req, res) => {
  try {
    const { action } = req.query || {}
    if (action === 'config') {
      // 最小配置，满足图片上传
      return res.json({
        imageActionName: 'uploadimage',
        imageFieldName: 'upfile',
        imageMaxSize: 2 * 1024 * 1024,
        imageAllowFiles: ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
        imageUrlPrefix: '',
        fileActionName: 'uploadfile',
        fileFieldName: 'upfile',
        videoActionName: 'uploadvideo',
        videoFieldName: 'upfile'
      })
    }

    if (action === 'listimage') {
      // 返回上传目录的图片列表
      const files = fs.readdirSync(uploadDir)
      const images = files
        .filter((name) => /\.(png|jpe?g|gif|bmp|webp)$/i.test(name))
        .map((name) => {
          const filePath = path.join(uploadDir, name)
          const stat = fs.statSync(filePath)
          return {
            url: `/uploads/${name}`,
            mtime: Math.floor(stat.mtimeMs / 1000),
            size: stat.size
          }
        })

      return res.json({
        state: 'SUCCESS',
        list: images,
        start: 0,
        total: images.length
      })
    }

    return res.status(400).json({ message: 'Invalid action' })
  } catch (e) {
    console.error('GET /api/upload error:', e)
    return res.status(500).json({ message: 'Server error' })
  }
})

// 允许通过 header Authorization 或 query token 验证
const authenticateUpload = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null
    const queryToken = req.query?.token
    const token = bearerToken || queryToken

    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' })
    }
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token is not valid' })
  }
}

// 图片上传接口（兼容 Element Plus 与 UEditor）
router.post('/', authenticateUpload, (req, res) => {
  uploadAny(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: '文件大小不能超过2MB' })
      }
      console.error('文件上传错误:', err)
      return res.status(500).json({ message: '文件上传失败' })
    }

    const { action } = req.query || {}
    const files = req.files || []
    // 兼容字段名：优先取 upfile（UEditor），否则取 file（Element Plus）
    const file = files.find((f) => f.fieldname === 'upfile') || files.find((f) => f.fieldname === 'file') || files[0]

    if (!file) {
      return res.status(400).json({ message: '没有上传文件' })
    }

    const fileUrl = `/uploads/${file.filename}`

    // UEditor 返回格式
    if (action === 'uploadimage' || action === 'uploadfile' || action === 'uploadvideo') {
      return res.json({
        state: 'SUCCESS',
        url: fileUrl,
        title: file.filename,
        original: file.originalname
      })
    }

    // Element Plus / 通用返回格式
    return res.json({
      message: '上传成功',
      url: fileUrl,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size
    })
  })
})

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '文件大小不能超过2MB' })
    }
  }
  res.status(500).json({ message: error.message || '文件上传失败' })
})

module.exports = router
