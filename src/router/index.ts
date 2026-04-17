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
import UnauthorizedView from '@/views/UnauthorizedView.vue'
import ProductsView from '@/views/Customer/Landing/ProductsView.vue'
import CartView from '@/views/Customer/Landing/CartView.vue'
import MyOrdersView from '@/views/Customer/Landing/MyOrdersView.vue'
import PersonalInfoView from '@/views/Customer/Profile/PersonalInfoView.vue'
import EditProfileView from '@/views/Customer/Profile/EditProfileView.vue'
import TicketView from '@/views/TicketView.vue'

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
        { path: 'login', name: 'customer-login', component: CustomerLoginView },
        { path: 'register', name: 'customer-register', component: CustomerRegisterView },
        { path: 'products', name: 'products', component: ProductsView },
        // Rutas de cliente que SÍ requieren autenticación
        { path: 'cart', name: 'cart', component: CartView, meta: { requiresAuth: true } },
        { path: 'my-orders', name: 'my-orders', component: MyOrdersView, meta: { requiresAuth: true } },
        { path: 'profile/info', name: 'customer-profile-info', component: PersonalInfoView, meta: { requiresAuth: true } },
        { path: 'profile/edit', name: 'customer-profile-edit', component: EditProfileView, meta: { requiresAuth: true } },
      ],
    },
    {
      path: '/dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, isStaff: true }, 
      children: [
        { path: '', redirect: '/dashboard/pos' },
        { path: 'pos', name: 'pos', component: PosView },
        { path: 'pickup', name: 'pickup', component: PickUpView },
        { path: 'alerts', name: 'alerts', component: AlertsView },
        {
          path: 'inventory',
          name: 'inventory',
          component: InventoryView,
          meta: { roles: ['Administrador'] },
        },
        {
          path: 'reports',
          component: ReportsView,
          meta: { roles: ['Administrador'] },
          children: [
            { path: '', redirect: '/dashboard/reports/reports-sales' },
            { path: 'reports-sales', name: 'salesReport', component: SalesReport },
            { path: 'reports-inventory', name: 'inventoryReport', component: InventoryReport },
            { path: 'reports-users', name: 'usersReport', component: UserReport },
          ],
        },
        {
          path: 'audits',
          name: 'audits',
          component: AuditsView,
          meta: { roles: ['Administrador'] },
        },
        {
          path: 'users',
          name: 'users',
          component: UsersView,
          meta: { roles: ['Administrador'] },
        },
        {
          path: 'tickets',
          name: 'tickets',
          component: TicketView,
          meta: { roles: ['Administrador'] },
        },
      ],
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: UnauthorizedView,
      meta: { title: 'No autorizado' },
    },
  ],
})

router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'Farmacia Integradora'
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  const isAuthenticated = !!authStore.token && !!authStore.user
  const isStaffUser = !!authStore.user?.role

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      return to.path.startsWith('/customer') ? { name: 'customer-login' } : { name: 'login' }
    }
  }

  if (['login', 'customer-login', 'customer-register'].includes(to.name as string) && isAuthenticated) {
    return { name: isStaffUser ? 'pos' : 'home' }
  }

  if (to.matched.some((record) => record.meta.isStaff)) {
    if (!isStaffUser) {
      return { name: 'unauthorized' } 
    }
  }

  const allowedRoles = to.matched
    .map((record) => record.meta.roles)
    .find((roles) => Array.isArray(roles)) as string[] | undefined

  if (allowedRoles && isStaffUser) {
    const currentRole = typeof authStore.user?.role === 'string' 
      ? authStore.user.role 
      : (authStore.user?.role as any)?.slug || (authStore.user?.role as any)?.name

    if (!currentRole || !allowedRoles.includes(currentRole)) {
      return { name: 'unauthorized' }
    }
  }

  return true
})

export default router