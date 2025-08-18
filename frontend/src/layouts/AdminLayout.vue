<template>
  <div class="admin-layout">
    <!-- 未登录时显示登录提示 -->
    <div v-if="!authStore.isAuthenticated" class="login-prompt-container">
      <el-card class="login-prompt-card">
        <div class="login-prompt-content">
          <el-icon size="64" color="#409eff"><Lock /></el-icon>
          <h2>需要登录</h2>
          <p>您需要登录后才能访问管理后台</p>
          <div class="login-actions">
            <el-button type="primary" size="large" @click="$router.push('/login')">
              立即登录
            </el-button>
            <el-button size="large" @click="$router.push('/register')">
              注册账号
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
    
    <!-- 已登录时显示管理布局 -->
    <template v-else>
    <!-- Left Sidebar -->
    <div class="admin-sidebar" :class="{ collapsed: sidebarCollapsed }">
             <div class="sidebar-header">
         <div class="logo">
           <el-icon size="24"><Setting /></el-icon>
           <span v-show="!sidebarCollapsed">后台管理</span>
         </div>
       </div>
      
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="sidebarCollapsed"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/admin" @click="$router.push('/admin')">
          <el-icon><House /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        
        <el-sub-menu index="content">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/admin/posts">
            <el-icon><Document /></el-icon>
            <template #title>文章管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <el-icon><Folder /></el-icon>
            <template #title>分类管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/tags">
            <el-icon><Collection /></el-icon>
            <template #title>标签管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/comments">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>评论管理</template>
          </el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="user">
          <template #title>
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </template>
          <el-menu-item index="/admin/users">
            <el-icon><User /></el-icon>
            <template #title>用户列表</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>
    
    <!-- Main Content Area -->
    <div class="admin-main">
      <!-- Top Header -->
             <div class="admin-header">
         <div class="header-left">
           <el-button
             type="text"
             @click="toggleSidebar"
             class="collapse-btn"
             style="margin-right: 16px;"
           >
             <el-icon><Fold v-if="!sidebarCollapsed" /><Expand v-else /></el-icon>
           </el-button>
           <el-breadcrumb separator="/">
             <el-breadcrumb-item :to="{ path: '/admin' }">首页</el-breadcrumb-item>
             <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path" :to="item.path">
               {{ item.name }}
             </el-breadcrumb-item>
           </el-breadcrumb>
         </div>
        
        <div class="header-right">
          <div v-if="authStore.isAuthenticated" class="user-info">
            <el-dropdown @command="handleUserCommand">
              <div class="user-info">
                <el-avatar :size="32" :src="user?.avatar">
                  {{ user?.username?.charAt(0)?.toUpperCase() }}
                </el-avatar>
                <span class="username">{{ user?.username }}</span>
                <el-icon><ArrowDown /></el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

        </div>
      </div>
      
      <!-- Tags View Container -->
      <TagsView />
      
      <!-- Main Content -->
      <div class="admin-content">
        <router-view :key="refreshKey" />
      </div>
    </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import { ElMessageBox } from 'element-plus'
import TagsView from '@/components/TagsView.vue'
import {
  Setting,
  Fold,
  Expand,
  House,
  Document,
  Folder,
  Collection,
  ChatDotRound,
  User,
  ArrowDown,
  Lock
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const appStore = useAppStore()

const sidebarCollapsed = ref(false)

const { user } = authStore
const { refreshKey } = storeToRefs(appStore)

// 计算当前激活的菜单项
const activeMenu = computed(() => route.path)

// 计算面包屑导航
const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta && item.meta.title)
  return matched.map(item => ({
    name: item.meta.title,
    path: item.path
  }))
})

// 切换侧边栏
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
  localStorage.setItem('sidebarCollapsed', sidebarCollapsed.value.toString())
}



// 处理用户下拉菜单命令
const handleUserCommand = async (command) => {
  if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      authStore.logout()
      router.push('/login')
    } catch (error) {
      // 用户取消
    }
  } else if (command === 'profile') {
    // 跳转到个人资料页面
    router.push('/admin/profile')
  }
}



onMounted(() => {
  // 恢复侧边栏状态
  const collapsed = localStorage.getItem('sidebarCollapsed')
  if (collapsed !== null) {
    sidebarCollapsed.value = collapsed === 'true'
  }
})
</script>

<style scoped>
.admin-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.admin-sidebar {
  width: 240px;
  background-color: #001529;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  flex-shrink: 0;
}

.admin-sidebar.collapsed {
  width: 64px;
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid #1f2937;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #fff;
  font-weight: 600;
  font-size: 16px;
}

.sidebar-menu {
  flex: 1;
  border: none;
}

.admin-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  min-width: 0;
}

.admin-header {
  height: 60px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  color: #666;
  border: none;
  background: transparent;
  font-size: 16px;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  color: #409eff;
  background-color: #f0f9ff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #f3f4f6;
}

.username {
  font-weight: 500;
  color: #374151;
}



.login-prompt-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 40px;
  background: #f0f2f5;
}

.login-prompt-card {
  max-width: 400px;
  width: 100%;
}

.login-prompt-content {
  text-align: center;
  padding: 40px 20px;
}

.login-prompt-content h2 {
  margin: 20px 0 10px 0;
  color: #303133;
  font-size: 24px;
}

.login-prompt-content p {
  margin: 0 0 30px 0;
  color: #606266;
  font-size: 16px;
}

.login-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}



.admin-content {
  flex: 1;
  overflow: auto;
  background: #f0f2f5;
  padding: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    z-index: 1000;
    height: 100vh;
  }
  
  .admin-main {
    margin-left: 0;
    width: 100%;
  }
  
  .admin-header {
    padding: 0 16px;
  }
}
</style>
