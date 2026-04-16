<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.ts'
import type { PaymentMethod, Product, SaleItem } from '@/types/types.ts'
import { useApi } from '@/composables/useApiFetch.ts'
import { computed, onMounted, ref, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import SuccessfulSale from '@/components/SuccessfulSale.vue'
import SelectedProductsList from '@/components/SelectedProductsList.vue'

const router = useRouter()
const authStore = useAuthStore()

const query = ref<string>('')
const products = ref<Product[]>([])
const selectedOption = ref<number>(1)
const amountReceived = ref(0)
const change = ref(0)
const selectedProducts = ref<SaleItem[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const satisfiedSale = ref(false)

const saleSummary = ref({
  total: 0,
  amountReceived: 0,
  change: 0,
})

const total = computed(() => {
  return selectedProducts.value.reduce(
    (acc, product) => acc + product.sale_price * product.amount,
    0,
  )
})

let debounceTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  getProducts()
  getPaymentMethod()
})

async function getPaymentMethod() {
  const response = await useApi('payment/methods', {}).get().json()
  paymentMethods.value = response.data.value.data
}

async function getProducts() {
  try {
    const { data } = await useApi('/products/search', {}).get().json()

    const raw = data.value?.data ?? []
    products.value = raw.map((p: any) => ({
      id: Number(p.id ?? p.product_id ?? p.id_product),
      name: p.name,
      codigo: p.codigo,
      sale_price: Number(p.sale_price),
      location: p.location,
      stock: p.stock,
      image_url: p.image_url,
    }))
  } catch (e) {
    console.log(e)
  }
}

async function searchProduct(search: string) {
  const params = new URLSearchParams({ query: search })

  try {
    const { data } = await useApi(`/products/search?${params}`, {}).get().json()

    const raw = data.value?.data ?? []

    products.value = raw.map((p: any) => ({
      id: Number(p.id),
      name: p.name,
      codigo: p.codigo,
      sale_price: Number(p.sale_price),
      location: p.location,
      stock: p.stock,
      image_url: p.image_url,
    }))
  } catch (e) {
    console.log(e)
  }
}

function selectProducts(newProduct: Product) {
  const existingProduct = selectedProducts.value.find((product) => product.id === newProduct.id)

  if (existingProduct) {
    if (existingProduct.amount + 1 > newProduct.stock) {
      alert(`No puedes agregar más. Solo hay ${newProduct.stock} unidades de ${newProduct.name} en stock.`);
      return;
    }
    existingProduct.amount += 1
    return
  }

  if (newProduct.stock < 1) {
    alert(`El producto ${newProduct.name} está agotado (Stock: 0).`);
    return;
  }

  selectedProducts.value.push({
    id: newProduct.id,
    name: newProduct.name,
    sale_price: Number(newProduct.sale_price),
    amount: 1,
  })
}

async function registerSale() {
  if (selectedOption.value === 1 && total.value > amountReceived.value) {
    const difference = total.value - amountReceived.value
    alert(`Monto insuficiente - $${difference.toFixed(2)} faltantes`)
    return
  }

  const payload = {
    payment_method_id: selectedOption.value,
    customer_id: null,
    products: selectedProducts.value.map((product) => ({
      id: product.id,
      amount: product.amount,
    })),
    ...(selectedOption.value === 1 && {
      amount_received: Number(amountReceived.value),
    }),
  }

  try {
    const { data, error } = await useApi('/sales', {}).post(payload).json()

    if (selectedOption.value === 2) {
      change.value = 0
    } else {
      change.value = amountReceived.value - total.value
    }

    saleSummary.value = {
      total: total.value,
      amountReceived: amountReceived.value,
      change: change.value,
    }

    satisfiedSale.value = true

  } catch (e) {
    console.error(e)
    alert('Error de conexión con el servidor')
  }
}

function removeSelectedProduct(id: number) {
  selectedProducts.value = selectedProducts.value.filter((product) => product.id !== id)
}

function resetPos() {
  satisfiedSale.value = false;
  
  selectedProducts.value = [];
  amountReceived.value = 0;
  selectedOption.value = 1;
  change.value = 0;
  query.value = '';

  getProducts();
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
  <div class="pos-page">
    <div class="pos-layout">
      <section class="pos-left">
        <div class="searchbar-root w-full rounded-3 border-b-fuchsia-50">
          <input
            v-model="query"
            type="text"
            placeholder="Buscar producto..."
            class="block w-full rounded-2xl border border-gray-300 px-4 py-3 text-base outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div
          class="grid gap-3 p-4 justify-items-center [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]"
        >
          <ProductCard
            v-for="product in products"
            :key="product.codigo"
            :product="product"
            @click="selectProducts(product)"
          />
        </div>
      </section>

      <aside class="pos-right">
        <div class="w-full">
          
          <div class="flex items-center justify-between mb-6">
            <h1 class="text-3xl font-bold">Venta</h1>
            <button
              v-if="authStore.user?.role === 'Administrador'"
              @click="router.push('/dashboard/tickets')"
              class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-blue-700"
            >
              Revisar Tickets
            </button>
          </div>

          <div class="mt-6">
            <h2 class="mb-3 text-lg font-semibold text-gray-800">Productos seleccionados</h2>

            <div class="max-h-80 overflow-y-auto pr-1">
              <SelectedProductsList :products="selectedProducts" @remove="removeSelectedProduct" />
            </div>
          </div>

          <div class="mt-6 space-y-4">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700"> Método de pago </label>
              <select
                v-model="selectedOption"
                class="appearance-none w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              >
                <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                  {{ method.method_name }}
                </option>
              </select>
            </div>

            <div v-if="selectedOption === 1">
              <label class="mb-1 block text-sm font-medium text-gray-700"> Monto recibido </label>
              <input
                v-model="amountReceived"
                type="number"
                min="0"
                step="0.01"
                class="appearance-none w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <hr />

            <div class="flex items-center justify-between text-lg text-gray-800">
              <span>Total:</span>
              <span class="text-2xl font-extrabold">${{ total.toFixed(2) }}</span>
            </div>

            <button
              class="w-full rounded-lg bg-emerald-700 px-4 py-3 font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              @click="registerSale"
              :disabled="selectedProducts.length === 0"
            >
              Cobrar
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <SuccessfulSale
    v-if="satisfiedSale"
    :total="saleSummary.total"
    :amount-received="saleSummary.amountReceived"
    :change="saleSummary.change"
    @click.self="resetPos"
  />
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
