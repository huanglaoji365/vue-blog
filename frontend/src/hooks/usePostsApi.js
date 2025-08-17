import { api } from '@/utils/api'

export function usePostsApi() {
  // 获取文章列表
  const fetchPosts = (params) => api.get('/posts', { params })

  // 获取单篇文章
  const fetchPost = (id) => api.get(`/posts/${id}`)

  // 新建文章
  const createPost = (data) => api.post('/posts', data)

  // 更新文章
  const updatePost = (id, data) => api.put(`/posts/${id}`, data)

  // 删除文章
  const deletePost = (id) => api.delete(`/posts/${id}`)

  return {
    fetchPosts,
    fetchPost,
    createPost,
    updatePost,
    deletePost
  }
}
