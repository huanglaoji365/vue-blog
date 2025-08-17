# Vue3 + Node.js + MongoDB 个人博客模板

一个现代化的全栈个人博客系统，使用 Vue3、Node.js 和 MongoDB 构建。

## 功能特性

- 🎨 现代化 UI 设计，响应式布局
- 👤 用户认证系统（登录/注册）
- 📝 文章管理系统（CRUD）
- 💬 评论系统
- 🏷️ 标签和分类管理
- 🔐 后台管理界面
- 📱 移动端适配

## 技术栈

### 前端
- Vue 3 (Composition API)
- Vite
- Vue Router 4
- Pinia (状态管理)
- Element Plus (UI组件库)
- Axios (HTTP客户端)

### 后端
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (身份认证)
- bcryptjs (密码加密)
- multer (文件上传)

## 项目结构

```
vue-blog/
├── frontend/          # Vue3 前端项目
├── backend/           # Node.js 后端项目
├── package.json       # 根目录配置
└── README.md         # 项目说明
```

## 快速开始

### 1. 安装依赖

```bash
npm run install:all
```

### 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/vue-blog
JWT_SECRET=your-jwt-secret
```

### 3. 初始化测试数据（可选）

如果你想快速体验系统功能，可以运行测试数据初始化脚本：

```bash
# 进入backend目录
cd backend

# 运行测试数据初始化
npm run init-data
```

这将创建以下测试数据：
- 4个测试用户（管理员、编辑、2个普通用户）
- 4个分类（技术分享、生活随笔、学习笔记、项目展示）
- 5篇测试文章
- 相应的评论数据

**默认用户账号：**
- 管理员: `admin@example.com` / `admin123`
- 编辑: `editor@example.com` / `editor123`
- 用户1: `user1@example.com` / `user123`
- 用户2: `user2@example.com` / `user123`

### 4. 启动开发服务器

```bash
# 一键启动（包含测试数据初始化）
./init-and-start.bat  # Windows
./init-and-start.sh   # Linux/macOS

# 或者手动启动
npm run dev
```

前端将在 http://localhost:5173 运行
后端将在 http://localhost:3000 运行

### 5. 构建生产版本

```bash
npm run build
npm start
```

## API 文档

### 用户相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/profile` - 获取用户信息

### 文章相关
- `GET /api/posts` - 获取文章列表
- `GET /api/posts/:id` - 获取文章详情
- `POST /api/posts` - 创建文章
- `PUT /api/posts/:id` - 更新文章
- `DELETE /api/posts/:id` - 删除文章

### 评论相关
- `GET /api/posts/:id/comments` - 获取文章评论
- `POST /api/posts/:id/comments` - 添加评论
- `DELETE /api/comments/:id` - 删除评论

## 开发指南

### 前端开发
1. 进入 `frontend` 目录
2. 运行 `npm run dev` 启动开发服务器
3. 修改代码后会自动热重载

### 后端开发
1. 进入 `backend` 目录
2. 运行 `npm run dev` 启动开发服务器
3. 使用 nodemon 自动重启

## 部署

### 前端部署
```bash
cd frontend
npm run build
```

### 后端部署
```bash
cd backend
npm start
```

## 许可证

MIT License
