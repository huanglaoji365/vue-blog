import { api } from '@/utils/api'

export function useTagsApi() {
  // 获取所有标签（公开）
  const fetchTags = () => api.get('/tags')

  // 获取标签列表（管理员）
  const getTags = (params) => api.get('/tags/admin', { params })

  // 获取单个标签
  const getTag = (id) => api.get(`/tags/${id}`)

  // 创建标签
  const createTag = (tagData) => api.post('/tags', tagData)

  // 更新标签
  const updateTag = (id, tagData) => api.put(`/tags/${id}`, tagData)

  // 删除标签
  const deleteTag = (id) => api.delete(`/tags/${id}`)

  return {
    fetchTags,
    getTags,
    getTag,
    createTag,
    updateTag,
    deleteTag
  }
}
