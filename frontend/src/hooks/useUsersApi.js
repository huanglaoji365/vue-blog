import { api } from '@/utils/api'

export function useUsersApi() {
  // 获取用户列表
  const getUsers = (params) => api.get('/users', { params })

  // 获取单个用户信息
  const getUser = (id) => api.get(`/users/${id}`)

  // 更新用户信息
  const updateUser = (id, userData) => api.put(`/users/${id}`, userData)

  // 删除用户
  const deleteUser = (id) => api.delete(`/users/${id}`)

  // 重置用户密码
  const resetUserPassword = (id) => api.post(`/users/${id}/reset-password`)

  return {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    resetUserPassword
  }
}
