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
          
          // 1. Creamos la notificación
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
  <div class="relative min-h-screen">
    <MainNavbar />
    <router-view />

    <div class="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <transition-group name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          class="bg-amber-100 border-l-4 border-amber-500 text-amber-900 p-4 rounded-r-lg shadow-xl flex items-start justify-between min-w-[320px] max-w-md pointer-events-auto"
        >
          <div class="flex gap-3 items-start">
            <div class="bg-amber-500 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 mt-0.5">
              <i class="fas fa-exclamation text-xs"></i>
            </div>
            <div>
              <h4 class="font-bold text-sm tracking-wide">Stock Bajo: {{ toast.product_name }}</h4>
              <p class="text-xs mt-1 text-amber-800 leading-snug">{{ toast.message }}</p>
            </div>
          </div>
          <button @click="closeToast(toast.id)" class="text-amber-800 hover:text-amber-600 transition-colors ml-4 p-1">
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
.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>