<template>
  <div class="pagination-container" v-if="totalValue > 0 || currentPage > 1">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :page-sizes="[10, 20, 30, 50]"
      :background="background"
      :layout="layout"
      :total="totalValue"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  total: {
    required: true,
    type: Number
  },
  page: {
    type: Number,
    default: 1
  },
  limit: {
    type: Number,
    default: 20
  },
  pageSizes: {
    type: Array,
    default() {
      return [10, 20, 30, 50]
    }
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  background: {
    type: Boolean,
    default: true
  },
  autoScroll: {
    type: Boolean,
    default: true
  },
  hidden: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['pagination', 'update:page', 'update:limit'])

// 确保total始终是有效的数字
const totalValue = computed(() => {
  const total = Number(props.total)
  return isNaN(total) ? 0 : total
})

const currentPage = computed({
  get() {
    return props.page
  },
  set(val) {
    emit('update:page', val)
  }
})

const pageSize = computed({
  get() {
    return props.limit
  },
  set(val) {
    emit('update:limit', val)
  }
})

function handleSizeChange(val) {
  pageSize.value = val
  if (currentPage.value * val > totalValue.value) {
    currentPage.value = 1
  }
  emitChange()
}

function handleCurrentChange(val) {
  currentPage.value = val
  emitChange()
}

function emitChange() {
  emit('pagination', {
    page: currentPage.value,
    limit: pageSize.value
  })
  if (props.autoScroll) {
    scrollTo(0, 800)
  }
}
</script>

<style scoped>
.pagination-container {
  background: #fff;
  padding: 32px 16px;
  text-align: center;
}
</style>
