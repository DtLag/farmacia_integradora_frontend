<script setup lang="ts">
import type { Product } from '@/types/types.ts'
import '@/assets/main.css'

defineProps<{
  product: Product
}>()
</script>

<template>
  <div
    :class="[
      'rounded-lg border border-gray-300 shadow-md p-3 w-full max-w-[200px] justify-self-center transition relative',
      product.stock === 0
        ? 'opacity-50 cursor-not-allowed bg-gray-100'
        : 'cursor-pointer hover:shadow-lg',
    ]"
  >

    <img
      :src="product.image_url"
      :alt="product.image_url"
      class="mb-2 h-24 w-full rounded object-cover"
    />

    <p class="font-extrabold text-sm leading-tight break-words">
      {{ product.name.toUpperCase() }}
    </p>

    <p class="price">${{ product.sale_price }}</p>
    <p class="text-xs">Stock: {{ product.stock }}</p>
    <p class="text-xs break-all">Código: {{ product.codigo }}</p>
    <p class="text-xs break-words">Ubicación: {{ product.location }}</p>
  </div>

</template>

<style scoped>
.text-xs {
  padding: 3px;
}
.font-extrabold {
  padding-bottom: 3px;
}
</style>
