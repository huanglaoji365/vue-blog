<template>
  <div class="home">
    <Header />
    
    <div class="container">
      <div class="hero-section">
        <h1>欢迎来到 WeBlog</h1>
        <p>一个现代化的个人博客系统，分享你的想法和知识</p>
        <!-- <el-button type="primary" size="large" @click="$router.push('/posts')">
          浏览文章
        </el-button> -->
      </div>
      
      <div class="content-section">
        <div class="row">
          <div class="col-md-8">
            <div class="card">
              <h2>最新文章</h2>
              <div v-if="loading" class="loading">
                <el-skeleton :rows="3" animated />
              </div>
              <div v-else-if="posts.length === 0" class="empty">
                <el-empty description="暂无文章" />
              </div>
              <div v-else class="posts-list">
                <div
                  v-for="post in posts"
                  :key="post._id"
                  class="post-item"
                  @click="$router.push(`/posts/${post._id}`)"
                >
                  <h3>{{ post.title }}</h3>
                  <p class="post-excerpt">{{ post.excerpt }}</p>
                  <div class="post-meta">
                    <el-avatar :size="32" :src="post.author?.avatar">
                      {{ post.author?.username?.charAt(0) }}
                    </el-avatar>
                    <span class="author">{{ post.author?.username }}</span>
                    <span class="date">{{ formatDate(post.createdAt) }}</span>
                    <span class="tags">
                      <el-tag
                        v-for="tag in post.tags"
                        :key="tag._id || tag"
                        size="small"
                        class="tag"
                      >
                        {{ tag.name || tag }}
                      </el-tag>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-md-4">
            <div class="card">
              <h3>分类</h3>
              <div class="categories">
                <div
                  v-for="category in categories"
                  :key="category._id"
                  class="category-item"
                  @click="filterByCategory(category._id)"
                >
                  <span class="category-name">{{ category.name }}</span>
                  <span class="category-count">({{ category.count }})</span>
                </div>
              </div>
            </div>
            
            <div class="card">
              <h3>标签</h3>
              <div class="tags">
                <el-tag
                  v-for="tag in tags"
                  :key="tag._id"
                  class="tag"
                  @click="filterByTag(tag.name)"
                >
                  {{ tag.name }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsApi } from '@/hooks/usePostsApi'
import { useCategoriesApi } from '@/hooks/useCategoriesApi'
import { useTagsApi } from '@/hooks/useTagsApi'
import Header from '@/components/Header.vue'

const router = useRouter()
const posts = ref([])
const categories = ref([])
const tags = ref([])
const loading = ref(true)

const { fetchPosts } = usePostsApi()
const { fetchCategories } = useCategoriesApi()
const { fetchTags } = useTagsApi()

const fetchLatestPosts = async () => {
  try {
    const response = await fetchPosts({ limit: 5 })
    posts.value = response.data.posts
  } catch (error) {
    console.error('获取文章失败:', error)
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

const filterByTag = (tagName) => {
  router.push(`/posts?tag=${tagName}`)
}

const filterByCategory = (categoryId) => {
  router.push(`/posts?category=${categoryId}`)
}

onMounted(async () => {
  await Promise.all([
    fetchLatestPosts(),
    fetchCategoriesList(),
    fetchTagsList()
  ])
  loading.value = false
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); */
}

.hero-section {
  text-align: center;
  padding: 80px 0;
  color: white;
}

.hero-section h1 {
  font-size: 3rem;
  margin-bottom: 20px;
  font-weight: bold;
}

.hero-section p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.content-section {
  padding: 40px 0;
}

.row {
  display: flex;
  gap: 30px;
  margin: 0 -15px;
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
  gap: 20px;
}

.post-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.post-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.post-item h3 {
  margin: 0 0 10px 0;
  color: var(--text-color);
  font-size: 1.2rem;
}

.post-excerpt {
  color: var(--text-color-regular);
  margin-bottom: 15px;
  line-height: 1.6;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.9rem;
  color: var(--text-color-secondary);
}

.author {
  font-weight: 500;
}

.tags {
  display: flex;
  gap: 5px;
}

.tag {
  margin-right: 5px;
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

.loading {
  padding: 20px 0;
}

.empty {
  padding: 40px 0;
  text-align: center;
}

@media (max-width: 768px) {
  .row {
    flex-direction: column;
  }
  
  .hero-section h1 {
    font-size: 2rem;
  }
  
  .hero-section p {
    font-size: 1rem;
  }
}
</style>
