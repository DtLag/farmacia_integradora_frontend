<script setup lang="ts">
import type { PaymentMethod, Product, Sale } from '@/types/types.ts'
import { useApi } from '@/composables/useApiFetch.ts'
import { computed, onMounted, ref, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'

const query = ref<string>('')
const products = ref<Product[]>([])
const selectedOption = ref('')
const total = computed(() => {
  return selectedProducts.value.reduce((acc, p) => acc + p.sale_price, 0)
})
const amountReceived = ref(0.0)

const selectedProducts = ref<Product[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
/*
const selectedMethod = ref<PaymentMethod>({
  id=1,
})
const params = ref<Sale>({
  payment_method_id = pa
  customer_id:number
  amount_received: number
  products: selectedProducts
})

 */

onMounted(() => {
  getProducts()
  getPaymentMethod()
})

async function getPaymentMethod() {
  const response = await useApi('payment-methods', {}).get().json()
  paymentMethods.value = response.data.value.data
}
async function getProducts() {
  try {
    const { data, error } = await useApi('/products/search', {}).get().json()

    products.value = data.value?.data ?? []
    const raw = data.value?.data ?? []

    products.value = raw.map((p: any) => ({
      ...p,
      sale_price: Number(p.sale_price),
    }))
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
    const raw = data.value?.data ?? []

    products.value = raw.map((p: any) => ({
      ...p,
      sale_price: Number(p.sale_price),
    }))
  } catch (e) {
    console.log(e)
  }
}

function selectProducts(newProduct: Product) {
  selectedProducts.value.push(newProduct)
  console.log(selectedProducts.value)
}

async function registerSale() {
  const { data, error, isFetching } = await useApi('/sales').post()
}
watch(query, (newValue) => {
  if (!newValue) {
    getProducts()
  } else {
    searchProduct(newValue)
  }
})
</script>

<template>
  <div class="pos-page">
    <div class="pos-layout">
      <!-- LADO IZQUIERDO -->
      <section class="pos-left">
        <div class="searchbar-root w-full rounded-3 border-b-fuchsia-50">
          <input
            type="text"
            placeholder="Buscar producto..."
            v-model="query"
            class="search-input rounded-3 block w-full rounded-2xl border border-gray-300 px-6 py-2 text-lg outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="products grid grid-cols-4 gap-3 p-4 justify-items-center">
          <ProductCard
            @click="selectProducts(product)"
            v-for="product in products"
            :key="product.codigo"
            :product="product"
          />
        </div>
      </section>

      <!-- LADO DERECHO -->
      <aside class="pos-right">
        <div class="w-full">
          <h1 class="text-3xl font-bold">Venta</h1>
          <div class="mt-6">
            <label>Método de pago</label>
            <div>
              <select
                class="appearance-noneappearance-none w-full bg-white border border-gray-300 rounded-lg py-1 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                v-model="selectedOption"
              >
                <option v-for="method in paymentMethods" :key="method.id">
                  {{ method.method_name }}
                </option>
              </select>
            </div>

            <div class="mt-6">
              <label>Monto recibido</label>
              <input
                class="appearance-noneappearance-none w-full bg-white border border-gray-300 rounded-lg py-1 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                type="number"
                v-model="amountReceived"
              />
              <hr class="mt-6" />
            </div>

            <div class="m-6 flex flex-col space-y-4 text-gray-800 text-lg">
              <div class="flex justify-between text-xl">
                <span>Total:</span>
                <span class="font-extrabold">${{ total }}.00</span>
              </div>

              <div class="flex justify-between">
                <span>Cambio:</span>
                <span class="font-bold">${{ amountReceived - total }}.00</span>
              </div>
            </div>

            <button
              class="w-full bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition"
            >
              Cobrar
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.pos-page {
  padding: 30px;
  height: calc(100vh - 80px);
  box-sizing: border-box;
}
.products {
  overflow: auto;
  height: 550px;
}

.pos-layout {
  display: flex;
  gap: 30px;
  height: 100%;
}

.pos-left {
  flex: 8;
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.pos-right {
  flex: 4;
  background: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  overflow: auto;
  height: fit-content;
}
.searchbar-root {
  width: 100%;
  padding: 25px;
}

.search-input {
  display: block;
  width: 100%;
  box-sizing: border-box;
}
hr {
  height: 1px;
  background-color: var(--color-gray-300);
  border: none;
}
</style>
