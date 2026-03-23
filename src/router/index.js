import { createRouter, createWebHistory } from 'vue-router'
import Desktop from '../components/Desktop.vue'
import Login from '../views/Login.vue'
import { storage } from '../utils/crypto'

const routes = [
  {
    path: '/',
    name: 'Desktop',
    component: Desktop
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const currentUser = storage.getItem('currentUser')
  const isLoggedIn = storage.getItem('isLoggedIn')
  
  if (to.path !== '/login' && (!currentUser || !isLoggedIn)) {
    // 如果不是登录页面且没有登录，重定向到登录页面
    next('/login')
  } else if (to.path === '/login' && currentUser && isLoggedIn) {
    // 如果是登录页面且已经登录，重定向到桌面
    next('/')
  } else {
    next()
  }
})

export default router
