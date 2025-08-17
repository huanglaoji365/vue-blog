<template>
  <div class="admin-page">
    <Header />
    
    <div class="container">
      <div class="page-header">
        <h1>后台管理</h1>
        <div class="header-actions">
          <el-button type="primary" @click="refreshStats" :loading="refreshing">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
      
      <div class="content-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="management-card" @click="$router.push('/admin/posts')">
              <div class="card-content">
                <el-icon class="card-icon"><Document /></el-icon>
                <h3>文章管理</h3>
                <p>管理博客文章，包括创建、编辑、删除文章</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="management-card" @click="$router.push('/admin/users')">
              <div class="card-content">
                <el-icon class="card-icon"><User /></el-icon>
                <h3>用户管理</h3>
                <p>管理系统用户，包括用户信息、权限管理</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="management-card" @click="$router.push('/admin/categories')">
              <div class="card-content">
                <el-icon class="card-icon"><Folder /></el-icon>
                <h3>分类管理</h3>
                <p>管理文章分类，组织文章结构</p>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="6">
            <el-card class="management-card" @click="$router.push('/admin/tags')">
              <div class="card-content">
                <el-icon class="card-icon"><Collection /></el-icon>
                <h3>标签管理</h3>
                <p>管理文章标签，便于文章分类和搜索</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="6">
            <el-card class="management-card" @click="$router.push('/admin/comments')">
              <div class="card-content">
                <el-icon class="card-icon"><ChatDotRound /></el-icon>
                <h3>评论管理</h3>
                <p>管理文章评论，包括审核、删除评论</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <div class="dashboard-stats">
          <h2>统计概览</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon size="32"><Document /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.posts }}</div>
                <div class="stat-label">文章总数</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon size="32"><User /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.users }}</div>
                <div class="stat-label">用户总数</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon size="32"><ChatDotRound /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.comments }}</div>
                <div class="stat-label">评论总数</div>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">
                <el-icon size="32"><View /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stats.views }}</div>
                <div class="stat-label">总浏览量</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated } from 'vue'
import { Document, User, Folder, ChatDotRound, View, Collection, Refresh } from '@element-plus/icons-vue'
import { api } from '@/utils/api'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'

const stats = ref({
  posts: 0,
  users: 0,
  comments: 0,
  views: 0
})

const refreshing = ref(false)

const fetchStats = async () => {
  try {
    // 这里可以添加获取统计数据的API调用
    // 暂时使用模拟数据
    stats.value = {
      posts: 25,
      users: 150,
      comments: 89,
      views: 1250
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

const refreshStats = async () => {
  refreshing.value = true
  try {
    await fetchStats()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    refreshing.value = false
  }
}

onMounted(() => {
  fetchStats()
})

// 当组件被激活时（比如从其他页面返回）自动刷新数据
onActivated(() => {
  fetchStats()
})
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.page-header h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 2rem;
  font-weight: bold;
}

.content-section {
  padding: 20px 0;
}

.admin-menu {
  margin-bottom: 40px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.menu-item {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 20px;
}

.menu-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.menu-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.menu-content h3 {
  margin: 0 0 10px 0;
  color: var(--text-color);
  font-size: 1.3rem;
  font-weight: 600;
}

.menu-content p {
  margin: 0;
  color: var(--text-color-regular);
  line-height: 1.5;
}

.dashboard-stats h2 {
  margin-bottom: 20px;
  color: var(--text-color);
  font-size: 1.5rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-color);
  line-height: 1;
}

.stat-label {
  color: var(--text-color-regular);
  font-size: 0.9rem;
  margin-top: 4px;
}

.management-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: white;
}

.management-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-content h3 {
  margin: 0 0 8px 0;
  color: var(--text-color);
  font-size: 1.1rem;
  font-weight: 600;
}

.card-content p {
  margin: 0;
  color: var(--text-color-regular);
  font-size: 0.9rem;
}

.card-icon {
  color: var(--primary-color);
  font-size: 2.5rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .menu-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .menu-item {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
}
</style>