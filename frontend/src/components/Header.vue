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
          class="nav-menu"
          mode="horizontal"
          router
        >
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/posts">文章</el-menu-item>
          <el-menu-item v-if="isAdmin" index="/admin">管理</el-menu-item>
        </el-menu>
        <div class="user-actions">
          <template v-if="isAuthenticated && user">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-avatar :size="28" :src="user.avatar">
                  {{ user.username?.charAt(0) }}
                </el-avatar>
                <span class="username">{{ user.username }}</span>
                <el-icon><ArrowDown /></el-icon>
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

const activeIndex = computed(() => route.path)

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
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}
.logo a {
  text-decoration: none;
  color: var(--primary-color);
}
.logo h1 {
  margin: 0;
  font-size: 24px;
  font-weight: bold;
}
.nav-menu {
  border-bottom: none;
  flex: 1;
  margin: 0 40px;
}
.user-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s;
}
.user-info:hover {
  background-color: #f5f7fa;
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
  }
  .nav-menu {
    margin: 10px 0;
    width: 100%;
  }
  .user-actions {
    margin-top: 10px;
  }
}
</style>
