<script setup lang="ts">
import type { SaleItem } from '@/types/types'

const props = defineProps<{
  product: SaleItem
}>()

const emit = defineEmits<{
  remove: [id: number]
}>()

function removeProduct() {
  emit('remove', props.product.id)
}
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 sm:py-4 shadow-sm hover:shadow-md transition-shadow">
    
    <div class="min-w-0 flex-1">
      <p class="truncate font-bold text-gray-800 text-sm sm:text-base" :title="product.name">
        {{ product.name }}
      </p>

      <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs sm:text-sm text-gray-500">
        <span class="bg-gray-100 px-2 py-0.5 rounded-md font-bold text-gray-600 border border-gray-200">
          Cant: {{ product.amount }}
        </span>
        <span class="font-medium">Precio: ${{ Number(product.sale_price).toFixed(2) }}</span>
        
        <span class="font-black text-[#0B369E] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 shadow-sm ml-auto sm:ml-0">
          Subtotal: ${{ (product.sale_price * product.amount).toFixed(2) }}
        </span>
      </div>
    </div>

    <button
      type="button"
      @click="removeProduct"
      class="w-full sm:w-auto rounded-lg bg-rose-50 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 border border-rose-100 flex items-center justify-center gap-2 shrink-0"
      title="Eliminar producto"
    >
      <i class="fas fa-trash-alt"></i> <span class="sm:hidden">Eliminar</span>
    </button>
    
  </div>
</template>