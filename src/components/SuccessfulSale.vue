<script setup lang="ts">
import router from '@/router'
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

const values = defineProps<saleValues>()

</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  >
    <div class="bg-white rounded-xl shadow-lg w-full max-w-md">
      <!-- HEADER -->
      <div class="bg-blue-600 text-white px-6 py-4 rounded-t-xl justify-items-center">
        <h1 class="text-xl font-semibold">Venta realizada</h1>
      </div>
      <!-- BODY -->
      <div class="flex flex-col items-center justify-center gap-4 py-6 px-6">
        <!-- Animación -->
        <div class="w-24 h-24 flex items-center justify-center overflow-hidden">
          <div ref="animationContainer" class="scale-500"></div>
        </div>
        <!-- Totales -->
        <div class="w-full mt-4 text-center">
          <p class="text-xl font-bold">Total: ${{ total }}</p>
          <p class="text-gray-600">Cambio: ${{ change }}</p>
        </div>
      </div>
      <!-- FOOTER -->


    </div>
  </div>
</template>

<style scoped>
hr {
  border: none;
  height: 1px;
  background-color: #a3a2a2;
}
</style>
