<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
    <div class="bg-white shadow-xl shadow-gray-200/50 border border-gray-100 rounded-[24px] p-8 sm:p-10 w-full max-w-sm text-center transform transition-all animate-in zoom-in-95 duration-300">
      
      <div class="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-shield-alt text-4xl text-red-500"></i>
      </div>
      
      <h1 class="text-5xl sm:text-6xl font-black text-gray-900 mb-2">403</h1>
      <h2 class="text-lg sm:text-xl font-bold text-gray-800 uppercase tracking-wide">Acceso denegado</h2>

      <p class="mt-3 text-gray-500 text-sm sm:text-base px-4">
        Tu rol actual no tiene los permisos necesarios para acceder a este módulo.
      </p>

      <div class="mt-8 flex justify-center">
        <button
          @click="goBack"
          class="w-full bg-[#0B369E] hover:bg-blue-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <i class="fas fa-arrow-left"></i> Volver atrás
        </button>
      </div>
    </div>
  </div>
</template>