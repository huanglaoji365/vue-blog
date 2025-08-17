const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
require('dotenv').config()
const path = require('path')

const authRoutes = require('./routes/auth')
const postRoutes = require('./routes/posts')
const commentRoutes = require('./routes/comments')
const categoryRoutes = require('./routes/categories')
const tagRoutes = require('./routes/tags')
const userRoutes = require('./routes/users')
const uploadRoutes = require('./routes/upload')

const app = express()
const PORT = process.env.PORT || 3000

// 中间件
app.use(helmet())
app.use(morgan('combined'))
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// 数据库连接
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vue-blog', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB connected successfully')
})
.catch((err) => {
  console.error('MongoDB connection error:', err)
  process.exit(1)
})

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' })
})

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Something went wrong!' })
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
