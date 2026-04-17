import { createFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL,

  options: {
    async beforeFetch({ options, cancel }) {
      const authStore = useAuthStore()

      if (!authStore.token) {
        cancel()

        // 1. Detectar si estamos en la zona de clientes
        const path = router.currentRoute.value.path
        const isCustomerRoute =
          path.startsWith('/customer') || path === '/cart' || path === '/checkout'
        const loginPath = isCustomerRoute ? '/customer/login' : '/login'

        router.push({
          path: loginPath,
          query: { redirect: router.currentRoute.value.fullPath },
        })

        return { options }
      }

      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${authStore.token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }

      return { options }
    },

    onFetchError(ctx) {
      const authStore = useAuthStore()

      if (ctx.response?.status === 401) {
        authStore.logOut?.()

        // 2. Detectar también aquí para cuando el token expira o Laravel nos rebota
        const path = router.currentRoute.value.path
        const isCustomerRoute =
          path.startsWith('/customer') || path === '/cart' || path === '/checkout'
        const loginPath = isCustomerRoute ? '/customer/login' : '/login'

        router.push({
          path: loginPath,
          query: { redirect: router.currentRoute.value.fullPath },
        })
      }

      return ctx
    },
  },

  fetchOptions: {
    mode: 'cors',
  },
})
