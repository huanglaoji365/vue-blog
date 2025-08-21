<template>
  <div class="posts-page">
    <Header />

    <div class="container">
      <div class="page-header">
        <div class="search-bar">
        </div>
      </div>

      <!-- 筛选状态显示 -->
      <div v-if="hasActiveFilters" class="filter-status">
        <div class="filter-tags">
          <span v-if="route.query.category" class="filter-tag">
            分类: {{ getCategoryName(route.query.category) }}
            <el-icon @click="clearCategoryFilter" :class="{ disabled: isFiltering }">
              <Close />
            </el-icon>
          </span>
          <span v-if="route.query.tag" class="filter-tag">
            标签: {{ route.query.tag }}
            <el-icon @click="clearTagFilter" :class="{ disabled: isFiltering }">
              <Close />
            </el-icon>
          </span>

        </div>
        <div class="filter-actions">
          <el-button type="text" @click="clearAllFilters" :disabled="isFiltering">清除所有筛选</el-button>
          <div v-if="isFiltering" class="filtering-indicator">
            <el-icon class="is-loading">
              <Loading />
            </el-icon>
            <span>筛选中...</span>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="row">
          <div class="col-md-8">
            <div class="card">
              <h2>文章列表</h2>
              <div class="posts-list">
                <div v-if="loading" class="loading">
                  <el-skeleton :rows="3" animated v-for="i in 5" :key="i" />
                </div>
                <div v-else-if="posts.length === 0" class="empty">
                  <el-empty description="暂无文章" />
                </div>
                <div v-else>
                  <div v-for="post in posts" :key="post._id" class="post-card"
                    @click="$router.push(`/posts/${post._id}`)">
                    <div class="post-header">
                      <h3>{{ post.title }}</h3>
                      <div class="post-meta">
                        <span class="author">
                          <el-avatar :size="20" :src="post.author?.avatar || ''" @error="handleAvatarError">
                            {{ post.author?.username?.charAt(0) }}
                          </el-avatar>
                          {{ post.author?.username }}
                        </span>
                        <span class="date">{{ formatDate(post.createdAt) }}</span>
                        <span class="views">{{ post.views }} 阅读</span>
                      </div>
                    </div>

                    <!-- 封面图片 -->
                    <div class="post-cover">
                      <img v-lazy="'http://localhost:5173' + post.coverImage" :alt="post.title" />
                    </div>

                    <!-- <p class="post-excerpt">{{ post.excerpt }}</p> -->

                    <div class="post-footer">
                      <div class="tags">
                        <el-tag v-for="tag in post.tags" :key="tag._id || tag" size="small" class="tag">
                          {{ tag.name || tag }}
                        </el-tag>
                      </div>
                      <div class="category" v-if="post.category">
                        <el-tag type="info" size="small">
                          {{ post.category.name }}
                        </el-tag>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 分页 -->
                <div v-if="totalPages > 1" class="pagination">
                  <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="total"
                    :disabled="isFiltering" layout="prev, pager, next, jumper" @current-change="handlePageChange" />
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="sidebar">
              <div class="card">
                <h3>分类</h3>
                <div class="categories">
                  <div v-for="category in categories" :key="category._id" class="category-item" :class="{
                    active: route.query.category === category._id,
                    disabled: isFiltering
                  }" @click="filterByCategory(category._id)">
                    <span class="category-name">{{ category.name }}</span>
                    <span class="category-count">({{ category.count }})</span>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3>标签</h3>
                <div class="tags">
                  <el-tag v-for="tag in tags" :key="tag._id" class="tag"
                    :type="route.query.tag === tag.name ? 'primary' : undefined" :class="{ disabled: isFiltering }"
                    @click="filterByTag(tag.name)">
                    {{ tag.name }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsApi } from '@/hooks/usePostsApi'
import { useCategoriesApi } from '@/hooks/useCategoriesApi'
import { useTagsApi } from '@/hooks/useTagsApi'
import Header from '@/components/Header.vue'
import { Close, Loading } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()

const posts = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(true)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)
const isFiltering = ref(false) // 防止重复点击
const filterTimeout = ref(null) // 防抖定时器

const { fetchPosts: fetchPostsApi } = usePostsApi()
const { fetchCategories } = useCategoriesApi()
const { fetchTags } = useTagsApi()

// 计算属性
const hasActiveFilters = computed(() => {
  return route.query.category || route.query.tag
})

const getCategoryName = (categoryId) => {
  const category = categories.value.find(cat => cat._id === categoryId)
  return category ? category.name : '未知分类'
}

// 防抖函数
const debounceFilter = (callback) => {
  if (isFiltering.value) return

  isFiltering.value = true

  // 清除之前的定时器
  if (filterTimeout.value) {
    clearTimeout(filterTimeout.value)
  }

  // 设置新的定时器
  filterTimeout.value = setTimeout(() => {
    isFiltering.value = false
  }, 500)

  return callback()
}

const fetchPosts = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value
    }
    // 添加分类和标签过滤
    if (route.query.category) {
      params.category = route.query.category
    }
    if (route.query.tag) {
      params.tag = route.query.tag
    }
    const response = await fetchPostsApi(params)
    posts.value = response.data.posts
    total.value = response.data.total
    totalPages.value = response.data.totalPages
  } catch (error) {
    console.error('获取文章失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchCategoriesList = async () => {
  try {
    const response = await fetchCategories()
    categories.value = response.data
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const fetchTagsList = async () => {
  try {
    const response = await fetchTags()
    tags.value = response.data
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const handleAvatarError = (event) => {
  // 图片加载失败时，移除src属性，显示默认头像
  event.target.style.display = 'none'
}



const handlePageChange = async (page) => {
  return debounceFilter(async () => {
    currentPage.value = page
    await fetchPosts()
  })
}

const filterByCategory = async (categoryId) => {
  return debounceFilter(async () => {
    // 如果点击的是当前已选中的分类，则取消选择
    if (route.query.category === categoryId) {
      const newQuery = { ...route.query }
      delete newQuery.category
      await router.push({ query: newQuery })
    } else {
      // 保持其他筛选条件
      const newQuery = { ...route.query, category: categoryId }
      await router.push({ query: newQuery })
    }
  })
}

const filterByTag = async (tagName) => {
  return debounceFilter(async () => {
    // 如果点击的是当前已选中的标签，则取消选择
    if (route.query.tag === tagName) {
      const newQuery = { ...route.query }
      delete newQuery.tag
      await router.push({ query: newQuery })
    } else {
      // 保持其他筛选条件
      const newQuery = { ...route.query, tag: tagName }
      await router.push({ query: newQuery })
    }
  })
}

// 清除筛选方法
const clearCategoryFilter = async () => {
  return debounceFilter(async () => {
    const newQuery = { ...route.query }
    delete newQuery.category
    await router.push({ query: newQuery })
  })
}

const clearTagFilter = async () => {
  return debounceFilter(async () => {
    const newQuery = { ...route.query }
    delete newQuery.tag
    await router.push({ query: newQuery })
  })
}



const clearAllFilters = async () => {
  return debounceFilter(async () => {
    await router.push({ query: {} })
  })
}

// 监听路由变化
watch(() => route.query, () => {
  currentPage.value = 1
  fetchPosts()
}, { deep: true })

onMounted(async () => {
  await Promise.all([
    fetchPosts(),
    fetchCategoriesList(),
    fetchTagsList()
  ])
})

onUnmounted(() => {
  // 清理定时器
  if (filterTimeout.value) {
    clearTimeout(filterTimeout.value)
  }
})
</script>

<style scoped>
.posts-page {
  min-height: 100vh;
  background-color: var(--background-color);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px 0;
}

.page-header h1 {
  margin: 0;
  color: var(--text-color);
  font-size: 2rem;
  font-weight: bold;
}

.search-bar {
  width: 300px;
}

.content-section {
  padding: 20px 0;
}

.row {
  display: flex;
  gap: 30px;
}

.col-md-8 {
  flex: 2;
}

.col-md-4 {
  flex: 1;
}

.posts-list {
  display: flex;
  flex-direction: column;
}

.post-card {
  margin-top: 10px;
  gap: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.post-header h3 {
  margin: 0 0 10px 0;
  color: var(--text-color);
  font-size: 1.3rem;
  font-weight: 600;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
  margin-bottom: 15px;
}

.author {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 500;
}

.post-excerpt {
  color: var(--text-color-regular);
  line-height: 1.6;
  margin-bottom: 15px;
}

/* 文章封面图片样式 */
.post-cover {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 25vw;
  overflow: hidden;
  border-radius: 8px;
  margin: 15px 0;
}

.post-cover img {
  width: 100%;
  height: auto;
  transition: all 0.5s ease-out 0.1s;
  object-fit: cover;
}

.post-cover:hover img {
  transform: scale(1.05);
}

.post-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tags {
  display: flex;
  gap: 5px;
}

.tag {
  margin-right: 5px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: color 0.3s;
}

.category-item:hover {
  color: var(--primary-color);
}

.category-item.active {
  color: var(--primary-color);
  font-weight: 600;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 4px;
  padding: 8px 12px;
  margin: 0 -12px;
}

.category-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.category-item.disabled:hover {
  color: inherit;
}

.category-count {
  color: var(--text-color-secondary);
}

.filter-status {
  margin-bottom: 20px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-tags {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 4px 8px;
  background-color: #f0f9ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 14px;
}

.filter-tag .el-icon {
  cursor: pointer;
  font-size: 12px;
}

.filter-tag .el-icon:hover {
  color: #f56c6c;
}

.filter-tag .el-icon.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.filter-tag .el-icon.disabled:hover {
  color: #409eff;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.filtering-indicator {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #409eff;
  font-size: 14px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.tag.disabled:hover {
  transform: none;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.loading {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty {
  padding: 40px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }

  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .search-bar {
    width: 100%;
  }

  /* 移动端封面图片样式调整 */
  .post-cover {
    max-height: 30vw;
    margin: 12px 0;
  }
}
</style>
