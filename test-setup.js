const fs = require('fs')
const path = require('path')

console.log('🔍 检查 WeBlog 项目设置...\n')

// 检查必要的目录和文件
const requiredFiles = [
  'package.json',
  'frontend/package.json',
  'backend/package.json',
  'frontend/src/main.js',
  'frontend/src/App.vue',
  'backend/server.js',
  'README.md',
  'SETUP.md'
]

const requiredDirs = [
  'frontend/src',
  'frontend/src/components',
  'frontend/src/views',
  'frontend/src/stores',
  'frontend/src/router',
  'frontend/src/utils',
  'backend/models',
  'backend/routes',
  'backend/middleware'
]

let allGood = true

// 检查文件
console.log('📁 检查必要文件...')
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - 缺失`)
    allGood = false
  }
})

console.log('\n📂 检查必要目录...')
requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ ${dir}/`)
  } else {
    console.log(`❌ ${dir}/ - 缺失`)
    allGood = false
  }
})

// 检查 package.json 内容
console.log('\n📦 检查 package.json 配置...')
try {
  const rootPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  if (rootPackage.scripts && rootPackage.scripts.dev) {
    console.log('✅ 根目录 package.json 配置正确')
  } else {
    console.log('❌ 根目录 package.json 缺少必要脚本')
    allGood = false
  }
} catch (error) {
  console.log('❌ 根目录 package.json 解析失败')
  allGood = false
}

// 检查环境变量示例文件
console.log('\n🔧 检查环境配置...')
if (fs.existsSync('backend/env.example')) {
  console.log('✅ 环境变量示例文件存在')
} else {
  console.log('❌ 环境变量示例文件缺失')
  allGood = false
}

// 检查启动脚本
console.log('\n🚀 检查启动脚本...')
if (fs.existsSync('start.bat') && fs.existsSync('start.sh')) {
  console.log('✅ 启动脚本存在')
} else {
  console.log('❌ 启动脚本缺失')
  allGood = false
}

console.log('\n' + '='.repeat(50))

if (allGood) {
  console.log('🎉 项目设置检查完成！所有必要文件都已创建。')
  console.log('\n📋 下一步：')
  console.log('1. 运行 npm run install:all 安装依赖')
  console.log('2. 在 backend 目录下创建 .env 文件')
  console.log('3. 启动 MongoDB 服务')
  console.log('4. 运行 npm run dev 启动开发服务器')
  console.log('\n📖 详细说明请查看 SETUP.md 文件')
} else {
  console.log('⚠️  项目设置检查发现问题，请检查上述缺失的文件和目录。')
}

console.log('\n' + '='.repeat(50))
