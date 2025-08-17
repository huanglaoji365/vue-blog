import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthApi } from '@/hooks/useAuthApi'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  const { login: loginApi, register: registerApi, fetchProfile: fetchProfileApi, updateProfile: updateProfileApi } = useAuthApi()

  const login = async (credentials) => {
    try {
      const response = await loginApi(credentials)
      const { token: newToken, user: userData } = response.data
      token.value = newToken
      user.value = userData
      localStorage.setItem('token', newToken)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '登录失败' }
    }
  }

  const register = async (userData) => {
    try {
      const response = await registerApi(userData)
      const { token: newToken, user: userInfo } = response.data
      token.value = newToken
      user.value = userInfo
      localStorage.setItem('token', newToken)
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '注册失败' }
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }

  const fetchProfile = async () => {
    if (!token.value) return
    try {
      const response = await fetchProfileApi()
      user.value = response.data
    } catch (error) {
      logout()
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await updateProfileApi(profileData)
      user.value = response.data
      return { success: true }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || '更新失败' }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    fetchProfile,
    updateProfile
  }
})
