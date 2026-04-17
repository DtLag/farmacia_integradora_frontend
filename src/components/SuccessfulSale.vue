<script setup lang="ts">
import type { saleValues } from '@/types/types.ts'
import lottie from 'lottie-web'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import checkAnimation from '@/assets/check-success.json'

const animationContainer = ref<HTMLElement | null>(null)
let animationInstance: any = null

onMounted(() => {
  if (animationContainer.value) {
    animationInstance = lottie.loadAnimation({
      container: animationContainer.value,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: checkAnimation,
    })
  }
})

onBeforeUnmount(() => {
  if (animationInstance) {
    animationInstance.destroy()
  }
})

defineProps<saleValues>()

// Emitimos un evento claro para que el componente padre cierre el modal
const emit = defineEmits(['close'])
</script>

<template>
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md transform transition-all flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
      
      <div class="bg-emerald-600 text-white px-6 py-4 text-center">
        <h1 class="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2">
          <i class="fas fa-check-circle"></i> Venta Exitosa
        </h1>
      </div>
      
      <div class="flex flex-col items-center justify-center p-6 sm:p-8">
        
        <div class="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center mb-2">
          <div ref="animationContainer" class="w-full h-full"></div>
        </div>
        
        <div class="w-full text-center space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100 mt-2">
          <div class="flex justify-between items-center text-gray-600 text-sm sm:text-base border-b border-gray-200 pb-2">
            <span>Total cobrado:</span>
            <span class="font-bold text-gray-900">${{ total }}</span>
          </div>
          <div class="flex justify-between items-center text-gray-600 text-sm sm:text-base pt-1">
            <span>Su cambio:</span>
            <span class="font-black text-emerald-600 text-xl sm:text-2xl">${{ change }}</span>
          </div>
        </div>
      </div>
      
      <div class="p-4 sm:p-6 bg-gray-50 border-t border-gray-100">
        <button 
          @click="emit('close')"
          class="w-full bg-[#0B369E] hover:bg-blue-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <i class="fas fa-plus"></i> Nueva Venta
        </button>
      </div>
    </div>
  </div>
</template>