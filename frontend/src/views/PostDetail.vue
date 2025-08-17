<template>
  <div class="post-detail-page">
    <Header />
    <div class="container">
      <div v-if="loading" class="loading">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else-if="!post" class="empty">
        <el-empty description="文章不存在或已被删除" />
      </div>
      <div v-else class="post-detail-card">
        <h1 class="post-title">{{ post.title }}</h1>
        <div class="post-meta">
          <el-avatar :size="32" :src="post.author?.avatar">
            {{ post.author?.username?.charAt(0) }}
          </el-avatar>
          <span class="author">{{ post.author?.username }}</span>
          <span class="date">{{ formatDate(post.createdAt) }}</span>
          <span class="views">{{ post.views }} 阅读</span>
        </div>
        <div class="post-tags">
          <el-tag v-for="tag in post.tags" :key="tag._id || tag" size="small" class="tag">{{ tag.name || tag }}</el-tag>
        </div>
        <div class="post-category" v-if="post.category">
          <el-tag type="info" size="small">{{ post.category.name }}</el-tag>
        </div>
        <div class="post-content" v-html="postHtml"></div>
        
        <!-- 评论区 -->
        <div class="comments-section">
          <h3 class="comments-title">评论 ({{ comments.total || 0 }})</h3>
          
          <!-- 发表评论 -->
          <div class="comment-form" v-if="isAuthenticated">
            <el-avatar :size="40" :src="user?.avatar" class="user-avatar">
              {{ user?.username?.charAt(0) }}
            </el-avatar>
            <div class="form-content">
              <el-input
                v-model="newComment"
                type="textarea"
                :rows="3"
                placeholder="写下你的评论..."
                :maxlength="1000"
                show-word-limit
                @keydown.ctrl.enter="submitComment"
              />
              <div class="form-actions">
                <el-button type="primary" @click="submitComment" :loading="submitting">
                  发表评论
                </el-button>
              </div>
            </div>
          </div>
          
          <!-- 未登录提示 -->
          <div v-else class="login-prompt">
            <el-button type="primary" @click="$router.push('/login')">
              登录后发表评论
            </el-button>
          </div>
          
          <!-- 评论列表 -->
          <div class="comments-list" v-if="comments.comments && comments.comments.length > 0">
            <div v-for="comment in comments.comments" :key="comment._id" class="comment-item">
              <div class="comment-header">
                <el-avatar :size="32" :src="comment.author?.avatar">
                  {{ comment.author?.username?.charAt(0) }}
                </el-avatar>
                <div class="comment-info">
                  <span class="comment-author">{{ comment.author?.username }}</span>
                  <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
                </div>
                <div class="comment-actions">
                                     <el-button 
                     type="text" 
                     size="small" 
                     @click="handleLikeComment(comment)"
                     :class="{ 'liked': comment.likes?.includes(user?._id) }"
                   >
                     👍 {{ comment.likes?.length || 0 }}
                   </el-button>
                  <el-button 
                    type="text" 
                    size="small" 
                    @click="showReplyForm(comment._id)"
                  >
                    回复
                  </el-button>
                  <el-button 
                    v-if="canDeleteComment(comment)"
                    type="text" 
                    size="small" 
                    @click="handleDeleteComment(comment._id)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
              <div class="comment-content">{{ comment.content }}</div>
              
              <!-- 回复表单 -->
              <div v-if="replyingTo === comment._id" class="reply-form">
                <el-input
                  v-model="replyContent"
                  type="textarea"
                  :rows="2"
                  placeholder="写下你的回复..."
                  :maxlength="1000"
                  show-word-limit
                />
                <div class="reply-actions">
                  <el-button size="small" @click="cancelReply">取消</el-button>
                  <el-button type="primary" size="small" @click="submitReply(comment._id)" :loading="submitting">
                    回复
                  </el-button>
                </div>
              </div>
              
              <!-- 回复列表 -->
              <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
                <div v-for="reply in comment.replies" :key="reply._id" class="reply-item">
                  <div class="reply-header">
                    <el-avatar :size="24" :src="reply.author?.avatar">
                      {{ reply.author?.username?.charAt(0) }}
                    </el-avatar>
                    <div class="reply-info">
                      <span class="reply-author">{{ reply.author?.username }}</span>
                      <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
                    </div>
                    <div class="reply-actions">
                                             <el-button 
                         type="text" 
                         size="small" 
                         @click="handleLikeComment(reply)"
                         :class="{ 'liked': reply.likes?.includes(user?._id) }"
                       >
                         👍 {{ reply.likes?.length || 0 }}
                       </el-button>
                      <el-button 
                        v-if="canDeleteComment(reply)"
                        type="text" 
                        size="small" 
                        @click="handleDeleteComment(reply._id)"
                      >
                        删除
                      </el-button>
                    </div>
                  </div>
                  <div class="reply-content">{{ reply.content }}</div>
                </div>
              </div>
            </div>
            
            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="comments.totalPages > 1">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="comments.total"
                layout="prev, pager, next"
                @current-change="loadComments"
              />
            </div>
          </div>
          
          <!-- 空评论状态 -->
          <div v-else class="empty-comments">
            <el-empty description="暂无评论，快来发表第一条评论吧！" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePostsApi } from '@/hooks/usePostsApi'
import { useCommentsApi } from '@/hooks/useCommentsApi'
import { useAuthStore } from '@/stores/auth'
import Header from '@/components/Header.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { marked } from 'marked'


const route = useRoute()
const { fetchPost } = usePostsApi()
const { getPostComments, createComment, deleteComment, likeComment } = useCommentsApi()
const authStore = useAuthStore()

const post = ref(null)
const loading = ref(true)
const comments = ref({ comments: [], total: 0, totalPages: 0, currentPage: 1 })
const currentPage = ref(1)
const pageSize = ref(10)
const newComment = ref('')
const replyContent = ref('')
const replyingTo = ref(null)
const submitting = ref(false)

const { user, isAuthenticated } = authStore

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-CN')
}

const postHtml = computed(() => post.value ? marked.parse(post.value.content || '') : '')

// 加载评论
const loadComments = async (page = 1) => {
  try {
    const response = await getPostComments(route.params.id, {
      page,
      limit: pageSize.value
    })
    comments.value = response.data
    currentPage.value = page
  } catch (error) {
    console.error('加载评论失败:', error)
  }
}

// 提交评论
const submitComment = async () => {
  if (!newComment.value.trim()) {
    ElMessage.warning('请输入评论内容')
    return
  }
  
  submitting.value = true
  try {
    await createComment({
      content: newComment.value,
      postId: route.params.id
    })
    newComment.value = ''
    ElMessage.success('评论发表成功')
    await loadComments(1)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '评论发表失败')
  } finally {
    submitting.value = false
  }
}

// 显示回复表单
const showReplyForm = (commentId) => {
  if (!isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  replyingTo.value = commentId
  replyContent.value = ''
}

// 取消回复
const cancelReply = () => {
  replyingTo.value = null
  replyContent.value = ''
}

// 提交回复
const submitReply = async (commentId) => {
  if (!replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  
  submitting.value = true
  try {
    await createComment({
      content: replyContent.value,
      postId: route.params.id,
      parentId: commentId
    })
    cancelReply()
    ElMessage.success('回复发表成功')
    await loadComments(currentPage.value)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '回复发表失败')
  } finally {
    submitting.value = false
  }
}

// 删除评论
const handleDeleteComment = async (commentId) => {
  try {
    await ElMessageBox.confirm('确定要删除这条评论吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteComment(commentId)
    ElMessage.success('评论删除成功')
    await loadComments(currentPage.value)
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.response?.data?.message || '删除评论失败')
    }
  }
}

// 点赞评论
const handleLikeComment = async (comment) => {
  if (!isAuthenticated) {
    ElMessage.warning('请先登录')
    return
  }
  
  try {
    await likeComment(comment._id)
    // 重新加载评论以更新点赞状态
    await loadComments(currentPage.value)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}

// 检查是否可以删除评论
const canDeleteComment = (comment) => {
  return isAuthenticated && (user?._id === comment.author?._id || user?.role === 'admin')
}

onMounted(async () => {
  loading.value = true
  try {
    const id = route.params.id
    const response = await fetchPost(id)
    post.value = response.data
    await loadComments()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '获取文章详情失败')
    post.value = null
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.post-detail-page {
  min-height: 100vh;
  background: var(--background-color);
}
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
}
.post-detail-card {
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.08);
  padding: 40px 32px;
}
.post-title {
  font-size: 2.2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--text-color);
}
.post-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1rem;
  color: var(--text-color-secondary);
  margin-bottom: 18px;
}
.author {
  font-weight: 500;
}
.date, .views {
  color: var(--text-color-secondary);
}
.post-tags {
  margin-bottom: 12px;
}
.tag {
  margin-right: 8px;
}
.post-category {
  margin-bottom: 18px;
}
.post-content {
  color: var(--text-color-regular);
  line-height: 1.8;
  font-size: 1.1rem;
  word-break: break-all;
  margin-bottom: 40px;
}
.loading {
  padding: 40px 0;
}
.empty {
  padding: 60px 0;
  text-align: center;
}

/* 评论区样式 */
.comments-section {
  border-top: 1px solid #eee;
  padding-top: 30px;
}
.comments-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--text-color);
}
.comment-form {
  display: flex;
  gap: 16px;
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}
.user-avatar {
  flex-shrink: 0;
}
.form-content {
  flex: 1;
}
.form-actions {
  margin-top: 12px;
  text-align: right;
}
.login-prompt {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 30px;
}
.comments-list {
  margin-top: 20px;
}
.comment-item {
  margin-bottom: 24px;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fff;
}
.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.comment-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.comment-author {
  font-weight: 500;
  color: var(--text-color);
}
.comment-date {
  font-size: 0.875rem;
  color: var(--text-color-secondary);
}
.comment-actions {
  display: flex;
  gap: 8px;
}
.comment-content {
  color: var(--text-color-regular);
  line-height: 1.6;
  margin-bottom: 12px;
}
.reply-form {
  margin: 12px 0;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}
.reply-actions {
  margin-top: 8px;
  text-align: right;
}
.replies-list {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid #eee;
}
.reply-item {
  margin-bottom: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
}
.reply-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.reply-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.reply-author {
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--text-color);
}
.reply-date {
  font-size: 0.75rem;
  color: var(--text-color-secondary);
}
.reply-actions {
  display: flex;
  gap: 4px;
}
.reply-content {
  color: var(--text-color-regular);
  line-height: 1.5;
  font-size: 0.875rem;
}
.pagination-wrapper {
  margin-top: 20px;
  text-align: center;
}
.empty-comments {
  padding: 40px 0;
  text-align: center;
}
.liked {
  color: #409eff;
}
</style>