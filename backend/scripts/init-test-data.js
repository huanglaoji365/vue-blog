const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
require('dotenv').config();

// 连接MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vue-blog');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

// 清空数据库
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Tag.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('数据库已清空');
  } catch (error) {
    console.error('清空数据库失败:', error);
  }
};

// 创建测试用户
const createUsers = async () => {
  const users = [
    {
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin',
      avatar: '',
      bio: '系统管理员，负责博客的整体管理'
    },
    {
      username: 'user1',
      email: 'user1@example.com',
      password: 'user123',
      role: 'user',
      avatar: '',
      bio: '普通用户，热爱阅读和分享'
    },
    {
      username: 'user2',
      email: 'user2@example.com',
      password: 'user123',
      role: 'user',
      avatar: '',
      bio: '技术爱好者，喜欢讨论新技术'
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    try {
      // 直接用明文密码，交由User模型加密
      const user = new User(userData);
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`用户已创建: ${savedUser.username}`);
    } catch (err) {
      console.error(`用户创建失败: ${userData.username}`, err.message);
    }
  }
  return createdUsers;
};

// 创建测试分类
const createCategories = async () => {
  const categories = [
    {
      name: '技术分享',
      description: '分享最新的技术动态和开发经验',
      slug: 'tech',
      isActive: true
    },
    {
      name: '生活随笔',
      description: '记录生活中的点滴感悟',
      slug: 'life',
      isActive: true
    },
    {
      name: '学习笔记',
      description: '学习过程中的心得体会',
      slug: 'study',
      isActive: true
    },
    {
      name: '项目展示',
      description: '个人项目的展示和介绍',
      slug: 'projects',
      isActive: true
    }
  ];

  const createdCategories = [];
  for (const categoryData of categories) {
    const category = new Category(categoryData);
    const savedCategory = await category.save();
    createdCategories.push(savedCategory);
    console.log(`分类已创建: ${savedCategory.name}`);
  }
  return createdCategories;
};

// 创建测试标签
const createTags = async () => {
  const tags = [
    {
      name: 'JavaScript',
      description: 'JavaScript 编程语言相关'
    },
    {
      name: 'Vue3',
      description: 'Vue.js 3.x 版本相关'
    },
    {
      name: 'Node.js',
      description: 'Node.js 后端开发'
    },
    {
      name: 'MongoDB',
      description: 'MongoDB 数据库'
    },
    {
      name: '前端',
      description: '前端开发技术'
    },
    {
      name: '后端',
      description: '后端开发技术'
    },
    {
      name: '性能优化',
      description: '性能优化相关'
    },
    {
      name: '学习心得',
      description: '学习过程中的心得体会'
    },
    {
      name: '项目经验',
      description: '项目开发经验分享'
    },
    {
      name: '数据库',
      description: '数据库相关技术'
    },
    {
      name: 'NoSQL',
      description: 'NoSQL 数据库技术'
    }
  ];

  const createdTags = [];
  for (const tagData of tags) {
    const tag = new Tag(tagData);
    const savedTag = await tag.save();
    createdTags.push(savedTag);
    console.log(`标签已创建: ${savedTag.name}`);
  }
  return createdTags;
};

// 创建测试文章
const createPosts = async (users, categories, tags) => {
  const posts = [
    {
      title: 'Vue3 组合式API详解',
      content: `# Vue3 组合式API详解\n\nVue3的组合式API是一个革命性的特性，它为我们提供了更好的代码组织和逻辑复用能力。`,
      excerpt: 'Vue3的组合式API是一个革命性的特性，它为我们提供了更好的代码组织和逻辑复用能力。',
      author: users[1]._id, // editor
      category: categories[0]._id, // 技术分享
      tags: [tags[0]._id, tags[1]._id, tags[4]._id], // JavaScript, Vue3, 前端
      status: 'published',
      featured: true,
      coverImage: ''
    },
    {
      title: 'Node.js 性能优化实践',
      content: `# Node.js 性能优化实践\n\nNode.js作为服务器端JavaScript运行环境，性能优化是开发过程中不可忽视的重要环节。`,
      excerpt: 'Node.js作为服务器端JavaScript运行环境，性能优化是开发过程中不可忽视的重要环节。',
      author: users[0]._id, // admin
      category: categories[0]._id, // 技术分享
      tags: [tags[2]._id, tags[6]._id, tags[5]._id], // Node.js, 性能优化, 后端
      status: 'published',
      featured: true,
      coverImage: ''
    },
    {
      title: 'MongoDB 数据库设计最佳实践',
      content: `# MongoDB 数据库设计最佳实践\n\nMongoDB作为NoSQL数据库的代表，其设计理念与传统关系型数据库有很大不同。`,
      excerpt: 'MongoDB作为NoSQL数据库的代表，其设计理念与传统关系型数据库有很大不同。',
      author: users[1]._id, // editor
      category: categories[0]._id, // 技术分享
      tags: [tags[3]._id, tags[9]._id, tags[10]._id], // MongoDB, 数据库, NoSQL
      status: 'published',
      featured: false,
      coverImage: ''
    },
    {
      title: '我的第一个Vue项目',
      content: `# 我的第一个Vue项目\n\n今天我想分享一下我创建第一个Vue项目的经历和心得。`,
      excerpt: '今天我想分享一下我创建第一个Vue项目的经历和心得。',
      author: users[2]._id, // user1
      category: categories[1]._id, // 生活随笔
      tags: [tags[1]._id, tags[8]._id, tags[7]._id], // Vue3, 项目经验, 学习心得
      status: 'published',
      featured: false,
      coverImage: ''
    },
    {
      title: '学习JavaScript的心得体会',
      content: `# 学习JavaScript的心得体会\n\nJavaScript作为前端开发的核心语言，学习过程中有很多值得分享的心得。`,
      excerpt: 'JavaScript作为前端开发的核心语言，学习过程中有很多值得分享的心得。',
      author: users[2]._id, // user2
      category: categories[2]._id, // 学习笔记
      tags: [tags[0]._id, tags[7]._id, tags[4]._id], // JavaScript, 学习心得, 前端
      status: 'published',
      featured: false,
      coverImage: ''
    }
  ];

  const createdPosts = [];
  for (const postData of posts) {
    const post = new Post(postData);
    const savedPost = await post.save();
    createdPosts.push(savedPost);
    console.log(`文章已创建: ${savedPost.title}`);
  }
  return createdPosts;
};

// 创建测试评论
const createComments = async (users, posts) => {
  const comments = [
    {
      content: '这篇文章写得很好，对我帮助很大！',
      author: users[2]._id, // user1
      post: posts[0]._id, // Vue3文章
      approved: true
    },
    {
      content: '感谢分享，学到了很多新知识。',
      author: users[2]._id, // user1
      post: posts[0]._id, // Vue3文章
      approved: true
    },
    {
      content: '性能优化确实很重要，这些建议很实用。',
      author: users[2]._id, // user1
      post: posts[1]._id, // Node.js文章
      approved: true
    },
    {
      content: 'MongoDB的设计原则讲得很清楚，谢谢！',
      author: users[2]._id, // user1
      post: posts[2]._id, // MongoDB文章
      approved: true
    },
    {
      content: '我也在学习Vue3，这篇文章很有参考价值。',
      author: users[1]._id, // editor
      post: posts[3]._id, // 第一个Vue项目
      approved: true
    }
  ];

  const createdComments = [];
  for (const commentData of comments) {
    const comment = new Comment(commentData);
    const savedComment = await comment.save();
    createdComments.push(savedComment);
    console.log(`评论已创建: ${savedComment.content.substring(0, 20)}...`);
  }
  return createdComments;
};

// 更新标签使用次数
const updateTagCounts = async (posts) => {
  for (const post of posts) {
    if (post.tags.length > 0) {
      await Tag.updateMany(
        { _id: { $in: post.tags } },
        { $inc: { count: 1 } }
      );
    }
  }
  console.log('标签使用次数已更新');
};

// 主函数
const initTestData = async () => {
  try {
    await connectDB();
    await clearDatabase();
    
    console.log('\n开始创建测试数据...\n');
    
    const users = await createUsers();
    const categories = await createCategories();
    const tags = await createTags();
    const posts = await createPosts(users, categories, tags);
    const comments = await createComments(users, posts);
    await updateTagCounts(posts);
    
    console.log('\n测试数据创建完成！');
    console.log(`\n创建的数据统计:`);
    console.log(`- 用户: ${users.length}个`);
    console.log(`- 分类: ${categories.length}个`);
    console.log(`- 标签: ${tags.length}个`);
    console.log(`- 文章: ${posts.length}篇`);
    console.log(`- 评论: ${comments.length}条`);
    
    console.log('\n默认用户账号:');
    console.log('管理员: admin@example.com / admin123');
    console.log('用户1: user1@example.com / user123');
    console.log('用户2: user2@example.com / user123');
    
    process.exit(0);
  } catch (error) {
    console.error('初始化测试数据失败:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  initTestData();
}

module.exports = { initTestData };