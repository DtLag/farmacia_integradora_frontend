<script setup lang="ts">
import type { Product } from '@/types/types.ts'
import { useApi } from '@/composables/useApiFetch.ts'
import { onMounted, ref, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'

const query = ref<string>('')
const products = ref<Product[]>([])
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  getProducts()
})

async function getProducts() {
  try {
    const { data } = await useApi('/products/', {}).get().json()
    products.value = data.value?.data ?? []
  } catch (e) {
    console.log(e)
  }
}

async function searchProduct(search: string) {
  const params = new URLSearchParams({
    query: search,
  })

  try {
    const { data } = await useApi(`/products/search?${params}`, {}).get().json()
    products.value = data.value?.data ?? []
  } catch (e) {
    console.log(e)
  }
}

watch(query, (newValue) => {
  if (debounceTimeout) clearTimeout(debounceTimeout)

  debounceTimeout = setTimeout(() => {
    if (!newValue.trim()) {
      getProducts()
    } else {
      searchProduct(newValue)
    }
  }, 300)
})
</script>

<template>
  <div class="w-full flex flex-col h-full bg-gray-50/50">
    
    <div class="w-full p-4 sm:p-5 lg:p-6 border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
      <div class="relative max-w-3xl mx-auto">
        <input
          v-model="query"
          type="text"
          placeholder="Buscar producto por nombre o código..."
          class="block w-full rounded-2xl border border-gray-300 pl-12 pr-4 py-3 sm:py-3.5 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#0B369E] focus:border-transparent transition-all shadow-sm bg-gray-50 hover:bg-white"
        />
        <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
      </div>
    </div>

    <div class="flex-grow p-4 sm:p-5 lg:p-6 overflow-y-auto">
      
      <div v-if="products.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 max-w-[1600px] mx-auto">
        <ProductCard v-for="product in products" :key="product.codigo" :product="product" class="h-full" />
      </div>

      <div v-else class="flex flex-col items-center justify-center py-20 text-gray-400 max-w-md mx-auto text-center bg-white rounded-2xl border border-dashed border-gray-300 mt-8">
        <i class="fas fa-search text-5xl mb-4 text-gray-300"></i>
        <p class="font-bold text-lg text-gray-600">No encontramos resultados</p>
        <p class="text-sm mt-1">Intenta modificar tu búsqueda o verifica si el producto existe en el catálogo.</p>
      </div>
      
    </div>
  </div>
</template>