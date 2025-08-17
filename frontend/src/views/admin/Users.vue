<template>
  <div class="app-container">
    <!-- 搜索区域 -->
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="用户名称" prop="username">
        <el-input
          v-model="queryParams.username"
          placeholder="请输入用户名称"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="用户状态" prop="isActive">
        <el-select v-model="queryParams.isActive" placeholder="用户状态" clearable style="width: 240px">
          <el-option label="正常" :value="true" />
          <el-option label="停用" :value="false" />
        </el-select>
      </el-form-item>
      <el-form-item label="用户角色" prop="role">
        <el-select v-model="queryParams.role" placeholder="用户角色" clearable style="width: 240px">
          <el-option label="管理员" value="admin" />
          <el-option label="普通用户" value="user" />
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
    <el-table v-loading="loading" :data="userList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="用户编号" align="center" prop="_id" width="120" />
      <el-table-column label="用户头像" align="center" prop="avatar" width="100">
        <template #default="scope">
          <el-avatar :size="40" :src="scope.row.avatar">
            {{ scope.row.username?.charAt(0)?.toUpperCase() }}
          </el-avatar>
        </template>
      </el-table-column>
      <el-table-column label="用户名称" align="center" prop="username" :show-overflow-tooltip="true" />
      <el-table-column label="用户邮箱" align="center" prop="email" :show-overflow-tooltip="true" />
      <el-table-column label="用户角色" align="center" prop="role" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'info'">
            {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="用户状态" align="center" prop="isActive" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.isActive ? 'success' : 'danger'">
            {{ scope.row.isActive ? '正常' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
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
            icon="Edit"
            @click="handleUpdate(scope.row)"
          >修改</el-button>
          <el-button
            size="small"
            type="text"
            icon="Key"
            @click="handleResetPwd(scope.row)"
          >重置密码</el-button>
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

<script setup name="User">
import { ref, reactive, toRefs, getCurrentInstance, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUsersApi } from '@/hooks/useUsersApi'
import Pagination from '@/components/Pagination.vue'
import RightToolbar from '@/components/RightToolbar.vue'

const { proxy } = getCurrentInstance();
const router = useRouter();
const usersApi = useUsersApi();

const userList = ref([]);
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
    username: null,
    isActive: null,
    role: null
  }
});

const { queryParams } = toRefs(data);

/** 查询用户列表 */
function getList() {
  loading.value = true;
  const params = {
    page: queryParams.value.pageNum,
    limit: queryParams.value.pageSize,
    search: queryParams.value.username || undefined,
    isActive: queryParams.value.isActive,
    role: queryParams.value.role || undefined
  }
  
  usersApi.getUsers(params).then(response => {
    userList.value = response.data.users || [];
    total.value = response.data.total || 0;
    loading.value = false;
  }).catch(error => {
    console.error('获取用户失败:', error);
    ElMessage.error('获取用户失败');
    userList.value = [];
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

/** 新增按钮操作 */
function handleAdd() {
  ElMessage.info('新增用户功能开发中...');
}

/** 修改按钮操作 */
function handleUpdate(row) {
  ElMessage.info('修改用户功能开发中...');
}

/** 删除按钮操作 */
function handleDelete(row) {
  const _ids = row._id || ids.value;
  const userName = row.username || '该用户';
  
  ElMessageBox.confirm(`是否确认删除用户"${userName}"？`, '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    usersApi.deleteUser(_ids).then(() => {
      ElMessage.success('删除成功');
      getList();
    }).catch(error => {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    });
  }).catch(() => {});
}

/** 重置密码按钮操作 */
function handleResetPwd(row) {
  const userName = row.username || '该用户';
  
  ElMessageBox.confirm(`是否确认重置用户"${userName}"的密码？`, '确认重置', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    usersApi.resetUserPassword(row._id).then(() => {
      ElMessage.success('密码重置成功');
    }).catch(error => {
      console.error('密码重置失败:', error);
      ElMessage.error('密码重置失败');
    });
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  ElMessage.info('导出功能开发中...');
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
  width: 200px;
}
</style>
