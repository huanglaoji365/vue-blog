import { api } from '@/utils/api'

export function useCommentsApi() {
  // 获取所有评论 (管理员)
  const getComments = (params) => api.get('/comments', { params })

  // 获取文章的评论
  const getPostComments = (postId, params) => api.get(`/comments/post/${postId}`, { params })

  // 创建评论
  const createComment = (commentData) => api.post('/comments', commentData)

  // 更新评论
  const updateComment = (id, commentData) => api.put(`/comments/${id}`, commentData)

  // 删除评论
  const deleteComment = (id) => api.delete(`/comments/${id}`)

  // 点赞评论
  const likeComment = (id) => api.post(`/comments/${id}/like`)

  return {
    getComments,
    getPostComments,
    createComment,
    updateComment,
    deleteComment,
    likeComment
  }
}
