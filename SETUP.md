# WeBlog 项目设置指南

## 项目概述

这是一个基于 Vue3 + Node.js + MongoDB 的现代化个人博客系统，具有完整的用户认证、文章管理、评论系统等功能。

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 快速构建工具
- **Vue Router 4** - 官方路由管理器
- **Pinia** - 状态管理库
- **Element Plus** - Vue 3 组件库
- **Axios** - HTTP 客户端

### 后端
- **Node.js** - JavaScript 运行时
- **Express.js** - Web 应用框架
- **MongoDB** - NoSQL 数据库
- **Mongoose** - MongoDB 对象建模工具
- **JWT** - JSON Web Token 认证
- **bcryptjs** - 密码加密
- **express-validator** - 数据验证

## 环境要求

- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd vue-blog
```

### 2. 安装依赖

```bash
# 安装所有依赖（前端 + 后端）
npm run install:all
```

或者分别安装：

```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend
npm install

# 安装后端依赖
cd ../backend
npm install
```

### 3. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
# 服务器配置
PORT=3000

# 数据库配置
MONGODB_URI=mongodb://localhost:27017/vue-blog

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 跨域配置
CORS_ORIGIN=http://localhost:5173

# 文件上传配置
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### 4. 启动 MongoDB

确保 MongoDB 服务正在运行：

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 5. 启动开发服务器

```bash
# 同时启动前端和后端
npm run dev
```

或者分别启动：

```bash
# 启动前端（新终端）
npm run dev:frontend

# 启动后端（新终端）
npm run dev:backend
```

## 项目结构

```
vue-blog/
├── frontend/                 # Vue3 前端项目
│   ├── src/
│   │   ├── components/      # 公共组件
│   │   ├── views/          # 页面组件
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── router/         # 路由配置
│   │   ├── utils/          # 工具函数
│   │   └── style.css       # 全局样式
│   ├── package.json
│   └── vite.config.js
├── backend/                 # Node.js 后端项目
│   ├── models/             # 数据模型
│   ├── routes/             # 路由处理
│   ├── middleware/         # 中间件
│   ├── server.js           # 服务器入口
│   └── package.json
├── package.json            # 根目录配置
├── README.md              # 项目说明
└── SETUP.md              # 设置指南
```

## 功能特性

### 用户系统
- ✅ 用户注册/登录
- ✅ JWT 身份认证
- ✅ 用户权限管理
- ✅ 个人资料管理

### 文章管理
- ✅ 文章 CRUD 操作
- ✅ 文章分类和标签
- ✅ 文章搜索功能
- ✅ 文章状态管理（草稿/发布）
- ✅ 文章浏览量统计

### 评论系统
- ✅ 文章评论
- ✅ 评论回复
- ✅ 评论点赞
- ✅ 评论管理

### 后台管理
- ✅ 文章管理界面
- ✅ 用户管理
- ✅ 分类管理
- ✅ 评论管理

### 其他功能
- ✅ 响应式设计
- ✅ 现代化 UI
- ✅ 搜索功能
- ✅ 分页功能
- ✅ 文件上传

## API 文档

### 认证相关

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456"
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "123456"
}
```

#### 获取用户信息
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### 文章相关

#### 获取文章列表
```http
GET /api/posts?page=1&limit=10&category=xxx&tag=xxx&search=xxx
```

#### 获取文章详情
```http
GET /api/posts/:id
```

#### 创建文章
```http
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "文章标题",
  "content": "文章内容",
  "excerpt": "文章摘要",
  "category": "分类ID",
  "tags": ["标签1", "标签2"],
  "status": "published"
}
```

#### 更新文章
```http
PUT /api/posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新后的标题",
  "content": "更新后的内容"
}
```

#### 删除文章
```http
DELETE /api/posts/:id
Authorization: Bearer <token>
```

### 评论相关

#### 获取文章评论
```http
GET /api/comments/post/:postId?page=1&limit=10
```

#### 创建评论
```http
POST /api/comments
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "评论内容",
  "postId": "文章ID",
  "parentId": "父评论ID（可选）"
}
```

## 部署指南

### 前端部署

1. 构建生产版本：
```bash
cd frontend
npm run build
```

2. 部署到服务器：
   - 将 `dist` 目录上传到 Web 服务器
   - 配置 Nginx 或其他 Web 服务器

### 后端部署

1. 安装 PM2：
```bash
npm install -g pm2
```

2. 启动应用：
```bash
cd backend
pm2 start server.js --name vue-blog
```

3. 设置开机自启：
```bash
pm2 startup
pm2 save
```

## 开发指南

### 添加新功能

1. **前端**：
   - 在 `frontend/src/views/` 创建新页面
   - 在 `frontend/src/router/index.js` 添加路由
   - 在 `frontend/src/stores/` 添加状态管理

2. **后端**：
   - 在 `backend/models/` 创建数据模型
   - 在 `backend/routes/` 创建路由处理
   - 在 `backend/server.js` 注册路由

### 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 遵循 Vue 3 Composition API 最佳实践
- 使用 TypeScript 类型注解（可选）

## 常见问题

### Q: MongoDB 连接失败
A: 确保 MongoDB 服务正在运行，检查连接字符串是否正确。

### Q: 前端无法访问后端 API
A: 检查 Vite 代理配置和 CORS 设置。

### Q: JWT 认证失败
A: 确保 JWT_SECRET 环境变量已正确设置。

### Q: 文件上传失败
A: 检查上传目录权限和文件大小限制。

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。
