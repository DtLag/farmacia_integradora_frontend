<script setup lang="ts">
import type { Product } from '@/types/types.ts'
import { useApi } from '@/composables/useApiFetch.ts'
import { onMounted, ref, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'

const query = ref<string>('')
const products = ref<Product[]>([])
let timeout: number

onMounted(() => {
  getProducts()
})

async function getProducts() {
  try {
    const { data, error } = await useApi('/products/', {}).get().json()

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
    const { data, error } = await useApi(`/products/search?${params}`, {}).get().json()

    products.value = data.value?.data ?? []
    console.log(data.value)
  } catch (e) {
    console.log(e)
  }
}

watch(query,(newValue)=>{
  if(!newValue){
    getProducts()
  }else{
    searchProduct(newValue)
  }
})
</script>

<template>

  <div class="searchbar-root w-full rounded-3 border-b-fuchsia-50">
    <input
      type="text"
      placeholder="Buscar producto..."
      v-model="query"
      class="search-input rounded-3 block w-full rounded-2xl border border-gray-300 px-6 py-2 text-lg outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <div class="grid grid-cols-4 gap-3 p-4 justify-items-center">
    <ProductCard v-for="product in products" :key="product.codigo" :product="product" />
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
