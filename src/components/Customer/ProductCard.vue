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

const productImageUrl = computed(() => {
  const rawUrl = props.product.image_url

  if (!rawUrl) return 'https://via.placeholder.com/300x200?text=Sin+Imagen'

  if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    return rawUrl
  }

  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://api.harold-dev.me/api').replace(/\/api\/?$/, '')

  let path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
  if (!path.startsWith('/storage/')) {
    path = `/storage${path}`
  }

  return `${baseUrl}${path}`
})

const emit = defineEmits(['add-to-cart'])

function handleAddToCart() {
  if (hasAvailableStock.value) {
    emit('add-to-cart', props.product)
  }
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group">
    <div class="h-40 sm:h-48 overflow-hidden bg-gray-50 relative border-b border-gray-100">
      <img 
        :src="productImageUrl" 
        :alt="product.name"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div v-if="quantityInCart > 0" class="absolute top-2 right-2 bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full shadow-md z-10">
        En carrito: {{ quantityInCart }}
      </div>
    </div>

    <div class="p-3 sm:p-4 flex flex-col flex-grow">
      <h3 class="font-bold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2 min-h-[2.5rem]" :title="product.name">
        {{ product.name }}
      </h3>
      
      <p class="text-xs sm:text-sm mb-3 sm:mb-4" :class="hasAvailableStock ? 'text-gray-500' : 'text-red-500 font-medium'">
        Stock: {{ product.stock - quantityInCart }} disponibles
      </p>
      
      <div class="mt-auto flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 sm:gap-3">
        <span class="text-base sm:text-xl font-extrabold text-blue-700 w-full sm:w-auto text-left">
          ${{ product.sale_price }}
        </span>
        
        <button 
          type="button" 
          @click="handleAddToCart"
          :disabled="!hasAvailableStock || product.stock <= 0"
          class="w-full sm:w-auto bg-[#0B369E] hover:bg-blue-800 disabled:bg-gray-200 disabled:text-gray-500 text-white text-xs sm:text-sm font-semibold py-2 sm:py-2 px-3 sm:px-4 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <template v-if="product.stock <= 0">
            Agotado
          </template>
          <template v-else-if="!hasAvailableStock">
            Límite
          </template>
          <template v-else>
            <i class="fas fa-cart-plus"></i> <span class="hidden min-[380px]:inline">Añadir</span>
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
