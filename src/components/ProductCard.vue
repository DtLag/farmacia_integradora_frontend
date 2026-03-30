<script setup lang="ts">
import type { Product } from '@/types/types.ts'
import '@/assets/main.css'
defineProps<{
  product: Product
}>()
</script>

<template>
  <div class="rounded-lg border border-gray-300 shadow-md p-3 w-[180px]">
    <img :src="product.image_url" class="w-full h-24 object-cover mb-2" />
    <p class="font-extrabold text-sm leading-tight">{{ product.name.toUpperCase() }}</p>
    <p class="price ">${{ product.sale_price }}</p>
    <p class="text-xs">Stock: {{ product.stock }}</p>
    <p class="text-xs">Código: {{ product.codigo }}</p>
    <p class="text-xs">Ubicación: {{ product.location }}</p>
  </div>
</template>

<style scoped>
.text-xs{
  padding: 3px;
}
.font-extrabold{
  padding-bottom: 3px;
}
</style>
/* rounded-xl card border p-4 shadow-sm */
