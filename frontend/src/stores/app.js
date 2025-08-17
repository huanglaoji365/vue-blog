import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const refreshKey = ref(0)
  const refreshCount = ref(0)
  
  // 刷新当前页面
  const refreshCurrentPage = () => {
    refreshKey.value++
    refreshCount.value++
  }
  
  return {
    refreshKey,
    refreshCount,
    refreshCurrentPage
  }
})
