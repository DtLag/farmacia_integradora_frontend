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
  <div class="space-y-3">
    <div
      v-if="products.length === 0"
      class="rounded-xl border border-dashed border-gray-300 px-4 py-6 text-center text-gray-500"
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
