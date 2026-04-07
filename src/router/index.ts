import { createRouter, createWebHistory } from 'vue-router'
import ProvisionalLogin from '@/views/ProvisionalLogin.vue'
import DashboardView from '@/views/DashboardView.vue'
import { useAuthStore } from '@/stores/auth.ts'
import PosView from '@/views/PosView.vue'
import InventoryView from '@/views/InventoryView.vue'
import AlertsView from '@/views/AlertsView.vue'
import ReportsView from '@/views/ReportsView.vue'
import AuditsView from '@/views/AuditsView.vue'
import UsersView from '@/views/UsersView.vue'
import PickUpView from '@/views/PickUpView.vue'
import SuccessfulSale from '@/components/SuccessfulSale.vue'
import HomeView from '@/views/HomeView.vue'
import CustomerLoginView from '@/views/Customer/Auth/Login.vue'
import CustomerRegisterView from '@/views/Customer/Auth/Register.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: ProvisionalLogin,
    },
    {
      path:'/success',
      name:'success',
      component:SuccessfulSale
    },
    {
      path: '/customer',
      redirect: '/customer/login',
      children: [
        {
          path: 'login',
          name: 'customer-login',
          component: CustomerLoginView,
        },
        {
          path: 'register',
          name: 'customer-register',
          component: CustomerRegisterView,
        }
      ]
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      children: [
        {
          path: '/pos',
          name: 'pos',
          component: PosView,
        },
        {
          path: '/pickup',
          name: 'pickup',
          component: PickUpView,
        },
        {
          path: '/inventory',
          name: 'inventory',
          component: InventoryView,
        },
        {
          path: '/alerts',
          name: 'alerts',
          component: AlertsView,
        },
        {
          path: '/reports',
          name: 'reports',
          component: ReportsView,
        },
        {
          path: '/audits',
          name: 'audits',
          component: AuditsView,
        },
        {
          path: '/users',
          name: 'users',
          component: UsersView,
        },
      ],
    },
  ],
})
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.matched.some((record) => record.meta.requiresAuth)) {

    if (!authStore.token) {
      next({ name: 'login' })
    } else {
      next()
    }
  } else if (to.name === 'login' && authStore.token) {

    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
