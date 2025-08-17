@echo off
echo 正在启动 WeBlog 项目...

echo.
echo 1. 安装依赖...
call npm run install:all

echo.
echo 2. 启动开发服务器...
echo 前端将在 http://localhost:5173 运行
echo 后端将在 http://localhost:3000 运行
echo.
call npm run dev

pause
