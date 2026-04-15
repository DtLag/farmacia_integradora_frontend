<script setup lang="ts">
import { computed } from 'vue'
import type { Product } from '@/types/types'
import { useCartStore } from '@/stores/cart'

const props = defineProps<{
  product: Product
}>()

const cartStore = useCartStore()

const quantityInCart = computed(() => {
  const item = cartStore.items.find(i => i.product.id === props.product.id)
  return item ? item.quantity : 0
})

const hasAvailableStock = computed(() => {
  return quantityInCart.value < props.product.stock
})

const emit = defineEmits(['add-to-cart'])

function handleAddToCart() {
  if (hasAvailableStock.value) {
    emit('add-to-cart', props.product)
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
    <div class="h-48 overflow-hidden bg-gray-100 relative">
      <img 
        :src="product.image_url || 'https://via.placeholder.com/300x200?text=Sin+Imagen'" 
        :alt="product.name"
        class="w-full h-full object-cover"
      />
      <div v-if="quantityInCart > 0" class="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
        En carrito: {{ quantityInCart }}
      </div>
    </div>

    <div class="p-4 flex flex-col flex-grow">
      <h3 class="font-bold text-gray-800 text-lg mb-1">{{ product.name }}</h3>
      
      <p class="text-sm mb-4" :class="hasAvailableStock ? 'text-gray-500' : 'text-red-500 font-medium'">
        Stock: {{ product.stock - quantityInCart }} disponibles
      </p>
      
      <div class="mt-auto flex items-center justify-between">
        <span class="text-xl font-bold text-blue-600">${{ product.sale_price }}</span>
        
        <button 
          type="button" 
          @click="handleAddToCart"
          :disabled="!hasAvailableStock || product.stock <= 0"
          class="bg-[#0B369E] hover:bg-blue-800 disabled:bg-gray-300 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <template v-if="product.stock <= 0">
            Agotado
          </template>
          <template v-else-if="!hasAvailableStock">
            Límite alcanzado
          </template>
          <template v-else>
            <i class="fas fa-plus"></i> Añadir
          </template>
        </button>
      </div>
    </div>
  </div>
</template>