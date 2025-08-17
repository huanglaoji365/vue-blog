const jwt = require('jsonwebtoken')
const User = require('../models/User')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
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

const admin = (req, res, next) => {
  try {
    // 这里假设已通过 auth 中间件，req.user 已存在
    if (!req.user) {
      return res.status(401).json({ message: 'No token, authorization denied' })
    }
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }
    next()
  } catch (error) {
    return res.status(403).json({ message: 'Access denied' })
  }
}

module.exports = { auth, admin }
