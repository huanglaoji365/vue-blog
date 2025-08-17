<template>
  <div class="login-prompt-container">
    <el-card class="login-prompt-card">
      <div class="login-prompt-content">
        <el-icon size="64" color="#409eff"><Lock /></el-icon>
        <h2>需要登录</h2>
        <p>您需要登录后才能访问此页面</p>
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
</template>

<script setup>
import { Lock } from '@element-plus/icons-vue'
</script>

<style scoped>
.login-prompt-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 40px;
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
</style>
