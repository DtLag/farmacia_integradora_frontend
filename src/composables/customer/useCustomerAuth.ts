import { ref } from 'vue'
import router from '@/router'
import { usePublicApi } from '@/composables/usePublicApi'
import { useAuthStore } from '@/stores/auth'
import type { Credentials, User } from '@/types/types'

interface RegisterPayload {
  name: string
  email: string
  phone: string
  password: string
}

interface AuthResponse {
  token: string
  user: User
}

export function useCustomerAuth() {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const authStore = useAuthStore()

  async function login(payload: Credentials) {
    loading.value = true
    error.value = null
    try {
      const { data, error: fetchError } = await usePublicApi('login/customer').post(payload).json<AuthResponse>()

      if (fetchError.value) throw new Error('No se pudo iniciar sesión')
      if (!data.value?.token || !data.value?.user) throw new Error('Respuesta inválida del servidor')

      authStore.logIn(data.value.token, data.value.user)
      await router.push('/')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error inesperado'
    } finally {
      loading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null

    console.log(payload)
    try {
      const { error: fetchError } = await usePublicApi('register/customer').post(payload).json()

      if (fetchError.value) {
        console.error('Error en registro:', fetchError.value)
        throw new Error('No se pudo crear la cuenta')
      }

      return payload.email

    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Error inesperado'
    } finally {
      loading.value = false
    }
  }
  return { loading, error, login, register }
}