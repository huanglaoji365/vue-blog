<template>
  <div class="app-container">
    <!-- 未登录提示 -->
    <LoginPrompt v-if="!authStore.isAuthenticated" />
    
    <!-- 已登录内容 -->
    <div v-else>
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="文章标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入文章标题"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="文章状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="文章状态" clearable style="width: 240px">
          <el-option label="已发布" value="published" />
          <el-option label="草稿" value="draft" />
        </el-select>
      </el-form-item>
      <el-form-item label="文章分类" prop="category">
        <el-select v-model="queryParams.category" placeholder="文章分类" clearable style="width: 240px">
          <el-option 
            v-for="category in categoryOptions" 
            :key="category._id" 
            :label="category.name" 
            :value="category._id" 
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作工具栏 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="文章编号" align="center" prop="_id" width="120" />
      <el-table-column label="文章标题" align="center" prop="title" :show-overflow-tooltip="true" min-width="200">
        <template #default="scope">
          <span class="link-type" @click="handleView(scope.row)">{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="作者" align="center" prop="author.username" width="120">
        <template #default="scope">
          <div class="author-info">
            <el-avatar :size="24" :src="scope.row.author?.avatar">
              {{ scope.row.author?.username?.charAt(0) }}
            </el-avatar>
            <span style="margin-left: 8px">{{ scope.row.author?.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="分类" align="center" prop="category.name" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.category" size="small">{{ scope.row.category.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'published' ? 'success' : 'info'">
            {{ scope.row.status === 'published' ? '已发布' : '草稿' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="浏览量" align="center" prop="views" width="100" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button
            size="small"
            type="text"
            icon="View"
            @click="handleView(scope.row)"
          >查看</el-button>
          <el-button
            size="small"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <pagination
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
    </div>
  </div>
</template>

<script setup name="Post">
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { usePostsApi } from '@/hooks/usePostsApi'
import { useCategoriesApi } from '@/hooks/useCategoriesApi'
import Pagination from '@/components/Pagination.vue'
import RightToolbar from '@/components/RightToolbar.vue'
import LoginPrompt from '@/components/LoginPrompt.vue'

const { proxy } = getCurrentInstance();
const router = useRouter();
const authStore = useAuthStore();
const postsApi = usePostsApi();
const categoriesApi = useCategoriesApi();

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
const categoryOptions = ref([]);

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: null,
    status: null,
    category: null
  },
  rules: {
    title: [
      { required: true, message: "文章标题不能为空", trigger: "blur" }
    ],
    content: [
      { required: true, message: "文章内容不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询文章列表 */
function getList() {
  loading.value = true;
  const params = {
    page: queryParams.value.pageNum,
    limit: queryParams.value.pageSize,
    search: queryParams.value.title || undefined,
    status: queryParams.value.status || undefined,
    category: queryParams.value.category || undefined
  }
  
  postsApi.fetchPosts(params).then(response => {
    postList.value = response.data.posts || [];
    total.value = response.data.total || 0;
    loading.value = false;
  }).catch(error => {
    console.error('获取文章失败:', error);
    ElMessage.error('获取文章失败');
    postList.value = [];
    total.value = 0;
    loading.value = false;
  });
}

// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    _id: null,
    title: null,
    content: null,
    summary: null,
    coverImage: null,
    status: "draft",
    category: null,
    tags: []
  };
  proxy.resetForm("postRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item._id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  router.push('/admin/posts/create');
}

/** 修改按钮操作 */
function handleUpdate(row) {
  const _id = row._id || ids.value[0];
  router.push(`/admin/posts/${_id}/edit`);
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["postRef"].validate(valid => {
    if (valid) {
      if (form.value._id != null) {
        updatePost(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPost(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row._id || ids.value;
  const postTitle = row.title || '该文章';
  
  ElMessageBox.confirm(`是否确认删除文章"${postTitle}"？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    postsApi.deletePost(_ids).then(() => {
      ElMessage.success('删除成功');
      getList();
    }).catch(error => {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    });
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  ElMessage.info('导出功能开发中...');
}

/** 查看按钮操作 */
function handleView(row) {
  window.open(`/posts/${row._id}`, '_blank');
}

// 获取分类选项
const fetchCategories = async () => {
  try {
    const response = await categoriesApi.fetchCategories();
    categoryOptions.value = response.data;
  } catch (error) {
    console.error('获取分类失败:', error);
  }
};

// 时间格式化
const parseTime = (time) => {
  if (!time) return '';
  return new Date(time).toLocaleDateString('zh-CN');
};

onMounted(() => {
  getList();
  fetchCategories();
});
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.mb8 {
  margin-bottom: 8px;
}

.link-type {
  color: #409eff;
  cursor: pointer;
}

.link-type:hover {
  text-decoration: underline;
}

.author-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.small-padding {
  padding: 8px;
}

.fixed-width {
  width: 200px;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .app-container {
    padding: 12px;
  }

  :deep(.el-form--inline) .el-form-item {
    margin-right: 8px;
    margin-bottom: 8px;
  }

  :deep(.el-form--inline) .el-input,
  :deep(.el-form--inline) .el-select {
    width: 160px !important;
  }

  :deep(.el-row.mb8) .el-button + .el-button {
    margin-left: 8px;
  }

  :deep(.el-table) {
    font-size: 12px;
  }

  :deep(.el-table .cell) {
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style>
