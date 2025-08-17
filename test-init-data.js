const fs = require('fs');
const path = require('path');

console.log('========================================');
console.log('测试数据初始化脚本验证');
console.log('========================================\n');

// 检查必要文件是否存在
const requiredFiles = [
  'backend/scripts/init-test-data.js',
  'backend/models/User.js',
  'backend/models/Category.js',
  'backend/models/Post.js',
  'backend/models/Comment.js',
  'backend/package.json',
  'backend/env.example'
];

console.log('检查必要文件...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
    allFilesExist = false;
  }
});

// 检查package.json中的脚本
console.log('\n检查package.json配置...');
try {
  const packageJson = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  if (packageJson.scripts && packageJson.scripts['init-data']) {
    console.log('✅ init-data脚本已配置');
  } else {
    console.log('❌ init-data脚本未配置');
    allFilesExist = false;
  }
} catch (error) {
  console.log('❌ 无法读取package.json文件');
  allFilesExist = false;
}

// 检查测试数据脚本内容
console.log('\n检查测试数据脚本内容...');
try {
  const scriptContent = fs.readFileSync('backend/scripts/init-test-data.js', 'utf8');
  const requiredFunctions = [
    'connectDB',
    'clearDatabase',
    'createUsers',
    'createCategories',
    'createPosts',
    'createComments',
    'initTestData'
  ];
  
  requiredFunctions.forEach(func => {
    if (scriptContent.includes(func)) {
      console.log(`✅ ${func}函数 - 存在`);
    } else {
      console.log(`❌ ${func}函数 - 不存在`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('❌ 无法读取测试数据脚本文件');
  allFilesExist = false;
}

// 检查README文档
console.log('\n检查文档...');
if (fs.existsSync('backend/scripts/README.md')) {
  console.log('✅ 测试数据脚本说明文档 - 存在');
} else {
  console.log('❌ 测试数据脚本说明文档 - 不存在');
  allFilesExist = false;
}

// 检查启动脚本
console.log('\n检查启动脚本...');
if (fs.existsSync('init-and-start.bat')) {
  console.log('✅ Windows启动脚本 - 存在');
} else {
  console.log('❌ Windows启动脚本 - 不存在');
  allFilesExist = false;
}

if (fs.existsSync('init-and-start.sh')) {
  console.log('✅ Linux/macOS启动脚本 - 存在');
} else {
  console.log('❌ Linux/macOS启动脚本 - 不存在');
  allFilesExist = false;
}

console.log('\n========================================');
if (allFilesExist) {
  console.log('🎉 所有测试数据初始化相关文件都已就绪！');
  console.log('\n使用方法：');
  console.log('1. 确保MongoDB已启动');
  console.log('2. 在backend目录下运行: npm run init-data');
  console.log('3. 或者使用一键启动脚本: ./init-and-start.bat (Windows) 或 ./init-and-start.sh (Linux/macOS)');
} else {
  console.log('⚠️  部分文件缺失，请检查项目结构');
}
console.log('========================================');
