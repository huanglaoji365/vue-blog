<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="评论内容" prop="content">
        <el-input
          v-model="queryParams.content"
          placeholder="请输入评论内容"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="评论状态" prop="isApproved">
        <el-select v-model="queryParams.isApproved" placeholder="评论状态" clearable style="width: 240px">
          <el-option label="已审核" :value="true" />
          <el-option label="待审核" :value="false" />
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
          type="success"
          plain
          icon="Check"
          :disabled="multiple"
          @click="handleApprove"
        >批量审核</el-button>
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="commentList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="评论编号" align="center" prop="_id" width="120" />
      <el-table-column label="评论内容" align="center" prop="content" :show-overflow-tooltip="true" min-width="200">
        <template #default="scope">
          <div class="comment-content">
            <span>{{ scope.row.content }}</span>
            <el-tag v-if="scope.row.parentId" size="small" type="info">回复</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="评论用户" align="center" prop="author.username" width="120">
        <template #default="scope">
          <div class="user-info">
            <el-avatar :size="24" :src="scope.row.author?.avatar">
              {{ scope.row.author?.username?.charAt(0)?.toUpperCase() }}
            </el-avatar>
            <span style="margin-left: 8px">{{ scope.row.author?.username }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="文章标题" align="center" prop="post.title" width="150" :show-overflow-tooltip="true">
        <template #default="scope">
          <span class="link-type" @click="viewPost(scope.row.post)">{{ scope.row.post?.title }}</span>
        </template>
      </el-table-column>
      <el-table-column label="评论状态" align="center" prop="isApproved" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isApproved ? 'success' : 'warning'">
            {{ scope.row.isApproved ? '已审核' : '待审核' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="点赞数" align="center" prop="likes" width="80" />
      <el-table-column label="评论时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
        <template #default="scope">
          <el-button
            v-if="!scope.row.isApproved"
            size="small"
            type="text"
            icon="Check"
            @click="handleApprove(scope.row)"
          >审核</el-button>
          <el-button
            v-else
            size="small"
            type="text"
            icon="Close"
            @click="handleReject(scope.row)"
          >拒绝</el-button>
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
</template>

<script setup name="Comment">
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useCommentsApi } from '@/hooks/useCommentsApi'
import Pagination from '@/components/Pagination.vue'
import RightToolbar from '@/components/RightToolbar.vue'

const { proxy } = getCurrentInstance();
const commentsApi = useCommentsApi();

const commentList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const data = reactive({
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    content: null,
    isApproved: null
  }
});

const { queryParams } = toRefs(data);

/** 查询评论列表 */
function getList() {
  loading.value = true;
  const params = {
    page: queryParams.value.pageNum,
    limit: queryParams.value.pageSize,
    search: queryParams.value.content || undefined,
    isApproved: queryParams.value.isApproved
  }
  
  commentsApi.getComments(params).then(response => {
    commentList.value = response.data.comments || [];
    total.value = response.data.total || 0;
    loading.value = false;
  }).catch(error => {
    console.error('获取评论失败:', error);
    ElMessage.error('获取评论失败');
    commentList.value = [];
    total.value = 0;
    loading.value = false;
  });
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

/** 审核按钮操作 */
function handleApprove(row) {
  const commentIds = row ? [row._id] : ids.value;
  const action = row ? '审核' : '批量审核';
  
  ElMessageBox.confirm(`是否确认${action}选中的评论？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const promises = commentIds.map(id => 
      commentsApi.updateComment(id, { isApproved: true })
    );
    
    Promise.all(promises).then(() => {
      ElMessage.success(`${action}成功`);
      getList();
    }).catch(error => {
      console.error(`${action}失败:`, error);
      ElMessage.error(`${action}失败`);
    });
  }).catch(() => {});
}

/** 拒绝按钮操作 */
function handleReject(row) {
  const commentIds = row ? [row._id] : ids.value;
  const action = row ? '拒绝' : '批量拒绝';
  
  ElMessageBox.confirm(`是否确认${action}选中的评论？`, '确认操作', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const promises = commentIds.map(id => 
      commentsApi.updateComment(id, { isApproved: false })
    );
    
    Promise.all(promises).then(() => {
      ElMessage.success(`${action}成功`);
      getList();
    }).catch(error => {
      console.error(`${action}失败:`, error);
      ElMessage.error(`${action}失败`);
    });
  }).catch(() => {});
}

/** 删除按钮操作 */
function handleDelete(row) {
  const commentIds = row ? [row._id] : ids.value;
  const action = row ? '删除' : '批量删除';
  
  ElMessageBox.confirm(`是否确认${action}选中的评论？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const promises = commentIds.map(id => commentsApi.deleteComment(id));
    
    Promise.all(promises).then(() => {
      ElMessage.success(`${action}成功`);
      getList();
    }).catch(error => {
      console.error(`${action}失败:`, error);
      ElMessage.error(`${action}失败`);
    });
  }).catch(() => {});
}

/** 查看文章 */
function viewPost(post) {
  if (post && post._id) {
    window.open(`/posts/${post._id}`, '_blank');
  }
}

// 时间格式化
const parseTime = (time) => {
  if (!time) return '';
  return new Date(time).toLocaleDateString('zh-CN');
};

onMounted(() => {
  getList();
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

.user-info {
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-content {
  display: flex;
  align-items: center;
  gap: 8px;
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
