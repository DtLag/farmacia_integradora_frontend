<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { usePublicApi } from '@/composables/usePublicApi'
import type { Product } from '@/types/types'
import { useCartStore } from '@/stores/cart'
import { createEchoInstance } from '@/utils/echo'

import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'
import ProductCard from '@/components/Customer/ProductCard.vue'

let searchTimer: ReturnType<typeof setTimeout>
const products = ref<Product[]>([])
const loading = ref(false)
const error = ref('')
const cartStore = useCartStore()

let echo: any = null;

function addToCart(product: Product) {
  cartStore.addToCart(product)
  console.log("agregado: ", product.name)
}

const fetchProducts = async (searchQuery = '') => {
  loading.value = true
  error.value = ''

  const url = searchQuery 
    ? `/products/search?query=${searchQuery}` 
    : '/products/search'

  try {
    const { data, error: errorFetching } = await usePublicApi(url).get().json()
    if (errorFetching.value) throw new Error('No se pudieron cargar los productos')
    products.value = data.value.data
  } catch (e) {
    error.value = 'Ocurrió un error al cargar los productos.'
  } finally {
    loading.value = false
  }
}

function handleSearch(query: string) {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    fetchProducts(query)
  }, 350) 
}

onMounted(() => {
  fetchProducts()

  echo = createEchoInstance();

  echo.channel('public-inventory')
  .listen('.ProductStockUpdated', (evento: any) => {
    console.log('📦 Evento WebSockets Recibido:', evento.product);

    const productToUpdate = products.value.find((p: any) => p.id === evento.product.id);
    
    if (productToUpdate) {
      productToUpdate.stock = evento.product.stock;
      console.log(`¡El stock de ${evento.product.name} se actualizó visualmente a ${evento.product.stock}!`);
    }
  });
});

onUnmounted(() => {
  if (echo) {
    echo.leaveChannel('public-inventory')
  }
});
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#EDF7FE]">
    <ClientNavbar @onSearch="handleSearch" />

    <main class="flex-grow">
      <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#1a2b4b] mb-6 sm:mb-8 text-center sm:text-left">Catálogo de Productos</h2>

        <div v-if="loading" class="flex justify-center items-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="error" class="text-center py-20 bg-white rounded-xl shadow-sm border border-red-100 mx-auto max-w-lg">
          <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-3"></i>
          <p class="text-xl font-bold text-gray-800">Ocurrió un error</p>
          <p class="text-gray-500 mt-2">{{ error }}</p>
          <button @click="fetchProducts()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Reintentar
          </button>
        </div>

        <div v-else-if="products.length > 0" class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          <ProductCard 
            v-for="product in products" 
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart(product)"
          />
        </div>

        <div v-else class="text-center py-20 bg-white rounded-xl shadow-sm mx-auto max-w-lg">
          <i class="fas fa-search text-5xl text-gray-300 mb-4"></i>
          <p class="text-lg font-medium text-gray-600">No encontramos productos.</p>
          <p class="text-sm text-gray-400 mt-1">Intenta buscar con otras palabras.</p>
        </div>

      </div>
    </main>

    <ClientFooter />
  </div>
</template>