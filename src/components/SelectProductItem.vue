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
  <div
    class="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
  >
    <div class="min-w-0 flex-1">
      <p class="truncate font-semibold text-gray-800">
        {{ product.name }}
      </p>

      <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
        <span>Cantidad: {{ product.amount }}</span>
        <span>Precio: ${{ product.sale_price }}</span>
        <span class="font-medium text-gray-700">
          Subtotal: ${{ (product.sale_price * product.amount).toFixed(2) }}
        </span>
      </div>
    </div>

    <button
      type="button"
      @click="removeProduct"
      class="ml-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100"
    >
      Eliminar
    </button>
  </div>
</template>
