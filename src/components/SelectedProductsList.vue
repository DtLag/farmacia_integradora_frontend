<script setup lang="ts">
import type { SaleItem } from '@/types/types'
import SelectedProductItem from '@/components/SelectProductItem.vue'

defineProps<{
  products: SaleItem[]
}>()

const emit = defineEmits<{
  remove: [id: number]
}>()
</script>

<template>
  <div class="space-y-2 sm:space-y-3">
    <div
      v-if="products.length === 0"
      class="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-8 text-center text-sm text-gray-500 font-medium"
    >
      No hay productos seleccionados
    </div>

    <SelectedProductItem
      v-for="product in products"
      :key="product.id"
      :product="product"
      @remove="emit('remove', $event)"
    />
  </div>
</template>