<template>
  <div class="not-found">
    <div class="container">
      <div class="not-found-content">
        <div class="error-code">404</div>
        <h1>页面未找到</h1>
        <p>抱歉，您访问的页面不存在或已被删除。</p>
        <el-button type="primary" @click="$router.push('/')">
          返回首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
// 404页面不需要Header组件
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.not-found-content {
  text-align: center;
  color: white;
  padding: 40px;
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.not-found-content h1 {
  font-size: 2.5rem;
  margin-bottom: 20px;
  font-weight: 300;
}

.not-found-content p {
  font-size: 1.2rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

@media (max-width: 768px) {
  .error-code {
    font-size: 4rem;
  }
  
  .not-found-content h1 {
    font-size: 1.8rem;
  }
  
  .not-found-content p {
    font-size: 1rem;
  }
}
</style>
