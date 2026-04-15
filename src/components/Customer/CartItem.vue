<script setup lang="ts">
import type { CartItem } from '@/stores/cart'

defineProps<{
  item: CartItem
}>()

const emit = defineEmits(['remove', 'update-quantity'])
</script>

<template>
  <div class="flex items-center justify-between border-b py-4">
    <div class="flex items-center gap-4">
      <img 
        :src="item.product.image_url || 'https://via.placeholder.com/50'" 
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