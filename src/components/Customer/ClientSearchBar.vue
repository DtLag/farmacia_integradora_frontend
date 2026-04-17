<script setup lang="ts">
import { ref, watch } from 'vue'

const query = ref('')
const emit = defineEmits(['search'])

let timeout: number

watch(query, (newVal) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    emit('search', newVal)
  }, 300)
})

function onInput(e: Event){
  const target = e.target as HTMLInputElement
  emit('search', target.value)
}
</script>

<template>
  <div class="relative w-full">
    <input
      type="text"
      v-model="query"
      placeholder="Buscar medicamento o producto..."
      class="w-full rounded-full border border-gray-300 px-4 sm:px-6 py-2.5 text-sm sm:text-base outline-none focus:ring-2 focus:ring-blue-500 transition-shadow bg-gray-50 hover:bg-white shadow-sm"
    />
    <i class="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
  </div>
</template>