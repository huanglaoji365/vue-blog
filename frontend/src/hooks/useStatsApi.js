import { api } from '@/utils/api'

export function useStatsApi() {
  // 获取统计数据
  const getStats = () => api.get('/admin/stats')

  return {
    getStats
  }
}
