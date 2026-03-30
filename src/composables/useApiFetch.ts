import { createFetch } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

export const useApi = createFetch({
  baseUrl: 'https://api.harold-dev.me/api/',

  options: {
    async beforeFetch({ options, cancel }) {
      const authStore = useAuthStore()

      if (!authStore.token) {
        cancel()
      }
      if (authStore.token) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }
      }

      return { options }
    },

    onFetchError(ctx) {
      const authStore = useAuthStore()

      if (ctx.response?.status === 401) {
        authStore.logOut()
        router.push('/login')
      }

      return ctx
    },
  },

  fetchOptions: {
    mode: 'cors',
    credentials: 'include',
  },
})
