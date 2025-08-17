import { api } from '@/utils/api'

export function useAuthApi() {
  // 登录
  const login = (credentials) => api.post('/auth/login', credentials)

  // 注册
  const register = (userData) => api.post('/auth/register', userData)

  // 获取用户信息
  const fetchProfile = () => api.get('/auth/profile')

  // 更新用户信息
  const updateProfile = (profileData) => api.put('/auth/profile', profileData)

  return {
    login,
    register,
    fetchProfile,
    updateProfile
  }
}
