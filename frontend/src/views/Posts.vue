<template>
  <div class="posts-page">
    <Header />

    <div class="container">
      <div class="page-header">
        <h1>文章列表</h1>
        <div class="search-bar">
          <el-input v-model="searchQuery" placeholder="搜索文章..." prefix-icon="Search" @keyup.enter="handleSearch"
            clearable>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </div>

      <div class="content-section">
        <div class="row">
          <div class="col-md-8">
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
                        <el-avatar :size="20" :src="post.author?.avatar">
                          {{ post.author?.username?.charAt(0) }}
                        </el-avatar>
                        {{ post.author?.username }}
                      </span>
                      <span class="date">{{ formatDate(post.createdAt) }}</span>
                      <span class="views">{{ post.views }} 阅读</span>
                    </div>
                  </div>

                  <p class="post-excerpt">{{ post.excerpt }}</p>

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
                  layout="prev, pager, next, jumper" @current-change="handlePageChange" />
              </div>
            </div>
          </div>

          <div class="col-md-4">
            <div class="sidebar">
              <div class="card">
                <h3>分类</h3>
                <div class="categories">
                  <div v-for="category in categories" :key="category._id" class="category-item"
                    @click="filterByCategory(category._id)">
                    <span class="category-name">{{ category.name }}</span>
                    <span class="category-count">({{ category.count }})</span>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3>标签</h3>
                <div class="tags">
                  <el-tag v-for="tag in tags" :key="tag._id" class="tag" @click="filterByTag(tag.name)">
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
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostsApi } from '@/hooks/usePostsApi'
import { useCategoriesApi } from '@/hooks/useCategoriesApi'
import { useTagsApi } from '@/hooks/useTagsApi'
import Header from '@/components/Header.vue'

const route = useRoute()
const router = useRouter()

const posts = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(true)
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const totalPages = ref(0)

const { fetchPosts: fetchPostsApi } = usePostsApi()
const { fetchCategories } = useCategoriesApi()
const { fetchTags } = useTagsApi()

const fetchPosts = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined
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

const handleSearch = () => {
  currentPage.value = 1
  fetchPosts()
}

const handlePageChange = (page) => {
  currentPage.value = page
  fetchPosts()
}

const filterByCategory = (categoryId) => {
  router.push({ query: { category: categoryId } })
}

const filterByTag = (tagName) => {
  router.push({ query: { tag: tagName } })
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

.category-count {
  color: var(--text-color-secondary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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
}
</style>
