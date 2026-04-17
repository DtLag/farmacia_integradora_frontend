<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import type { Credentials } from '@/types/types.ts'
import { usePublicApi } from '@/composables/usePublicApi'

const authStore = useAuthStore()
const router = useRouter()

const credenciales = ref<Credentials>({
  email: 'admin@farmacia.com',
  password: 'password',
})

const isLoading = ref(false)

async function login() {
  isLoading.value = true
  try {
    const { data, error: fetchError } = await usePublicApi('login/staff')
      .post(credenciales.value)
      .json()
      
    if (fetchError.value) {
      alert('Credenciales incorrectas.')
      isLoading.value = false
      return
    }

    authStore.logIn(data.value.token, data.value.user)
    await router.push('/dashboard')
  } catch (error) {
    console.error('Error en el login:', error)
    alert('Ocurrió un error al intentar iniciar sesión.')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
    <div class="w-full max-w-md bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,23,42,0.08)] border border-gray-100">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
          <i class="fas fa-clinic-medical"></i>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-gray-900">Iniciar sesión</h1>
        <p class="text-sm text-gray-500 mt-2">Ingresa tus credenciales de empleado</p>
      </div>

      <form @submit.prevent="login" class="space-y-5">
        <div class="space-y-1.5">
          <label for="email" class="block text-sm font-bold text-gray-700">Correo electrónico</label>
          <div class="relative">
            <input
              id="email"
              type="email"
              v-model="credenciales.email"
              placeholder="admin@farmacia.com"
              class="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0B369E] focus:border-transparent outline-none transition-all text-sm sm:text-base"
              required
            />
            <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="password" class="block text-sm font-bold text-gray-700">Contraseña</label>
          <div class="relative">
            <input
              id="password"
              type="password"
              v-model="credenciales.password"
              placeholder="••••••••"
              class="w-full px-4 py-3.5 pl-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#0B369E] focus:border-transparent outline-none transition-all text-sm sm:text-base"
              required
            />
            <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-[#0B369E] to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
        >
          <i v-if="isLoading" class="fas fa-spinner animate-spin"></i>
          {{ isLoading ? 'Verificando...' : 'Acceder al sistema' }}
        </button>
      </form>
      
    </div>
  </div>
</template>