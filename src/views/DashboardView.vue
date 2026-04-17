<script setup lang="ts">
import MainNavbar from '@/components/MainNavbar.vue'
import { ref, onMounted, onUnmounted } from 'vue'
import { createEchoInstance } from '@/utils/echo'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
let echo: any = null

interface AlertToast {
  id: number;
  message: string;
  product_name: string;
}

const toasts = ref<AlertToast[]>([])
let toastCounter = 0

onMounted(() => {
  if (authStore.token) {
    echo = createEchoInstance(authStore.token)

    echo.private('staff.alerts')
      .listen('.LowStock', (e: any) => {
          console.warn('⚠️ ¡Alerta Global Recibida!', e.alertData)
          
          const id = toastCounter++
          toasts.value.push({
            id,
            message: e.alertData.message,
            product_name: e.alertData.name
          })

          setTimeout(() => {
            closeToast(id)
          }, 6000) 
      })
  }
})

onUnmounted(() => {
  if (echo) {
    echo.leaveChannel('private-staff.alerts')
  }
})

function closeToast(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}
</script>

<template>
  <div class="relative min-h-screen bg-gray-50/50">
    <MainNavbar />
    
    <router-view />

    <div class="fixed top-16 sm:top-auto sm:bottom-6 inset-x-0 mx-auto sm:inset-x-auto sm:right-6 z-[100] flex flex-col gap-3 pointer-events-none px-4 sm:px-0 w-full max-w-sm sm:max-w-md">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          class="bg-white border-l-4 border-amber-500 p-4 rounded-xl shadow-2xl flex items-start justify-between w-full pointer-events-auto mt-2 sm:mt-0 ring-1 ring-gray-200"
        >
          <div class="flex gap-3 items-start">
            <div class="bg-amber-100 text-amber-600 rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5">
              <i class="fas fa-exclamation-triangle text-sm"></i>
            </div>
            <div>
              <h4 class="font-extrabold text-gray-800 text-sm tracking-wide">Stock Bajo: {{ toast.product_name }}</h4>
              <p class="text-xs mt-1 text-gray-500 leading-snug">{{ toast.message }}</p>
            </div>
          </div>
          <button @click="closeToast(toast.id)" class="text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md p-1.5 transition-colors ml-4 shrink-0">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
@media (max-width: 639px) {
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
}
@media (min-width: 640px) {
  .toast-enter-from,
  .toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
  }
}
</style>