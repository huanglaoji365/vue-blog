import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import PostDetail from '@/views/PostDetail.vue'
import Posts from '@/views/Posts.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import Dashboard from '@/views/admin/Dashboard.vue'
import AdminPosts from '@/views/admin/Posts.vue'
import CreatePost from '@/views/admin/CreatePost.vue'
import EditPost from '@/views/admin/EditPost.vue'
import Users from '@/views/admin/Users.vue'
import Categories from '@/views/admin/Categories.vue'
import Comments from '@/views/admin/Comments.vue'
import Tags from '@/views/admin/Tags.vue'
import NotFound from '@/views/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/posts',
    name: 'Posts',
    component: Posts
  },
  {
    path: '/posts/:id',
    name: 'PostDetail',
    component: PostDetail
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard,
        meta: { title: '仪表盘', icon: 'House' }
      },
      {
        path: 'posts',
        name: 'AdminPosts',
        component: AdminPosts,
        meta: { title: '文章管理', icon: 'Document' }
      },
      {
        path: 'posts/create',
        name: 'CreatePost',
        component: CreatePost,
        meta: { title: '新建文章', icon: 'Plus' }
      },
      {
        path: 'posts/:id/edit',
        name: 'EditPost',
        component: EditPost,
        meta: { title: '编辑文章', icon: 'Edit' }
      },
      {
        path: 'users',
        name: 'Users',
        component: Users,
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'categories',
        name: 'Categories',
        component: Categories,
        meta: { title: '分类管理', icon: 'Folder' }
      },
      {
        path: 'comments',
        name: 'Comments',
        component: Comments,
        meta: { title: '评论管理', icon: 'ChatDotRound' }
      },
      {
        path: 'tags',
        name: 'Tags',
        component: Tags,
        meta: { title: '标签管理', icon: 'Collection' }
      }
    ]
  },
  {
    path: '/redirect/:path(.*)',
    name: 'Redirect',
    component: () => import('@/views/Redirect.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // 如果需要认证但用户未登录
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
    return
  }
  
  // 如果需要管理员权限，先确保用户信息已加载
  if (to.meta.requiresAdmin) {
    // 如果有 token 但用户信息未加载，先获取用户信息
    if (authStore.token && !authStore.user) {
      try {
        await authStore.fetchProfile()
      } catch (error) {
        // 如果获取用户信息失败，清除 token 并跳转到登录页
        authStore.logout()
        next('/login')
        return
      }
    }
    
    // 检查是否为管理员
    if (!authStore.isAdmin) {
      next('/')
      return
    }
  }
  
  next()
})

export default router
