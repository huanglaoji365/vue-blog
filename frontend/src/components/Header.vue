<template>
  <el-header class="header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <router-link to="/">
            <h1>WeBlog</h1>
          </router-link>
        </div>
        <el-menu 
          :default-active="activeIndex" 
          mode="horizontal" 
          class="nav-menu" 
          router
          :ellipsis="false"
        >
          <el-menu-item 
            v-for="item in menuList" 
            :key="item.index" 
            :index="item.index"
          >
            {{ item.label }}
          </el-menu-item>
        </el-menu>
        <div class="user-actions">
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
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { ArrowDown } from '@element-plus/icons-vue'
import { ElAvatar } from 'element-plus'

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
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.header-content {
  display: flex;
  align-items: center;
  height: 100%;
  position: relative;
  min-height: 60px;
}

.logo a {
  text-decoration: none;
  color: var(--primary-color);
  transition: all 0.3s ease;
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
  width: 60%;
  height: 3px;
  background: linear-gradient(90deg, var(--el-color-primary) 0%, #67c23a 100%);
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 添加悬停时的指示条效果 */
.nav-menu .el-menu-item:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  height: 2px;
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.6) 0%, rgba(103, 194, 58, 0.6) 100%);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
    position: relative;
  }

  .nav-menu {
    margin: 10px 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .user-actions {
    margin-top: 10px;
  }
}
</style>
