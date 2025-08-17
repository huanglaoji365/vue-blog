<template>
  <div class="login-page">
    <Header />
    
    <div class="container">
      <div class="login-container">
        <div class="login-card">
          <h2>登录</h2>
          <el-form
            ref="loginForm"
            :model="loginData"
            :rules="rules"
            label-width="80px"
            class="login-form"
          >
            <el-form-item label="邮箱" prop="email">
              <el-input
                v-model="loginData.email"
                type="email"
                placeholder="请输入邮箱"
                prefix-icon="Message"
              />
            </el-form-item>
            
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginData.password"
                type="password"
                placeholder="请输入密码"
                prefix-icon="Lock"
                show-password
              />
            </el-form-item>
            
            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleLogin"
                class="login-btn"
              >
                登录
              </el-button>
            </el-form-item>
          </el-form>
          
          <div class="login-footer">
            <p>
              还没有账号？
              <router-link to="/register">立即注册</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthApi } from '@/hooks/useAuthApi'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import Header from '@/components/Header.vue'
import { nextTick } from 'vue'

const router = useRouter()
const loginForm = ref(null)
const loading = ref(false)
const { login } = useAuthApi()
const authStore = useAuthStore()

const loginData = reactive({
  email: 'admin@example.com',
  password: 'admin123'
})

const rules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginForm.value) return
  try {
    await loginForm.value.validate()
    loading.value = true
    
    // 使用 authStore 的 login 方法
    const result = await authStore.login(loginData)
    
    if (result.success) {
      ElMessage.success('登录成功')
      await nextTick()
      router.push('/')
    } else {
      ElMessage.error(result.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
  /* padding: 40px 0; */
  padding-top: 0;
  padding-bottom: 40px;
}

.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: var(--text-color);
  font-size: 28px;
  font-weight: bold;
}

.login-form {
  margin-bottom: 20px;
}

.login-btn {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-footer p {
  margin: 0;
  color: var(--text-color-regular);
}

.login-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .login-card {
    margin: 20px;
    padding: 30px 20px;
  }
}
</style>
