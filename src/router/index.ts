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
import SalesReport from '@/components/SalesReport.vue'
import InventoryReport from '@/components/InventoryReport.vue'
import UserReport from '@/components/UserReport.vue'
import HomeView from '@/views/Customer/Landing/HomeView.vue'
import CustomerLoginView from '@/views/Customer/Auth/Login.vue'
import CustomerRegisterView from '@/views/Customer/Auth/Register.vue'
import ForgotPasswordModal from '@/components/Customer/Auth/ForgotPasswordModal.vue'
import UnauthorizedView from '@/views/UnauthorizedView.vue'

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
      path: '/success',
      name: 'success',
      component: SuccessfulSale,
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
        },
        {
          path: 'forgot-password',
          name: 'customer-forgot-password',
          component: ForgotPasswordModal,
        },
      ],
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      children: [
        {
          path: '',
          redirect: '/dashboard/pos',
        },
        {
          path: 'pos',
          name: 'pos',
          component: PosView,
        },
        {
          path: 'pickup',
          name: 'pickup',
          component: PickUpView,
        },
        {
          path: 'inventory',
          name: 'inventory',
          component: InventoryView,
          meta: { requiresAuth: true, roles: [1] },
        },
        {
          path: 'alerts',
          name: 'alerts',
          component: AlertsView,
        },
        {
          path: 'reports',
          name: 'reports',
          component: ReportsView,
          meta: { requiresAuth: true, roles: [1] },
          children: [
            {
              path: '',
              redirect: '/dashboard/reports/reports-sales',
              meta: { requiresAuth: true, roles: [1] },
            },
            {
              path: 'reports-sales',
              name: 'salesReport',
              component: SalesReport,
              meta: { requiresAuth: true, roles: [1] },
            },
            {
              path: 'reports-inventory',
              name: 'inventoryReport',
              component: InventoryReport,
              meta: { requiresAuth: true, roles: [1] },
            },
            {
              path: 'reports-users',
              name: 'usersReport',
              component: UserReport,
              meta: { requiresAuth: true, roles: [1] },
            },
          ],
        },
        {
          path: 'audits',
          name: 'audits',
          component: AuditsView,
          meta: { requiresAuth: true, roles: [1] },
        },
        {
          path: 'users',
          name: 'users',
          component: UsersView,
          meta: { requiresAuth: true, roles: [1] },
        },
      ],
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView,
      meta: { requiresAuth: true },
    },
  ],
})


router.beforeEach((to) => {
  const authStore = useAuthStore()

  const isAuthenticated = !!authStore.token
  const userRole = authStore.user?.role_id

  console.log('usuario completo:', authStore.user)

  if (to.matched.some((record) => record.meta.requiresAuth) && !isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && isAuthenticated) {
    return { name: 'pos' }
  }

  const allowedRoles = to.matched
    .map((record) => record.meta.roles)
    .find((roles) => Array.isArray(roles)) as number[] | undefined

  if (allowedRoles && userRole !== undefined && !allowedRoles.includes(userRole)) {
    return { name: 'unauthorized' }
  }
  return true
})

export default router
