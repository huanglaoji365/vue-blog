#!/bin/bash

echo "========================================"
echo "WeBlog 项目初始化和启动脚本"
echo "========================================"
echo

echo "1. 检查MongoDB连接..."
cd backend

if [ ! -f .env ]; then
    echo "创建 .env 文件..."
    cp env.example .env
    echo ".env 文件已创建，请根据需要修改配置"
fi

echo
echo "2. 初始化测试数据..."
npm run init-data
if [ $? -ne 0 ]; then
    echo "测试数据初始化失败，请检查MongoDB是否已启动"
    exit 1
fi

echo
echo "3. 启动开发服务器..."
cd ..
npm run dev
