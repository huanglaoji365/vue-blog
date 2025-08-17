@echo off
echo ========================================
echo WeBlog 项目初始化和启动脚本
echo ========================================
echo.

echo 1. 检查MongoDB连接...
cd backend
if not exist .env (
    echo 创建 .env 文件...
    copy env.example .env
    echo .env 文件已创建，请根据需要修改配置
)

echo.
echo 2. 初始化测试数据...
npm run init-data
if %errorlevel% neq 0 (
    echo 测试数据初始化失败，请检查MongoDB是否已启动
    pause
    exit /b 1
)

echo.
echo 3. 启动开发服务器...
cd ..
npm run dev

pause
