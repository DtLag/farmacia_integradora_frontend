<script setup lang="ts">
import { computed } from 'vue'
import type { CartItem } from '@/stores/cart'

const props = defineProps<{
  item: CartItem
}>()

const emit = defineEmits(['remove', 'update-quantity'])

const productImageUrl = computed(() => {
  const rawUrl = props.item.product.image_url
  const apiOrigin = new URL(import.meta.env.VITE_API_BASE_URL ?? 'https://api.harold-dev.me/api').origin

  if (!rawUrl) return 'https://via.placeholder.com/50'

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
  <div class="flex items-center justify-between border-b py-4">
    <div class="flex items-center gap-4">
      <img 
        :src="productImageUrl" 
        class="w-16 h-16 object-cover rounded" 
      />
      <div>
        <h4 class="font-bold text-gray-800">{{ item.product.name }}</h4>
        <p class="text-sm text-blue-600 font-semibold">${{ item.product.sale_price }}</p>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center border rounded-lg">
        <button 
          @click="emit('update-quantity', item.product.id, item.quantity - 1)"
          class="px-3 py-1 hover:bg-gray-100 disabled:opacity-30"
          :disabled="item.quantity <= 1"
        >-</button>
        <span class="px-3 py-1 font-medium">{{ item.quantity }}</span>
        <button 
          @click="emit('update-quantity', item.product.id, item.quantity + 1)"
          class="px-3 py-1 hover:bg-gray-100 disabled:opacity-30"
          :disabled="item.quantity >= item.product.stock"
        >+</button>
      </div>
      
      <button @click="emit('remove', item.product.id)" class="text-red-500 hover:text-red-700">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  </div>
</template>
