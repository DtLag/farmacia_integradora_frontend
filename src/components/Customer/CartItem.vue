<script setup lang="ts">
import type { CartItem } from '@/stores/cart'

defineProps<{
  item: CartItem
}>()

const emit = defineEmits(['remove', 'update-quantity'])
</script>

<template>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 py-4 sm:py-5 gap-4">
    <div class="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
      <img 
        :src="item.product.image_url || 'https://via.placeholder.com/60'" 
        class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-gray-100 shadow-sm shrink-0" 
      />
      <div class="flex-grow min-w-0">
        <h4 class="font-bold text-gray-800 text-sm sm:text-base line-clamp-2 leading-tight" :title="item.product.name">
          {{ item.product.name }}
        </h4>
        <p class="text-sm text-blue-600 font-extrabold mt-1">${{ item.product.sale_price }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto ml-[4.5rem] sm:ml-0">
      <div class="flex items-center border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
        <button 
          @click="emit('update-quantity', item.product.id, item.quantity - 1)"
          class="px-3 sm:px-4 py-1.5 hover:bg-gray-200 text-gray-600 font-medium transition-colors disabled:opacity-30 rounded-l-lg"
          :disabled="item.quantity <= 1"
        >-</button>
        <span class="px-3 sm:px-4 py-1.5 font-bold text-sm bg-white min-w-[2.5rem] text-center border-x border-gray-200">
          {{ item.quantity }}
        </span>
        <button 
          @click="emit('update-quantity', item.product.id, item.quantity + 1)"
          class="px-3 sm:px-4 py-1.5 hover:bg-gray-200 text-gray-600 font-medium transition-colors disabled:opacity-30 rounded-r-lg"
          :disabled="item.quantity >= item.product.stock"
        >+</button>
      </div>
      
      <button @click="emit('remove', item.product.id)" class="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Eliminar del carrito">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
  </div>
</template>