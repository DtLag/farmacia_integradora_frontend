<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { usePublicApi } from '@/composables/usePublicApi'
import type { Product } from '@/types/types.ts'
import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import fondoLanding from '@/assets/img/landingPage/fondoLanding.png'

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
  <div class="min-h-screen bg-[#EDF7FE] flex flex-col">
    <ClientNavbar @on-search="fetchProducts"/>

    <div class="relative bg-cover bg-center bg-no-repeat py-16 sm:py-20 h-auto sm:h-[22rem] flex items-center justify-center overflow-hidden"
      :style="{ backgroundImage: `url(${fondoLanding})` }">
      <div class="absolute inset-0 bg-blue-900/50"></div>

      <div class="relative max-w-7xl mx-auto px-4 text-center flex flex-col items-center gap-3 sm:gap-4 z-10">
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-2 sm:mb-4 leading-tight">
          Tu farmacia de confianza en línea
        </h1>
        <p class="text-blue-100 text-base sm:text-lg max-w-2xl">
          Agrega tus productos al carrito y recógelos fácilmente sin hacer filas.
        </p>
        <div class="bg-blue-600 bg-opacity-90 inline-flex items-center gap-2 mt-4 sm:mt-6 px-5 py-2.5 rounded-full shadow-lg">
          <i class="fas fa-clock text-white text-sm"></i>
          <p class="text-white font-medium text-sm sm:text-base">
            Disponible 24/7
          </p>
        </div>
      </div>
    </div>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-4">
      <div class="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform duration-300 h-full">
          <div class="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm border border-blue-100">
            <i class="fas fa-store"></i>
          </div>
          <div class="text-center flex-grow flex flex-col justify-center">
            <h3 class="font-bold text-gray-800 text-base">Pedidos Pick Up</h3>
            <p class="text-sm text-gray-500 mt-1">Haz tu pedido en línea y recógelo a la hora que elijas.</p>
          </div>
        </div>

        <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform duration-300 h-full">
          <div class="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm border border-green-100">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="text-center flex-grow flex flex-col justify-center">
            <h3 class="font-bold text-gray-800 text-base">Compra Segura</h3>
            <p class="text-sm text-gray-500 mt-1">Tus datos están protegidos en todo momento.</p>
          </div>
        </div>

        <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform duration-300 h-full">
          <div class="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm border border-purple-100">
            <i class="fas fa-pills"></i>
          </div>
          <div class="text-center flex-grow flex flex-col justify-center">
            <h3 class="font-bold text-gray-800 text-base">Alta Calidad</h3>
            <p class="text-sm text-gray-500 mt-1">Medicamentos de laboratorios certificados.</p>
          </div>
        </div>

        <div class="bg-white p-5 sm:p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform duration-300 h-full">
          <div class="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm border border-orange-100">
            <i class="fas fa-user-md"></i>
          </div>
          <div class="text-center flex-grow flex flex-col justify-center">
            <h3 class="font-bold text-gray-800 text-base">Atención Experta</h3>
            <p class="text-sm text-gray-500 mt-1">Personal capacitado listo para entregarte tu pedido.</p>
          </div>
        </div>

      </div>
    </section>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 w-full flex-grow">
      
      <div v-if="isFetching" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>

      <div v-else-if="error" class="text-center py-20 bg-white rounded-xl shadow-sm border border-red-100 mx-auto max-w-lg">
        <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-3"></i>
        <p class="text-xl font-bold text-gray-800">Ocurrió un error</p>
        <p class="text-gray-500 mt-2">No pudimos cargar el catálogo. Por favor, intenta de nuevo.</p>
        <button @click="fetchProducts()" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Reintentar
        </button>
      </div>

      <div v-else class="grid grid-cols-1 min-[450px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
        <ProductCard 
          v-for="product in products" 
          :key="product.id" 
          :product="product" 
        />
      </div>

      <div v-if="!isFetching && !error && products.length === 0" class="text-center py-20 bg-white rounded-xl shadow-sm mx-auto max-w-lg">
        <i class="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
        <p class="text-lg font-medium text-gray-600">No hay productos disponibles por el momento.</p>
      </div>

    </main>

    <ClientFooter />
  </div>
</template>