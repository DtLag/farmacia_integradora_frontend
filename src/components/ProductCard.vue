<script setup lang="ts">
import type { Product } from '@/types/types.ts'

defineProps<{
  product: Product
}>()
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
        :src="product.image_url || 'https://via.placeholder.com/150'"
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