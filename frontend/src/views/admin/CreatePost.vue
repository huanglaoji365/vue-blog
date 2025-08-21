<template>
  <div class="create-post-page">
    <div class="container">
      <!-- <div class="page-header">
        <h1>新建文章</h1>
        <div class="header-actions">
          <el-button @click="$router.push('/admin/posts')">返回列表</el-button>
        </div>
      </div> -->

      <div class="content-section">
        <el-form ref="postFormRef" :model="postForm" :rules="postRules" label-width="100px" class="post-form">
          <el-form-item label="标题" prop="title">
            <el-input v-model="postForm.title" placeholder="请输入文章标题" />
          </el-form-item>

          <el-form-item label="摘要" prop="excerpt">
            <el-input v-model="postForm.excerpt" type="textarea" :rows="3" placeholder="请输入文章摘要" />
          </el-form-item>

          <el-form-item label="分类" prop="category">
            <el-select v-model="postForm.category" placeholder="选择分类" clearable>
              <el-option v-for="category in categories" :key="category._id" :label="category.name"
                :value="category._id" />
            </el-select>
          </el-form-item>

          <el-form-item label="标签" prop="tags">
            <el-select v-model="postForm.tags" multiple filterable placeholder="选择标签" style="width: 100%">
              <el-option v-for="tag in tags" :key="tag._id" :label="tag.name" :value="tag._id" />
            </el-select>
          </el-form-item>

          <el-form-item label="封面图片" prop="coverImage">
            <div class="image-upload-container">
              <el-upload class="image-uploader" :show-file-list="false" :before-upload="beforeImageUpload"
                :on-success="handleImageSuccess" :on-error="handleImageError" action="/api/upload" accept="image/*"
                name="file" :headers="uploadHeaders">
                <img v-if="postForm.coverImage" :src="postForm.coverImage" class="uploaded-image" />
                <el-icon v-else class="image-uploader-icon">
                  <Plus />
                </el-icon>
              </el-upload>
              <div class="upload-tips">
                <p>支持 JPG、PNG、GIF 格式，文件大小不超过 2MB</p>
                <el-button v-if="postForm.coverImage" type="danger" size="small" @click="removeImage">
                  删除图片
                </el-button>
              </div>
            </div>
          </el-form-item>

          <el-form-item label="状态" prop="status">
            <el-radio-group v-model="postForm.status">
              <el-radio label="draft">草稿</el-radio>
              <el-radio label="published">发布</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="推荐" prop="featured">
            <el-switch v-model="postForm.featured" />
          </el-form-item>

          <el-form-item label="内容" prop="content">
            <!-- <div class="editor-container">
              <textarea 
                v-model="postForm.content" 
                class="markdown-editor"
                placeholder="请输入文章内容（支持Markdown格式）"
                rows="20"
              ></textarea>
              <div class="editor-preview" v-if="postForm.content">
                <h4>预览</h4>
                <div class="markdown-preview" v-html="renderedContent"></div>
              </div>
            </div> -->
            <div>
              <GlobalUEditor v-model="postForm.content" :localConfig="{ initialFrameHeight: 300 }" :editorStyle="{
                maxHeight: '545px',
                maxWidth: '630px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }" />
            </div>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="savePost" :loading="saving">
              创建文章
            </el-button>
            <el-button @click="$router.push('/admin/posts')">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '@/utils/api'
import { ElMessage } from 'element-plus'
import { marked } from 'marked'

import { Plus } from '@element-plus/icons-vue'

const router = useRouter()

const postFormRef = ref(null)
const saving = ref(false)
const categories = ref([])
const tags = ref([])

const postForm = ref({
  title: '',
  excerpt: '',
  content: '',
  category: '',
  tags: [],
  status: 'draft',
  featured: false,
  coverImage: ''
})

const postRules = {
  title: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { min: 2, max: 100, message: '标题长度在2到100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ]
}

const renderedContent = computed(() => {
  if (!postForm.value.content) return ''
  return marked(postForm.value.content)
})

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data
  } catch (error) {
    console.error('获取分类失败:', error)
    ElMessage.error('获取分类失败')
  }
}

const fetchTags = async () => {
  try {
    const response = await api.get('/tags')
    tags.value = response.data
  } catch (error) {
    console.error('获取标签失败:', error)
  }
}

const beforeImageUpload = (rawFile) => {
  const isLt2M = rawFile.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  return isLt2M
}

const handleImageSuccess = (response) => {
  postForm.value.coverImage = response.url
  ElMessage.success('图片上传成功')
}

const handleImageError = (err) => {
  ElMessage.error('图片上传失败')
  console.error(err)
}

const removeImage = () => {
  postForm.value.coverImage = ''
  ElMessage.success('图片已删除')
}

// 上传鉴权头
const uploadHeaders = computed(() => {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
})

const savePost = async () => {
  if (!postFormRef.value) return

  try {
    await postFormRef.value.validate()
    saving.value = true

    const postData = {
      ...postForm.value
    }

    await api.post('/posts', postData)
    ElMessage.success('文章创建成功')
    router.push('/admin/posts')
  } catch (error) {
    console.error('创建文章失败:', error)
    ElMessage.error(error.response?.data?.message || '创建文章失败')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchTags()
  ])
})
</script>

<style scoped>
.create-post-page {
  min-height: 100%;
  background-color: #f0f2f5;
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

.content-section {
  padding: 20px 0;
}

.post-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.editor-container {
  display: flex;
  gap: 20px;
  min-height: 400px;
}

.markdown-editor {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.markdown-editor:focus {
  border-color: var(--primary-color);
}

.editor-preview {
  flex: 1;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 12px;
  background: #fafafa;
  overflow-y: auto;
  max-height: 400px;
}

.editor-preview h4 {
  margin: 0 0 12px 0;
  color: var(--text-color);
  font-size: 14px;
  font-weight: 600;
}

.markdown-preview {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
}

.markdown-preview h1,
.markdown-preview h2,
.markdown-preview h3,
.markdown-preview h4,
.markdown-preview h5,
.markdown-preview h6 {
  margin: 16px 0 8px 0;
  color: var(--text-color);
}

.markdown-preview p {
  margin: 8px 0;
}

.markdown-preview code {
  background: #f1f1f1;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.markdown-preview pre {
  background: #f1f1f1;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-preview blockquote {
  border-left: 4px solid #ddd;
  margin: 8px 0;
  padding-left: 12px;
  color: #666;
}

.image-upload-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.image-uploader {
  width: 150px;
  height: 150px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fafafa;
}

.image-uploader:hover {
  border-color: var(--primary-color);
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.uploaded-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tips {
  margin-top: 10px;
  color: #909399;
  font-size: 0.9em;
}

.upload-tips p {
  margin-bottom: 5px;
}

@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }

  .page-header {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .post-form {
    margin: 0 20px;
    padding: 20px;
  }
}
</style>