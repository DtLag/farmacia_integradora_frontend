import { createRouter, createWebHistory } from 'vue-router'
import ProvisionalLogin from '@/views/ProvisionalLogin.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: ProvisionalLogin,
    },
  ],
})

export default router
