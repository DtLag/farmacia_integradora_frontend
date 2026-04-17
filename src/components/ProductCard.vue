<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types/types.ts'
import '@/assets/main.css'

const props = defineProps<{
  product: Product
}>()

const productImageUrl = computed(() => {
  const rawUrl = props.product.image_url
  const apiOrigin = new URL(import.meta.env.VITE_API_BASE_URL ?? 'https://api.harold-dev.me/api').origin

  if (!rawUrl) return 'https://via.placeholder.com/200x100?text=Sin+Imagen'

  try {
    const parsed = new URL(rawUrl, apiOrigin)
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return `${apiOrigin}${parsed.pathname}`
    }
    return parsed.href
  } catch {
    return `${apiOrigin}${rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`}`
  }
})
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
      :src="productImageUrl"
      :alt="product.name"
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
