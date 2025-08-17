<template>
  <div class="app-container">
    <!-- 未登录提示 -->
    <LoginPrompt v-if="!authStore.isAuthenticated" />
    
    <!-- 已登录内容 -->
    <div v-else>
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="box-card">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #409eff;">
              <el-icon size="24"><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.posts }}</div>
              <div class="stat-label">文章总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #67c23a;">
              <el-icon size="24"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.users }}</div>
              <div class="stat-label">用户总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #e6a23c;">
              <el-icon size="24"><ChatDotRound /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.comments }}</div>
              <div class="stat-label">评论总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="box-card">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #f56c6c;">
              <el-icon size="24"><View /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.views }}</div>
              <div class="stat-label">总浏览量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>最近文章</span>
              <el-button type="text" @click="$router.push('/admin/posts')">查看更多</el-button>
            </div>
          </template>
          <div class="recent-posts">
            <div v-if="recentPosts.length === 0" class="empty-data">
              <el-empty description="暂无数据" />
            </div>
            <div v-else class="post-list">
              <div 
                v-for="post in recentPosts" 
                :key="post._id" 
                class="post-item"
                @click="viewPost(post)"
              >
                <div class="post-title">{{ post.title }}</div>
                <div class="post-meta">
                  <span>{{ post.author?.username }}</span>
                  <span>{{ parseTime(post.createdAt) }}</span>
                  <span>浏览 {{ post.views }}</span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>最近评论</span>
              <el-button type="text" @click="$router.push('/admin/comments')">查看更多</el-button>
            </div>
          </template>
          <div class="recent-comments">
            <div v-if="recentComments.length === 0" class="empty-data">
              <el-empty description="暂无数据" />
            </div>
            <div v-else class="comment-list">
              <div 
                v-for="comment in recentComments" 
                :key="comment._id" 
                class="comment-item"
              >
                <div class="comment-content">{{ comment.content }}</div>
                <div class="comment-meta">
                  <span>{{ comment.author?.username }}</span>
                  <span>{{ parseTime(comment.createdAt) }}</span>
                  <el-tag 
                    :type="comment.isApproved ? 'success' : 'warning'" 
                    size="small"
                  >
                    {{ comment.isApproved ? '已审核' : '待审核' }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 系统信息 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="24">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>系统信息</span>
            </div>
          </template>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="系统名称">We Blog 管理系统</el-descriptions-item>
            <el-descriptions-item label="系统版本">v1.0.0</el-descriptions-item>
            <el-descriptions-item label="Node版本">{{ systemInfo.nodeVersion }}</el-descriptions-item>
            <el-descriptions-item label="数据库">MongoDB</el-descriptions-item>
            <el-descriptions-item label="前端框架">Vue 3 + Element Plus</el-descriptions-item>
            <el-descriptions-item label="后端框架">Node.js</el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>
    </div>
  </div>
</template>

<script setup name="Dashboard">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useStatsApi } from '@/hooks/useStatsApi'
import { usePostsApi } from '@/hooks/usePostsApi'
import { useCommentsApi } from '@/hooks/useCommentsApi'
import LoginPrompt from '@/components/LoginPrompt.vue'

const authStore = useAuthStore()
const statsApi = useStatsApi();
const postsApi = usePostsApi();
const commentsApi = useCommentsApi();

const stats = ref({
  posts: 0,
  users: 0,
  comments: 0,
  views: 0
})

const recentPosts = ref([])
const recentComments = ref([])
const systemInfo = ref({
  nodeVersion: 'v20.19.3'
})

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await statsApi.getStats()
    stats.value = response.data
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最近文章
const fetchRecentPosts = async () => {
  try {
    const response = await postsApi.fetchPosts({ limit: 5 })
    recentPosts.value = response.data.posts
  } catch (error) {
    console.error('获取最近文章失败:', error)
  }
}

// 获取最近评论
const fetchRecentComments = async () => {
  try {
    const response = await commentsApi.getComments({ limit: 5 })
    recentComments.value = response.data.comments
  } catch (error) {
    console.error('获取最近评论失败:', error)
  }
}

// 查看文章
const viewPost = (post) => {
  window.open(`/posts/${post._id}`, '_blank')
}

// 时间格式化
const parseTime = (time) => {
  if (!time) return ''
  return new Date(time).toLocaleDateString('zh-CN')
}

onMounted(() => {
  fetchStats()
  fetchRecentPosts()
  fetchRecentComments()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 10px 0;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 16px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.post-list, .comment-list {
  max-height: 300px;
  overflow-y: auto;
}

.post-item, .comment-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.post-item:last-child, .comment-item:last-child {
  border-bottom: none;
}

.post-item:hover, .comment-item:hover {
  background-color: #f5f7fa;
  padding-left: 8px;
  padding-right: 8px;
  margin: 0 -8px;
  border-radius: 4px;
}

.post-title {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-meta, .comment-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.comment-content {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.empty-data {
  padding: 40px 0;
  text-align: center;
}
</style>
