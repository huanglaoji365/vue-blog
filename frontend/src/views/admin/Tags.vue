<template>
  <div class="app-container">
    <!-- 未登录提示 -->
    <LoginPrompt v-if="!authStore.isAuthenticated" />
    
    <!-- 已登录内容 -->
    <div v-else>
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="标签名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入标签名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
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
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <!-- 数据表格 -->
    <el-table v-loading="loading" :data="tagList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="标签编号" align="center" prop="_id" width="120" />
      <el-table-column label="标签名称" align="center" prop="name" :show-overflow-tooltip="true" />
      <el-table-column label="标签描述" align="center" prop="description" :show-overflow-tooltip="true" />
      <el-table-column label="文章数量" align="center" prop="count" width="100" />
      <el-table-column label="创建时间" align="center" prop="createdAt" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
        <template #default="scope">
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

    <!-- 添加或修改标签对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="tagRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标签名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入标签名称" />
        </el-form-item>
        <el-form-item label="标签描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入标签描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </div>
</template>

<script setup name="Tag">
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useTagsApi } from '@/hooks/useTagsApi'
import Pagination from '@/components/Pagination.vue'
import RightToolbar from '@/components/RightToolbar.vue'
import LoginPrompt from '@/components/LoginPrompt.vue'

const { proxy } = getCurrentInstance();
const authStore = useAuthStore();
const tagsApi = useTagsApi();

const tagList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null
  },
  rules: {
    name: [
      { required: true, message: "标签名称不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询标签列表 */
function getList() {
  loading.value = true;
  const params = {
    page: queryParams.value.pageNum,
    limit: queryParams.value.pageSize,
    search: queryParams.value.name || undefined
  }
  
  tagsApi.getTags(params).then(response => {
    tagList.value = response.data.tags || [];
    total.value = response.data.total || 0;
    loading.value = false;
  }).catch(error => {
    console.error('获取标签失败:', error);
    ElMessage.error('获取标签失败');
    tagList.value = [];
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
    name: null,
    description: null
  };
  proxy.resetForm("tagRef");
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
  reset();
  open.value = true;
  title.value = "添加标签";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row._id || ids.value[0];
  tagsApi.getTag(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改标签";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["tagRef"].validate(valid => {
    if (valid) {
      if (form.value._id != null) {
        tagsApi.updateTag(form.value._id, form.value).then(response => {
          ElMessage.success("修改成功");
          open.value = false;
          getList();
        });
      } else {
        tagsApi.createTag(form.value).then(response => {
          ElMessage.success("新增成功");
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
  const tagName = row.name || '该标签';
  
  ElMessageBox.confirm(`是否确认删除标签"${tagName}"？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    tagsApi.deleteTag(_ids).then(() => {
      ElMessage.success('删除成功');
      getList();
    }).catch(error => {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    });
  }).catch(() => {});
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

.small-padding {
  padding: 8px;
}

.fixed-width {
  width: 150px;
}

.dialog-footer {
  text-align: center;
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

  :deep(.el-dialog) {
    width: 92vw !important;
  }

  :deep(.el-dialog__body) {
    padding: 16px;
  }
}
</style>
