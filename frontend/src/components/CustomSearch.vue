<template>
  <div class="custom-search-container">
    <!-- 搜索按钮 -->
    <div 
      class="search-button" 
      @click="openSearch"
      :class="{ 'search-button-active': isOpen }"
    >
      <div class="search-button-content">
        <el-icon class="search-icon"><Search /></el-icon>
        <span class="search-placeholder">{{ placeholder }}</span>
        <div class="search-shortcuts">
          <kbd class="shortcut-key">CTRL</kbd>
          <kbd class="shortcut-key">K</kbd>
        </div>
      </div>
    </div>

    <!-- 搜索模态框 - 使用 teleport 移到 body 层级 -->
    <teleport to="body">
      <div v-if="isOpen" class="search-modal-overlay" @click="closeSearch">
        <div class="search-modal" @click.stop>
          <!-- 搜索输入框 -->
          <div class="search-input-container">
            <el-icon class="search-input-icon"><Search /></el-icon>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              class="search-input"
              :placeholder="placeholder"
              @input="handleSearch"
              @keydown="handleKeydown"
              @focus="handleFocus"
            />
            <button 
              v-if="searchQuery" 
              class="clear-button"
              @click="clearSearch"
            >
              <el-icon><Close /></el-icon>
            </button>
            <!-- <button class="close-button" @click="closeSearch">
              <el-icon><Close /></el-icon>
            </button> -->
          </div>

          <!-- 搜索结果 -->
          <div class="search-results" v-if="searchQuery">
            <div v-if="loading" class="loading-results">
              <el-icon class="is-loading"><Loading /></el-icon>
              <span>搜索中...</span>
            </div>
            
            <div v-else-if="searchResults.length === 0" class="no-results">
              <div class="no-results-icon">
                <el-icon><Search /></el-icon>
              </div>
              <div class="no-results-text">
                <p>没有找到相关结果</p>
                <p class="no-results-suggestion">尝试使用不同的关键词</p>
              </div>
            </div>
            
            <div v-else class="results-list">
              <div 
                v-for="(result, index) in searchResults" 
                :key="result._id"
                class="result-item"
                :class="{ 'result-item-active': activeIndex === index }"
                @click="selectResult(result)"
                @mouseenter="activeIndex = index"
              >
                <div class="result-content">
                  <div class="result-title">
                    <span v-html="highlightText(result.title, searchQuery)"></span>
                  </div>
                  <div class="result-excerpt">
                    <span v-html="highlightText(result.excerpt, searchQuery)"></span>
                  </div>
                  <div class="result-meta">
                    <span class="result-author">{{ result.author?.username }}</span>
                    <span class="result-date">{{ formatDate(result.createdAt) }}</span>
                    <span class="result-category" v-if="result.category">
                      {{ result.category.name }}
                    </span>
                  </div>
                </div>
                <div class="result-actions">
                  <el-icon class="result-action-icon"><ArrowRight /></el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 搜索提示 -->
          <div v-else class="search-tips">
            <div class="tips-header">
              <h3>搜索提示</h3>
            </div>
            <div class="tips-content">
              <div class="tip-item">
                <el-icon class="tip-icon"><Search /></el-icon>
                <span>输入关键词搜索文章标题、摘要和内容</span>
              </div>
              <div class="tip-item">
                <el-icon class="tip-icon"><User /></el-icon>
                <span>可以搜索作者名称</span>
              </div>
              <div class="tip-item">
                <el-icon class="tip-icon"><Collection /></el-icon>
                <span>可以搜索分类和标签</span>
              </div>
            </div>
          </div>

          <!-- 搜索底部 -->
          <div class="search-footer">
            <div class="search-info">
              <span v-if="searchQuery && !loading">
                找到 {{ searchResults.length }} 个结果
              </span>
            </div>
            <div class="search-actions">
              <span class="action-hint">使用 ↑↓ 键导航，Enter 键选择，Esc 键关闭</span>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Close, Loading, ArrowRight, User, Collection } from '@element-plus/icons-vue'
import { usePostsApi } from '@/hooks/usePostsApi'

const props = defineProps({
  placeholder: {
    type: String,
    default: '搜索文章...'
  }
})

const router = useRouter()
const { fetchPosts: fetchPostsApi } = usePostsApi()

// 响应式数据
const isOpen = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const loading = ref(false)
const activeIndex = ref(-1)
const searchInput = ref(null)

// 搜索防抖
let searchTimeout = null

// 打开搜索
const openSearch = () => {
  isOpen.value = true
  nextTick(() => {
    searchInput.value?.focus()
  })
}

// 关闭搜索
const closeSearch = () => {
  isOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
  activeIndex.value = -1
}

// 处理搜索
const handleSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }
  
  loading.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const response = await fetchPostsApi({
        search: searchQuery.value,
        limit: 10
      })
      searchResults.value = response.data.posts
    } catch (error) {
      console.error('搜索失败:', error)
      searchResults.value = []
    } finally {
      loading.value = false
    }
  }, 300)
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  activeIndex.value = -1
  searchInput.value?.focus()
}

// 选择结果
const selectResult = (result) => {
  router.push(`/posts/${result._id}`)
  closeSearch()
}

// 处理键盘事件
const handleKeydown = (event) => {
  switch (event.key) {
    case 'Escape':
      closeSearch()
      break
    case 'ArrowDown':
      event.preventDefault()
      if (searchResults.value.length > 0) {
        activeIndex.value = Math.min(activeIndex.value + 1, searchResults.value.length - 1)
      }
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = Math.max(activeIndex.value - 1, -1)
      break
    case 'Enter':
      event.preventDefault()
      if (activeIndex.value >= 0 && searchResults.value[activeIndex.value]) {
        selectResult(searchResults.value[activeIndex.value])
      }
      break
  }
}

// 处理焦点
const handleFocus = () => {
  activeIndex.value = -1
}

// 高亮文本
const highlightText = (text, query) => {
  if (!text || !query) return text
  
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 全局快捷键
const handleGlobalKeydown = (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
    event.preventDefault()
    if (!isOpen.value) {
      openSearch()
    }
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('keydown', handleGlobalKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleGlobalKeydown)
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
})
</script>

<style>
.custom-search-container {
  position: relative;
  z-index: auto;
}

/* 搜索模态框覆盖层 - 使用 teleport 后不再需要复杂的样式覆盖 */
.search-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

/* 搜索按钮 */
.search-button {
  width: 100%;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-button:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-1px);
}

.search-button-active {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
}

.search-button-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  height: 100%;
}

.search-icon {
  color: #909399;
  font-size: 16px;
  margin-right: 10px;
}

.search-placeholder {
  flex: 1;
  text-align: left;
  color: #606266;
  font-size: 14px;
  font-weight: 400;
}

.search-shortcuts {
  display: flex;
  gap: 2px;
}

.shortcut-key {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  line-height: 1;
  transition: all 0.2s ease;
}

/* 搜索模态框样式已在上方定义 */

.search-modal-overlay:hover {
  background: rgba(0, 0, 0, 0.55);
}

.search-modal-overlay:active {
  background: rgba(0, 0, 0, 0.55);
}

.search-modal {
  width: 90%;
  max-width: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 100000 !important;
}

.search-modal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.05));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 搜索输入框 */
.search-input-container {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
  background: #fafafa;
}

.search-input-icon {
  color: #909399;
  font-size: 18px;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 18px;
  color: #303133;
  background: transparent;
  font-weight: 500;
}

.search-input::placeholder {
  color: #c0c4cc;
}

.clear-button,
.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #909399;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.clear-button:hover,
.close-button:hover {
  background: #f5f7fa;
  color: #606266;
}

/* 搜索结果 */
.search-results {
  max-height: 400px;
  overflow-y: auto;
}

.loading-results {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
  gap: 8px;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.no-results-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 16px;
}

.no-results-text p {
  margin: 0;
  color: #606266;
}

.no-results-suggestion {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.results-list {
  padding: 8px 0;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover,
.result-item-active {
  background-color: #f5f7fa;
}

.result-content {
  flex: 1;
  min-width: 0;
}

.result-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
  line-height: 1.4;
}

.result-title :deep(mark) {
  background-color: #fff3cd;
  color: #856404;
  padding: 0 2px;
  border-radius: 2px;
}

.result-excerpt {
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.result-excerpt :deep(mark) {
  background-color: #fff3cd;
  color: #856404;
  padding: 0 2px;
  border-radius: 2px;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.result-author {
  font-weight: 500;
}

.result-actions {
  margin-left: 12px;
}

.result-action-icon {
  color: #c0c4cc;
  font-size: 16px;
}

/* 搜索提示 */
.search-tips {
  padding: 20px;
}

.tips-header h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.tips-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: #606266;
  font-size: 14px;
}

.tip-icon {
  color: #909399;
  font-size: 16px;
}

/* 搜索底部 */
.search-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.search-info {
  font-size: 12px;
  color: #909399;
}

.search-actions {
  display: flex;
  gap: 16px;
}

.action-hint {
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-modal {
    width: 95%;
    margin: 0 10px;
    max-height: 90vh;
  }
  
  .search-modal-overlay {
    align-items: flex-start;
    padding-top: 5vh;
  }
  
  .search-footer {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .search-shortcuts {
    display: none;
  }
  
  .search-input {
    font-size: 16px;
  }
  
  .search-input-container {
    padding: 16px 20px;
  }
}

/* 小屏幕优化 */
@media (max-width: 480px) {
  .search-modal {
    width: 98%;
    margin: 0 5px;
    max-height: 85vh;
    z-index: 999999 !important;
  }
  
  .search-modal-overlay {
    padding-top: 3vh;
  }
  
  .search-input {
    font-size: 16px;
  }
  
  .search-input-container {
    padding: 14px 16px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .search-modal {
    width: 100%;
    margin: 0;
    max-height: 80vh;
  }
  
  .search-modal-overlay {
    padding-top: 2vh;
  }
  
  .search-input {
    font-size: 15px;
  }
  
  .search-input-container {
    padding: 12px 14px;
  }
}

/* 搜索模态框样式 */
.search-modal {
  z-index: 10000;
  position: relative;
}
</style>
