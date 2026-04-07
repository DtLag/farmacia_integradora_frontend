<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ClientNavbar from '@/components/ClientNavbar.vue'
import ProductCard from '@/components/ProductCard.vue'
import { usePublicApi } from '@/composables/usePublicApi'
import type { Product } from '@/types/types.ts'
import ClientFooter from '@/components/ClientFooter.vue'

const products = ref<Product[]>([])
const isFetching = ref(false)
const error = ref(false)

const fetchProducts = async (searchQuery = '') => {
  isFetching.value = true
  error.value = false
  
  const url = searchQuery 
    ? `/products/search?query=${searchQuery}` 
    : '/products/search'

  const { data, error: fetchError } = await usePublicApi(url).get().json()

  if (data.value && !fetchError.value) {
    products.value = data.value.data || data.value
  } else {
    error.value = true
  }
  isFetching.value = false
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <ClientNavbar @on-search="fetchProducts"/>

    <section class="bg-blue-600 py-12 px-6">
      <div class="max-w-7xl mx-auto text-center">
        <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">
          Tu farmacia de confianza en línea
        </h1>
        <p class="text-blue-100 text-lg">
          Agrega tus productos al carrito y recógelos fácilmente.
        </p>
      </div>
    </section>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-store"></i>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">Pick Up Rápido</h3>
            <p class="text-xs text-gray-500 mt-0.5">Compra en línea y recoge sin filas</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">Compra Segura</h3>
            <p class="text-xs text-gray-500 mt-0.5">Tus datos están protegidos</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-pills"></i>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">Alta Calidad</h3>
            <p class="text-xs text-gray-500 mt-0.5">Medicamentos de laboratorios certificados</p>
          </div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div class="w-12 h-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center text-xl shrink-0">
            <i class="fas fa-user-md"></i>
          </div>
          <div>
            <h3 class="font-bold text-gray-800 text-sm">Atención Experta</h3>
            <p class="text-xs text-gray-500 mt-0.5">Personal capacitado a tu servicio</p>
          </div>
        </div>

      </div>
    </section>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
      
      <div v-if="isFetching" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-20 text-red-500">
        <p class="text-xl font-semibold">Ocurrió un error al cargar el catálogo.</p>
        <p class="text-sm mt-2">Por favor, intenta recargar la página.</p>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>

      <div v-if="!isFetching && !error && products.length === 0" class="text-center py-20 text-gray-500">
        <i class="fas fa-box-open text-4xl mb-3"></i>
        <p>No hay productos disponibles por el momento.</p>
      </div>

    </main>
    <ClientFooter />
  </div>
</template>