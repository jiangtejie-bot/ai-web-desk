import { createRouter, createWebHistory } from 'vue-router'
import Desktop from '../components/Desktop.vue'

const routes = [
  {
    path: '/',
    name: 'Desktop',
    component: Desktop
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
