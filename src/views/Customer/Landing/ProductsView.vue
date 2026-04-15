<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePublicApi } from '@/composables/usePublicApi'
import type { Product } from '@/types/types'
import { useCartStore } from '@/stores/cart'

import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'
import ProductCard from '@/components/Customer/ProductCard.vue'

let searchTimer: ReturnType<typeof setTimeout>
const products = ref<Product[]>([])
const loading = ref(false)
const error = ref('')
const cartStore = useCartStore()

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
})
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <ClientNavbar @onSearch="handleSearch" />

    <main class="flex-grow">
      <div class="max-w-7xl mx-auto p-6">
        <h2 class="text-3xl font-bold text-[#1a2b4b] mb-8">Catálogo de Productos</h2>

        <div v-if="!loading" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard 
            v-for="product in products" 
            :key="product.id"
            :product="product"
            @add-to-cart="addToCart(product)"
          />
        </div>
      </div>
    </main>

    <ClientFooter />
  </div>
</template>