<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types/types.ts'

const props = defineProps<{
  product: Product
}>()

const productImageUrl = computed(() => {
  const rawUrl = props.product.image_url

  if (!rawUrl) return 'https://via.placeholder.com/200x100?text=Sin+Imagen'

  // Si la URL ya viene completa desde el backend (ej. S3 o ruta absoluta), la usamos directo
  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl
  }

  // Obtenemos la URL base de Vite y le removemos el '/api' del final
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.harold-dev.me/api').replace(/\/api\/?$/, '')

  // Limpiamos la ruta y nos aseguramos de que contenga '/storage/'
  let path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  if (!path.startsWith('/storage/')) {
    path = `/storage${path}`
  }

  return `${baseUrl}${path}`
})
</script>

<template>
  <div
    :class="[
      'rounded-xl border border-gray-200 shadow-sm p-3 w-full flex flex-col h-full transition-all duration-200 relative overflow-hidden bg-white',
      product.stock === 0
        ? 'opacity-60 cursor-not-allowed grayscale-[30%]'
        : 'cursor-pointer hover:shadow-md hover:border-blue-300 hover:-translate-y-0.5',
    ]"
  >
    <div v-if="product.stock === 0" class="absolute top-2 right-2 bg-red-600 text-white text-[10px] sm:text-xs font-bold px-2 py-1 rounded-md z-10 shadow-sm">
      AGOTADO
    </div>

    <div class="h-24 sm:h-28 w-full bg-gray-50 rounded-lg mb-3 overflow-hidden shrink-0 border border-gray-100 relative">
      <img
        :src="productImageUrl"
        :alt="product.name"
        class="h-full w-full object-cover"
      />
    </div>

    <div class="flex flex-col flex-grow">
      <p class="font-bold text-gray-800 text-xs sm:text-sm leading-tight line-clamp-2 mb-2" :title="product.name">
        {{ product.name.toUpperCase() }}
      </p>

      <div class="mt-auto space-y-1">
        <p class="text-base sm:text-lg font-black text-[#0B369E]">${{ product.sale_price }}</p>
        
        <div class="flex items-center justify-between text-[10px] sm:text-xs text-gray-500 gap-1">
          <span class="font-medium px-1.5 py-0.5 bg-gray-100 rounded shrink-0 border border-gray-200">Stock: {{ product.stock }}</span>
          <span class="truncate">Cod: {{ product.codigo }}</span>
        </div>
        
        <p class="text-[10px] sm:text-xs text-gray-400 truncate w-full mt-1.5">
          <i class="fas fa-map-marker-alt text-gray-300 mr-1"></i> {{ product.location || 'Sin ubicación' }}
        </p>
      </div>
    </div>
  </div>
</template>