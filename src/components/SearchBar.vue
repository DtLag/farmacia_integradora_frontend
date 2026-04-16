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
  <div class="w-full p-4 sm:p-5">
    <input
      v-model="query"
      type="text"
      placeholder="Buscar producto..."
      class="block w-full rounded-2xl border border-gray-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div class="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
    <ProductCard v-for="product in products" :key="product.codigo" :product="product"  />
  </div>
</template>

<style scoped>
.searchbar-root {
  width: 100%;
  padding: 25px;
}

.search-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
}
</style>
