<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const { params } = route
  const { path } = params
  
  // 重定向到原始路径
  router.replace('/' + path)
})
</script>
