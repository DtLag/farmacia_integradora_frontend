<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

function goBack() {
  router.back()
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-100">
    <div class="bg-white shadow-lg rounded-2xl p-10 w-[350px] text-center">
      <h1 class="text-6xl font-bold text-blue-600">403</h1>
      <h2 class="mt-2 text-xl font-semibold text-slate-800">Acceso denegado</h2>

      <p class="mt-3 text-slate-500 text-sm">No tienes permisos para acceder a este módulo.</p>

      <div class="mt-6 flex gap-3 justify-center">
        <button
          @click="goBack"
          class="px-4 py-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
        >
          Volver
        </button>

      </div>
    </div>
  </div>
</template>
