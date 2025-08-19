const express = require('express')
const Post = require('../models/Post')
const User = require('../models/User')
const Comment = require('../models/Comment')
const Category = require('../models/Category')
const Tag = require('../models/Tag')
const { auth, admin } = require('../middleware/auth')

const router = express.Router()

// 获取管理员统计数据 - 需要管理员权限
router.get('/', auth, admin, async (req, res) => {
  try {
    // 获取基础统计数据
    const [
      totalUsers,
      totalPosts,
      totalComments,
      totalCategories,
      totalTags,
      publishedPosts,
      draftPosts,
      totalViews,
      totalLikes
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Comment.countDocuments(),
      Category.countDocuments(),
      Tag.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
      Post.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]),
      Post.aggregate([
        { $group: { _id: null, totalLikes: { $sum: { $size: '$likes' } } } }
      ])
    ])

    // 获取最近7天的数据统计
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const [
      newUsersLast7Days,
      newPostsLast7Days,
      newCommentsLast7Days
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Post.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Comment.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ])

    // 获取最近30天的数据统计
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [
      newUsersLast30Days,
      newPostsLast30Days,
      newCommentsLast30Days
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Post.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Comment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    ])

    // 获取热门文章（按浏览量排序）
    const topPosts = await Post.find({ status: 'published' })
      .select('title views likes createdAt')
      .populate('author', 'username')
      .sort({ views: -1 })
      .limit(10)

    // 获取活跃用户（按文章数量排序）
    const activeUsers = await User.aggregate([
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'author',
          as: 'posts'
        }
      },
      {
        $project: {
          username: 1,
          avatar: 1,
          postCount: { $size: '$posts' }
        }
      },
      { $sort: { postCount: -1 } },
      { $limit: 10 }
    ])

    // 获取分类统计
    const categoryStats = await Post.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          categoryName: { $first: { $arrayElemAt: ['$categoryInfo.name', 0] } }
        }
      },
      { $sort: { count: -1 } }
    ])

    // 获取标签统计
    const tagStats = await Post.aggregate([
      { $unwind: '$tags' },
      {
        $lookup: {
          from: 'tags',
          localField: 'tags',
          foreignField: '_id',
          as: 'tagInfo'
        }
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 },
          tagName: { $first: { $arrayElemAt: ['$tagInfo.name', 0] } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ])

    // 获取月度文章发布趋势（最近12个月）
    const monthlyPostTrend = await Post.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1) // 今年开始
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    // 计算总浏览量和总点赞数
    const totalViewsCount = totalViews.length > 0 ? totalViews[0].totalViews : 0
    const totalLikesCount = totalLikes.length > 0 ? totalLikes[0].totalLikes : 0

    // 计算增长率
    const userGrowthRate = totalUsers > 0 ? ((newUsersLast7Days / totalUsers) * 100).toFixed(2) : 0
    const postGrowthRate = totalPosts > 0 ? ((newPostsLast7Days / totalPosts) * 100).toFixed(2) : 0
    const commentGrowthRate = totalComments > 0 ? ((newCommentsLast7Days / totalComments) * 100).toFixed(2) : 0

    res.json({
      overview: {
        totalUsers,
        totalPosts,
        totalComments,
        totalCategories,
        totalTags,
        publishedPosts,
        draftPosts,
        totalViews: totalViewsCount,
        totalLikes: totalLikesCount
      },
      recentActivity: {
        last7Days: {
          newUsers: newUsersLast7Days,
          newPosts: newPostsLast7Days,
          newComments: newCommentsLast7Days
        },
        last30Days: {
          newUsers: newUsersLast30Days,
          newPosts: newPostsLast30Days,
          newComments: newCommentsLast30Days
        }
      },
      growthRates: {
        userGrowthRate: parseFloat(userGrowthRate),
        postGrowthRate: parseFloat(postGrowthRate),
        commentGrowthRate: parseFloat(commentGrowthRate)
      },
      topPosts,
      activeUsers,
      categoryStats,
      tagStats,
      monthlyPostTrend
    })

  } catch (error) {
    console.error('获取统计数据失败:', error)
    res.status(500).json({ message: '获取统计数据失败' })
  }
})

// 获取实时统计数据（可选，用于实时更新）
router.get('/realtime', auth, admin, async (req, res) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const [
      todayPosts,
      todayComments,
      todayUsers
    ] = await Promise.all([
      Post.countDocuments({ createdAt: { $gte: today } }),
      Comment.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: today } })
    ])

    res.json({
      today: {
        posts: todayPosts,
        comments: todayComments,
        users: todayUsers
      },
      timestamp: now
    })

  } catch (error) {
    console.error('获取实时统计数据失败:', error)
    res.status(500).json({ message: '获取实时统计数据失败' })
  }
})

module.exports = router
