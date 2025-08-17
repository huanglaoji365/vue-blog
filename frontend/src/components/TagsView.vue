<template>
  <div class="tags-view-container">
    <div class="tags-view-wrapper">
      <div class="tags-view-scroll">
        <div class="tags-view-list">
          <div
            v-for="tag in visitedViews"
            :key="tag.path"
            class="tags-view-item"
            :class="{ active: isActive(tag) }"
            @click="handleTagClick(tag)"
            @contextmenu.prevent="handleRightClick($event, tag)"
          >
            <el-icon v-if="tag.meta?.icon" class="tag-icon">
              <component :is="getIconComponent(tag.meta.icon)" />
            </el-icon>
            <span class="tag-title">{{ tag.meta?.title || tag.name }}</span>
            <el-icon 
              v-if="visitedViews.length > 1"
              class="close-icon"
              @click.stop="closeSelectedTag(tag)"
            >
              <Close />
            </el-icon>
          </div>
        </div>
      </div>
      
      <!-- Tags View Actions -->
      <!-- <div class="tags-view-actions">
        <el-dropdown @command="handleTagsViewCommand">
          <el-button type="text" size="small">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="closeOthers">关闭其他</el-dropdown-item>
              <el-dropdown-item command="closeAll">关闭所有</el-dropdown-item>
              <el-dropdown-item command="refresh">刷新当前</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div> -->
    </div>
  </div>
  
  <!-- 右键菜单 -->
  <div
    v-show="contextMenuVisible"
    ref="contextMenuRef"
    class="context-menu"
    :style="contextMenuStyle"
  >
    <div class="context-menu-item" @click="refreshCurrentTag">
      <el-icon><Refresh /></el-icon>
      <span>刷新当前页面</span>
    </div>
    <div class="context-menu-item" @click="closeCurrentTag">
      <el-icon><Close /></el-icon>
      <span>关闭当前页面</span>
    </div>
    <div class="context-menu-item" @click="closeOtherTags">
      <el-icon><Close /></el-icon>
      <span>关闭其他页面</span>
    </div>
    <div class="context-menu-item" @click="closeAllTags">
      <el-icon><Close /></el-icon>
      <span>关闭所有页面</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { storeToRefs } from 'pinia'
import { Close, MoreFilled, House, Document, Plus, Edit, User, Folder, ChatDotRound, Collection, Refresh } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()


const visitedViews = ref([])
const contextMenuVisible = ref(false)
const contextMenuRef = ref(null)
const currentRightClickTag = ref(null)
const contextMenuStyle = ref({
  left: '0px',
  top: '0px'
})

// 获取图标组件
const getIconComponent = (iconName) => {
  const iconMap = {
    House,
    Document,
    Plus,
    Edit,
    User,
    Folder,
    ChatDotRound,
    Collection
  }
  return iconMap[iconName] || House
}

// 判断标签是否激活
const isActive = (tag) => {
  return tag.path === route.path
}

// 添加访问的视图
const addVisitedView = (view) => {
  if (visitedViews.value.some(v => v.path === view.path)) return
  visitedViews.value.push({
    name: view.name,
    path: view.path,
    meta: view.meta
  })
}

// 处理标签点击
const handleTagClick = (tag) => {
  router.push(tag.path)
}

// 关闭选中的标签
const closeSelectedTag = (view) => {
  const index = visitedViews.value.findIndex(v => v.path === view.path)
  if (index > -1) {
    visitedViews.value.splice(index, 1)
    if (isActive(view)) {
      const latestView = visitedViews.value[visitedViews.value.length - 1]
      if (latestView) {
        router.push(latestView.path)
      } else {
        router.push('/admin')
      }
    }
  }
}

// 处理右键点击
const handleRightClick = (event, tag) => {
  event.preventDefault()
  event.stopPropagation()
  currentRightClickTag.value = tag
  contextMenuVisible.value = true
  
  // 设置右键菜单位置
  const rect = event.target.getBoundingClientRect()
  contextMenuStyle.value = {
    left: rect.left + 'px',
    top: rect.bottom + 'px'
  }
}

// 刷新当前标签
const refreshCurrentTag = () => {
  if (currentRightClickTag.value) {
    // 触发当前组件的刷新
    const currentRoute = router.currentRoute.value
    if (currentRoute.path === currentRightClickTag.value.path) {
      // 如果当前路由就是右键点击的标签，触发组件刷新
      appStore.refreshCurrentPage()
    } else {
      // 如果当前路由不是右键点击的标签，先跳转到该路由再刷新
      router.push(currentRightClickTag.value.path).then(() => {
        setTimeout(() => {
          appStore.refreshCurrentPage()
        }, 100)
      })
    }
  }
  contextMenuVisible.value = false
}

// 关闭当前标签
const closeCurrentTag = () => {
  if (currentRightClickTag.value) {
    closeSelectedTag(currentRightClickTag.value)
  }
  contextMenuVisible.value = false
}

// 关闭其他标签
const closeOtherTags = () => {
  if (currentRightClickTag.value) {
    visitedViews.value = [currentRightClickTag.value]
    if (!isActive(currentRightClickTag.value)) {
      router.push(currentRightClickTag.value.path)
    }
  }
  contextMenuVisible.value = false
}

// 关闭所有标签
const closeAllTags = () => {
  visitedViews.value = []
  router.push('/admin')
  contextMenuVisible.value = false
}

// 处理标签视图命令
const handleTagsViewCommand = (command) => {
  if (command === 'closeOthers') {
    const currentView = visitedViews.value.find(v => v.path === route.path)
    visitedViews.value = currentView ? [currentView] : []
  } else if (command === 'closeAll') {
    visitedViews.value = []
    router.push('/admin')
  } else if (command === 'refresh') {
    // 刷新当前页面内容
    appStore.refreshCurrentPage()
  }
}

// 监听路由变化
watch(
  () => route.path,
  () => {
    addVisitedView(route)
  },
  { immediate: true }
)

onMounted(() => {
  // 添加初始视图
  addVisitedView(route)
  
  // 添加全局点击事件监听，关闭右键菜单
  document.addEventListener('click', () => {
    contextMenuVisible.value = false
  })
  
  // 添加全局右键事件监听，关闭右键菜单
  document.addEventListener('contextmenu', () => {
    contextMenuVisible.value = false
  })
})
</script>

<style scoped>
.tags-view-container {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
}

.tags-view-wrapper {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.tags-view-scroll {
  flex: 1;
  overflow: hidden;
}

.tags-view-list {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 4px;
}

.tags-view-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  color: #6b7280;
  position: relative;
  max-width: 200px;
  min-width: 80px;
}

.tags-view-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.tags-view-item.active {
  background: #409eff;
  border-color: #409eff;
  color: #fff;
}

.tags-view-item.active .close-icon {
  color: #fff;
}

.tag-icon {
  font-size: 12px;
}

.tag-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.close-icon {
  font-size: 10px;
  color: #9ca3af;
  cursor: pointer;
  transition: color 0.2s;
}

.close-icon:hover {
  color: #ef4444;
}

.tags-view-actions {
  display: flex;
  align-items: center;
  margin-left: 8px;
}

/* 自定义右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 140px;
  padding: 4px 0;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  color: #374151;
}

.context-menu-item:hover {
  background-color: #f3f4f6;
}

.context-menu-item .el-icon {
  font-size: 14px;
  color: #6b7280;
}

.context-menu-item span {
  flex: 1;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tags-view-container {
    padding: 0 8px;
  }
  
  .tags-view-item {
    max-width: 120px;
    min-width: 60px;
    padding: 4px 8px;
  }
}
</style>
