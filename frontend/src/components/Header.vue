<template>
  <div class="header-container">
    <el-header class="header">
      <div class="container">
        <div class="header-content">
          <!-- 移动端侧边栏按钮 -->
          <div class="mobile-toggle" @click="toggleHeader">
            <span class="toggle-icon">
              {{ isExpanded ? '✕' : '☰' }}
            </span>
          </div>
          <div class="logo">
            <router-link to="/">
              <h1>WeBlog</h1>
            </router-link>
          </div>
          <!-- 桌面端导航菜单 -->
          <el-menu :default-active="activeIndex" mode="horizontal" class="nav-menu desktop-nav" router :ellipsis="false">
            <el-menu-item v-for="item in menuList" :key="item.index" :index="item.index">
              {{ item.label }}
            </el-menu-item>
          </el-menu>
          <!-- 桌面端搜索栏 -->
          <div class="page-header desktop-search" @click.stop>
            <div class="search-bar">
              <CustomSearch />
            </div>
          </div>
          <!-- 桌面端用户操作 -->
          <div class="user-actions desktop-user" @click.stop>
            <template v-if="isAuthenticated && user">
              <el-dropdown @command="handleCommand">
                <span class="user-info">
                  <el-avatar :size="28" :src="user.avatar">
                    {{ user.username?.charAt(0) }}
                  </el-avatar>
                  <span class="username">{{ user.username }}</span>
                  <el-icon>
                    <ArrowDown />
                  </el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                    <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
            <template v-else>
              <el-button type="primary" @click="$router.push('/login')">
                登录
              </el-button>
              <el-button @click="$router.push('/register')">
                注册
              </el-button>
            </template>
          </div>
        </div>
      </div>
    </el-header>

    <!-- 移动端侧边栏 -->
    <div class="mobile-sidebar" :class="{ open: isExpanded }">
      <div class="sidebar-overlay" @click="toggleHeader"></div>
      <div class="sidebar-content">
        <div class="sidebar-header">
          <h2>WeBlog</h2>
          <button class="close-btn" @click="toggleHeader">✕</button>
        </div>
        <nav class="sidebar-nav">
          <router-link 
            v-for="item in menuList" 
            :key="item.index" 
            :to="item.index" 
            class="sidebar-nav-item"
            :class="{ active: activeIndex === item.index }"
            @click="toggleHeader"
          >
            {{ item.label }}
          </router-link>
        </nav>
        <div class="sidebar-search">
          <CustomSearch />
        </div>
        <div class="sidebar-user">
          <template v-if="isAuthenticated && user">
            <div class="user-profile">
              <el-avatar :size="48" :src="user.avatar">
                {{ user.username?.charAt(0) }}
              </el-avatar>
              <div class="user-info">
                <h3>{{ user.username }}</h3>
                <p>欢迎回来</p>
              </div>
            </div>
            <div class="user-actions">
              <el-button @click="handleCommand('profile')" class="profile-btn">
                个人资料
              </el-button>
              <el-button @click="handleCommand('logout')" type="danger">
                退出登录
              </el-button>
            </div>
          </template>
          <template v-else>
            <div class="login-section">
              <h3>登录账户</h3>
              <p>登录后享受更多功能</p>
              <div class="auth-buttons">
                <el-button type="primary" @click="$router.push('/login')" class="login-btn">
                  登录
                </el-button>
                <el-button @click="$router.push('/register')" class="register-btn">
                  注册
                </el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElAvatar } from 'element-plus'
import CustomSearch from '@/components/CustomSearch.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 使用 storeToRefs 来保持响应性
const { user, isAuthenticated, isAdmin } = storeToRefs(authStore)

const activeIndex = computed(() => {
  // 处理根路径的特殊情况
  if (route.path === '/') return '/'
  // 对于其他路径，检查是否以该路径开头
  if (route.path.startsWith('/posts')) return '/posts'
  return route.path
})

const menuList = [
  { index: '/', label: '首页' },
  { index: '/posts', label: '文章' },
]

const handleCommand = (command) => {
  if (command === 'logout') {
    authStore.logout()
    router.push('/')
  } else if (command === 'profile') {
    router.push('/profile')
  }
}

// 移动端侧边栏展开/折叠控制
const isExpanded = ref(false)

const toggleHeader = () => {
  isExpanded.value = !isExpanded.value
  console.log('Header expanded:', isExpanded.value)
}

// 监听路由变化，自动折叠侧边栏
watch(route, () => {
  if (isExpanded.value) {
    isExpanded.value = false
  }
})
</script>

<style scoped>
.header-container {
  position: relative;
}

.header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  width: 100%;
  /* 确保不会影响搜索模态框的显示 */
  contain: layout style;
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  min-height: 60px;
  gap: 20px;
  flex-wrap: wrap;
}

.logo a {
  text-decoration: none;
  color: var(--primary-color);
  transition: all 0.3s ease;
  display: block;
}

.logo a:hover {
  transform: scale(1.05);
}

.logo h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(64, 158, 255, 0.1);
}

.nav-menu {
  min-width: 180px;
  margin-left: 40px;
  border-bottom: none;
  flex-shrink: 0;
}

/* 移除菜单项的焦点边框 */
.nav-menu .el-menu-item:focus {
  outline: none;
}

.nav-menu .el-menu-item:focus-visible {
  outline: none;
}

/* 移除菜单项的默认边框 */
.nav-menu .el-menu-item {
  border: none !important;
  position: relative;
}

.nav-menu .el-menu-item:hover {
  border: none !important;
}

.nav-menu .el-menu-item.is-active {
  border: none !important;
  position: relative;
}

/* 添加激活状态下的底部指示条 */
.nav-menu .el-menu-item.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 3px;
  background: var(--el-color-primary);
  border-radius: 2px;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;
  background: rgba(248, 250, 252, 0.8);
}

.username {
  font-weight: 500;
  margin-left: 4px;
}

.page-header {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  margin: 0 20px;
  min-width: 0;
}

.search-bar {
   width: 40%;
   max-width: 400px;
   flex-shrink: 0;
 }

   /* 移动端展开/收起按钮 */
  .mobile-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(100, 116, 139, 0.08) 100%);
    border: 2px solid rgba(64, 158, 255, 0.25);
    cursor: pointer;
    transition: all 0.3s ease;
    margin-right: 16px;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
    position: relative;
    z-index: 1001;
  }

  .mobile-toggle:hover {
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.25) 0%, rgba(100, 116, 139, 0.15) 100%);
    border-color: rgba(64, 158, 255, 0.4);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.25);
  }

  .mobile-toggle:active {
    transform: scale(0.95);
  }

     .mobile-toggle .toggle-icon {
     font-size: 18px;
     color: var(--primary-color);
     transition: all 0.3s ease;
     font-weight: 700;
     line-height: 1;
     display: flex;
     align-items: center;
     justify-content: center;
     width: 100%;
     height: 100%;
}

@media (max-width: 768px) {
  .header {
    padding: 0;
    position: sticky;
    top: 0;
    z-index: 1000;
    height: 60px;
    overflow: hidden;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    /* 确保不会影响搜索模态框的显示 */
    contain: layout style;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid rgba(148, 163, 184, 0.08);
  }

  /* 隐藏桌面端元素 */
  .desktop-nav,
  .desktop-search,
  .desktop-user {
    display: none !important;
  }

  .header-content {
    justify-content: flex-start;
    gap: 0;
  }

  .el-button + .el-button {
  margin-left: 0 !important;
}

  /* 移动端显示展开按钮 */
  .mobile-toggle {
    display: flex !important;
    order: 1;
    margin: 0 16px 0 0;
    position: relative;
    z-index: 1002;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(100, 116, 139, 0.1) 100%);
    border: 2px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  .logo {
    text-align: center;
    order: 2;
    margin: 0;
    padding: 16px 0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    border-bottom: 1px solid rgba(148, 163, 184, 0.08);
    position: relative;
    transition: all 0.3s ease;
    flex: 1;
  }

  .logo h1 {
    font-size: 24px;
    margin: 0;
    background: linear-gradient(135deg, var(--primary-color) 0%, #67c23a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

@media (max-width: 480px) {
  .header {
    position: sticky;
    top: 0;
    z-index: 1000;
    height: 56px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }

  /* 隐藏桌面端元素 */
  .desktop-nav,
  .desktop-search,
  .desktop-user {
    display: none !important;
  }

  .header-content {
    padding: 0;
    gap: 0;
    justify-content: flex-start;
  }

  /* 480px 以下显示展开按钮 */
  .mobile-toggle {
    display: flex !important;
    order: 1;
    margin: 0 12px 0 0;
    position: relative;
    z-index: 1002;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(100, 116, 139, 0.1) 100%);
    border: 2px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  .logo {
    order: 2;
    padding: 14px 0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    flex: 1;
  }

  .logo h1 {
    font-size: 22px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #67c23a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* 中等屏幕优化 */
@media (max-width: 640px) {
  .header {
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }

  /* 隐藏桌面端元素 */
  .desktop-nav,
  .desktop-search,
  .desktop-user {
    display: none !important;
  }

  .header-content {
    gap: 0;
    justify-content: flex-start;
  }

  /* 640px 以下显示展开按钮 */
  .mobile-toggle {
    display: flex !important;
    order: 1;
    margin: 0 14px 0 0;
    position: relative;
    z-index: 1002;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(100, 116, 139, 0.1) 100%);
    border: 2px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  .logo {
    order: 2;
    flex: 1;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .header {
    position: sticky;
    top: 0;
    z-index: 1000;
    height: 52px;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }

  /* 隐藏桌面端元素 */
  .desktop-nav,
  .desktop-search,
  .desktop-user {
    display: none !important;
  }

  .header-content {
    padding: 0;
    gap: 0;
    justify-content: flex-start;
  }

  /* 360px 以下显示展开按钮 */
  .mobile-toggle {
    display: flex !important;
    order: 1;
    margin: 0 10px 0 0;
    position: relative;
    z-index: 1002;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.2) 0%, rgba(100, 116, 139, 0.1) 100%);
    border: 2px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  }

  .logo {
    order: 2;
    padding: 12px 0;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
    flex: 1;
  }

  .logo h1 {
    font-size: 20px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #67c23a 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

/* 移动端侧边栏样式 */
.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  visibility: hidden;
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-sidebar.open {
  visibility: visible;
  opacity: 1;
}

.sidebar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.sidebar-content {
  position: absolute;
  top: 0;
  left: -320px;
  width: 320px;
  height: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.mobile-sidebar.open .sidebar-content {
  left: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
}

.sidebar-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-color) 0%, #67c23a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(64, 158, 255, 0.1);
  color: var(--primary-color);
}

.sidebar-nav {
  padding: 20px 0;
  flex: 1;
}

.sidebar-nav-item {
  display: block;
  padding: 16px 24px;
  color: #374151;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  margin: 4px 0;
}

.sidebar-nav-item:hover {
  background: rgba(64, 158, 255, 0.05);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
  transform: translateX(4px);
}

.sidebar-nav-item.active {
  background: rgba(64, 158, 255, 0.1);
  color: var(--primary-color);
  border-left-color: var(--primary-color);
}

.sidebar-search {
  padding: 20px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.sidebar-user {
  padding: 20px 24px;
  background: rgba(248, 250, 252, 0.5);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.user-info h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.user-info p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-btn {
  width: 100%;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid rgba(64, 158, 255, 0.2);
  color: var(--primary-color);
}

.login-section {
  text-align: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.login-section h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.login-section p {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #6b7280;
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.login-btn, .register-btn {
  width: 100%;
}

/* 小屏幕侧边栏优化 */
@media (max-width: 480px) {
  .sidebar-content {
    width: 280px;
    left: -280px;
  }
  
  .sidebar-header {
    padding: 16px 20px;
  }
  
  .sidebar-header h2 {
    font-size: 20px;
  }
  
  .sidebar-nav-item {
    padding: 14px 20px;
    font-size: 15px;
  }
  
  .sidebar-search,
  .sidebar-user {
    padding: 16px 20px;
  }
}

@media (max-width: 360px) {
  .sidebar-content {
    width: 260px;
    left: -260px;
  }
  
  .sidebar-header {
    padding: 14px 18px;
  }
  
  .sidebar-header h2 {
    font-size: 18px;
  }
  
  .sidebar-nav-item {
    padding: 12px 18px;
    font-size: 14px;
  }
  
  .sidebar-search,
  .sidebar-user {
    padding: 14px 18px;
  }
}
</style>
