<template>
  <div class="right-toolbar">
    <el-button
      type="primary"
      plain
      icon="Download"
      @click="exportData"
      v-if="showExport"
    >
      导出
    </el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  showSearch: {
    type: Boolean,
    default: true
  },
  showExport: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['queryTable', 'update:showSearch'])

function exportData() {
  emit('export')
}
</script>

<style scoped>
.right-toolbar {
  display: flex;
  gap: 8px;
}
</style>
