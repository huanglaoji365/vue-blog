import { api } from '@/utils/api'

export function useCategoriesApi() {
  // 获取所有分类（公开）
  const fetchCategories = () => api.get('/categories')

  // 获取分类列表（管理员）
  const getCategories = (params) => api.get('/categories/admin', { params })

  // 获取单个分类
  const getCategory = (id) => api.get(`/categories/${id}`)

  // 创建分类
  const createCategory = (categoryData) => api.post('/categories', categoryData)

  // 更新分类
  const updateCategory = (id, categoryData) => api.put(`/categories/${id}`, categoryData)

  // 删除分类
  const deleteCategory = (id) => api.delete(`/categories/${id}`)

  return {
    fetchCategories,
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory
  }
}
