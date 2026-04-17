<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'
import ProductCard from '@/components/ProductCard.vue'
import { usePublicApi } from '@/composables/usePublicApi'
import type { Product } from '@/types/types.ts'
import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import fondoLanding from '@/assets/img/landingPage/fondoLanding.png'

const products = ref<Product[]>([])
const isFetching = ref(false)
const error = ref(false)
const carouselSlideIndex = ref(0)
let carouselInterval: ReturnType<typeof setInterval> | null = null

const featuredProducts = computed(() => products.value.slice(0, 10))

const carouselSlides = computed(() => {
  const slides: Product[][] = []
  const chunkSize = 5

  for (let i = 0; i < featuredProducts.value.length; i += chunkSize) {
    slides.push(featuredProducts.value.slice(i, i + chunkSize))
  }

  return slides
})

const activeCarouselProducts = computed(() => carouselSlides.value[carouselSlideIndex.value] ?? [])

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

const startCarousel = () => {
  stopCarousel()

  if (carouselSlides.value.length <= 1) {
    return
  }

  carouselInterval = setInterval(() => {
    carouselSlideIndex.value = (carouselSlideIndex.value + 1) % carouselSlides.value.length
  }, 4500)
}

const resetAndStartCarousel = () => {
  carouselSlideIndex.value = 0
  startCarousel()
}

const nextSlide = () => {
  if (carouselSlides.value.length === 0) return
  carouselSlideIndex.value = (carouselSlideIndex.value + 1) % carouselSlides.value.length
}

const previousSlide = () => {
  if (carouselSlides.value.length === 0) return
  carouselSlideIndex.value =
    (carouselSlideIndex.value - 1 + carouselSlides.value.length) % carouselSlides.value.length
}

const fetchProducts = async (searchQuery = '') => {
  isFetching.value = true
  error.value = false
  
  const url = searchQuery 
    ? `/products/search?query=${searchQuery}` 
    : '/products/search'

  const { data, error: fetchError } = await usePublicApi(url).get().json()

  if (data.value && !fetchError.value) {
    products.value = data.value.data || data.value
    resetAndStartCarousel()
  } else {
    error.value = true
    stopCarousel()
  }
  isFetching.value = false
}

onMounted(async () => {
  await fetchProducts()
})

onUnmounted(() => {
  stopCarousel()
})
</script>

<template>
  <div class="min-h-screen bg-[#EDF7FE] flex flex-col">
    <ClientNavbar @on-search="fetchProducts"/>

    <header class="relative bg-cover bg-center bg-no-repeat py-20 sm:py-24 lg:py-32 overflow-hidden"
      :style="{ backgroundImage: `url(${fondoLanding})` }">
      <div class="absolute inset-0 bg-linear-to-r from-blue-950/80 via-blue-900/65 to-blue-700/50"></div>
      <div class="absolute -top-20 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-blue-300/25 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-20 -left-20 w-72 h-72 sm:w-104 sm:h-104 bg-cyan-300/20 rounded-full blur-3xl"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 grid lg:grid-cols-12 gap-8 items-center">
        <div class="text-white lg:col-span-7 max-w-4xl">
          <h1 class="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black leading-[0.98] tracking-tight">
            Tu farmacia
            <span class="block text-blue-200">de confianza en linea</span>
          </h1>

          <p class="mt-7 text-blue-100 text-lg sm:text-2xl max-w-3xl leading-relaxed font-medium">
            Agrega tus productos al carrito y recogelos facilmente sin hacer filas.
            Compra en minutos y recibe una experiencia agil de principio a fin.
          </p>

          <p class="mt-7 text-base sm:text-lg font-semibold text-white/95">
            Disponible 24/7 para tus pedidos Pick Up.
          </p>
        </div>
      </div>
    </header>

    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14 relative z-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        <article class="feature-panel feature-card feature-card--blue p-6 sm:p-7 rounded-3xl border h-full min-h-96 overflow-hidden relative">
          <span class="feature-glow"></span>
          <h3 class="relative font-extrabold text-slate-800 text-xl text-center">Pedidos Pick Up</h3>
          <div class="relative mt-7 mx-auto w-24 h-24 rounded-[1.7rem] flex items-center justify-center text-5xl feature-icon feature-icon--blue">
            <i class="fas fa-store"></i>
          </div>
          <p class="relative text-slate-600 mt-7 leading-relaxed text-[15px] text-center">
            Haz tu pedido en linea, confirma en minutos y recogelo a la hora que elijas.
            Disenado para que ahorres tiempo en cada compra.
          </p>
        </article>

        <article class="feature-panel feature-card feature-card--green p-6 sm:p-7 rounded-3xl border h-full min-h-96 overflow-hidden relative">
          <span class="feature-glow"></span>
          <h3 class="relative font-extrabold text-slate-800 text-xl text-center">Compra Segura</h3>
          <div class="relative mt-7 mx-auto w-24 h-24 rounded-[1.7rem] flex items-center justify-center text-5xl feature-icon feature-icon--green">
            <i class="fas fa-shield-alt"></i>
          </div>
          <p class="relative text-slate-600 mt-7 leading-relaxed text-[15px] text-center">
            Tu informacion y tus pagos se mantienen protegidos en todo momento.
            Navega y compra con confianza en cada etapa del proceso.
          </p>
        </article>

        <article class="feature-panel feature-card feature-card--indigo p-6 sm:p-7 rounded-3xl border h-full min-h-96 overflow-hidden relative">
          <span class="feature-glow"></span>
          <h3 class="relative font-extrabold text-slate-800 text-xl text-center">Alta Calidad</h3>
          <div class="relative mt-7 mx-auto w-24 h-24 rounded-[1.7rem] flex items-center justify-center text-5xl feature-icon feature-icon--indigo">
            <i class="fas fa-pills"></i>
          </div>
          <p class="relative text-slate-600 mt-7 leading-relaxed text-[15px] text-center">
            Seleccion de medicamentos y productos respaldados por laboratorios certificados.
            Calidad constante para el cuidado de tu salud.
          </p>
        </article>

        <article class="feature-panel feature-card feature-card--orange p-6 sm:p-7 rounded-3xl border h-full min-h-96 overflow-hidden relative">
          <span class="feature-glow"></span>
          <h3 class="relative font-extrabold text-slate-800 text-xl text-center">Atencion Experta</h3>
          <div class="relative mt-7 mx-auto w-24 h-24 rounded-[1.7rem] flex items-center justify-center text-5xl feature-icon feature-icon--orange">
            <i class="fas fa-user-md"></i>
          </div>
          <p class="relative text-slate-600 mt-7 leading-relaxed text-[15px] text-center">
            Personal capacitado listo para orientarte y entregarte tu pedido de forma clara y segura.
            Resolvemos tus dudas al momento de recoger.
          </p>
        </article>
      </div>
    </section>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 w-full grow">

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

      <div v-else id="nuestros-productos" class="bg-white rounded-3xl border border-blue-100 shadow-xl p-5 sm:p-7 lg:p-8">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-7">
          <div>
            <p class="text-blue-600 font-semibold text-sm sm:text-base">Catalogo destacado</p>
            <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-800">Nuestros Productos</h2>
          </div>

          <div v-if="carouselSlides.length > 1" class="flex items-center gap-2">
            <button
              @click="previousSlide"
              class="w-10 h-10 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 transition"
              aria-label="Anterior"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              @click="nextSlide"
              class="w-10 h-10 rounded-full border border-blue-200 text-blue-700 hover:bg-blue-50 transition"
              aria-label="Siguiente"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <transition name="carousel-fade" mode="out-in">
          <div
            :key="carouselSlideIndex"
            class="grid grid-cols-1 min-[500px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5"
          >
            <ProductCard
              v-for="product in activeCarouselProducts"
              :key="product.id"
              :product="product"
            />
          </div>
        </transition>

        <div v-if="carouselSlides.length > 1" class="flex justify-center gap-2 mt-6">
          <button
            v-for="(slide, index) in carouselSlides"
            :key="slide[0]?.id || index"
            @click="carouselSlideIndex = index"
            class="h-2.5 rounded-full transition-all"
            :class="index === carouselSlideIndex ? 'w-8 bg-blue-600' : 'w-2.5 bg-blue-200 hover:bg-blue-300'"
            :aria-label="`Ir al grupo ${index + 1}`"
          ></button>
        </div>
      </div>

      <div v-if="!isFetching && !error && products.length === 0" class="text-center py-20 bg-white rounded-xl shadow-sm mx-auto max-w-lg">
        <i class="fas fa-box-open text-5xl text-gray-300 mb-4"></i>
        <p class="text-lg font-medium text-gray-600">No hay productos disponibles por el momento.</p>
      </div>

    </main>

    <ClientFooter />
  </div>
</template>

<style scoped>
.feature-panel {
  animation: cardFloat 0.8s ease both;
}

.feature-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, #ffffff 70%);
  box-shadow: 0 20px 34px -18px rgba(15, 23, 42, 0.34);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
  pointer-events: none;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.015);
  box-shadow: 0 32px 44px -20px rgba(15, 23, 42, 0.42);
}

.feature-glow {
  position: absolute;
  width: 180px;
  height: 180px;
  top: -62px;
  right: -62px;
  border-radius: 999px;
  opacity: 0.58;
}

.feature-icon {
  border: 1px solid transparent;
  box-shadow: 0 18px 30px -18px rgba(15, 23, 42, 0.5);
}

.feature-icon::after {
  content: '';
  position: absolute;
  inset: 7px;
  border-radius: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.7);
}

.feature-card--blue {
  border-color: #bfdbfe;
}

.feature-card--blue .feature-glow {
  background: radial-gradient(circle, rgba(59, 130, 246, 0.32) 0%, rgba(59, 130, 246, 0) 72%);
}

.feature-icon--blue {
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  color: #2563eb;
  border-color: #bfdbfe;
}

.feature-card--green {
  border-color: #bbf7d0;
}

.feature-card--green .feature-glow {
  background: radial-gradient(circle, rgba(34, 197, 94, 0.28) 0%, rgba(34, 197, 94, 0) 72%);
}

.feature-icon--green {
  background: linear-gradient(135deg, #dcfce7, #f0fdf4);
  color: #16a34a;
  border-color: #bbf7d0;
}

.feature-card--indigo {
  border-color: #c7d2fe;
}

.feature-card--indigo .feature-glow {
  background: radial-gradient(circle, rgba(99, 102, 241, 0.24) 0%, rgba(99, 102, 241, 0) 72%);
}

.feature-icon--indigo {
  background: linear-gradient(135deg, #e0e7ff, #eef2ff);
  color: #4f46e5;
  border-color: #c7d2fe;
}

.feature-card--orange {
  border-color: #fed7aa;
}

.feature-card--orange .feature-glow {
  background: radial-gradient(circle, rgba(249, 115, 22, 0.24) 0%, rgba(249, 115, 22, 0) 72%);
}

.feature-icon--orange {
  background: linear-gradient(135deg, #ffedd5, #fff7ed);
  color: #ea580c;
  border-color: #fed7aa;
}

.hero-highlight {
  background: linear-gradient(160deg, rgba(30, 64, 175, 0.58) 0%, rgba(30, 58, 138, 0.72) 45%, rgba(15, 23, 42, 0.75) 100%);
  border: 1px solid rgba(191, 219, 254, 0.32);
  box-shadow: 0 28px 46px -24px rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(6px);
}

.hero-highlight-item {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.65rem 0.8rem;
  border-radius: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(191, 219, 254, 0.28);
}

.carousel-fade-enter-active,
.carousel-fade-leave-active {
  transition: opacity 0.35s ease;
}

.carousel-fade-enter-from,
.carousel-fade-leave-to {
  opacity: 0;
}

@keyframes cardFloat {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>