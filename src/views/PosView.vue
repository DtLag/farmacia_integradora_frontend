<script setup lang="ts">
import type { PaymentMethod, Product, SaleItem } from '@/types/types.ts'
import { useApi } from '@/composables/useApiFetch.ts'
import { computed, onMounted, ref, watch } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import SuccessfulSale from '@/components/SuccessfulSale.vue'
import SelectedProductsList from '@/components/SelectedProductsList.vue'

const query = ref<string>('')
const products = ref<Product[]>([])
const selectedOption = ref<number>(1)
const total = computed(() => {
  return selectedProducts.value.reduce(
    (acc, product) => acc + product.sale_price * product.amount,
    0,
  )
})
const saleSummary = ref({
  total: 0,
  amountReceived: 0,
  change: 0,
})
const amountReceived = ref(0.0)
const change = ref(0.0)
const selectedProducts = ref<SaleItem[]>([])
const paymentMethods = ref<PaymentMethod[]>([])
const satisfiedSale = ref<boolean>(false)

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

    products.value = data.value?.data ?? []

    const raw = data.value?.data ?? []
    console.log('primer raw product:', raw[0])
    console.log('keys del primer producto:', Object.keys(raw[0]))
    products.value = raw.map((p: any) => ({
      id: Number(p.id ?? p.product_id ?? p.id_product),
      name: p.name,
      codigo: p.codigo,
      sale_price: Number(p.sale_price),
      location: p.location,
      stock: p.stock,
      image_url: p.image_url,
    }))
    console.log('products cargados:', products.value)
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
  console.log('producto clickeado:', newProduct)

  const existingProduct = selectedProducts.value.find((product) => product.id === newProduct.id)

  if (existingProduct) {
    existingProduct.amount += 1
    return
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
    alert(`Monto insuficiente - $${difference} faltantes`)
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
    console.log('payload:', payload)

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
    console.log(data)


    selectedProducts.value = []
    amountReceived.value = 0
    selectedOption.value = 1
  } catch (e) {
    console.error(e)
    alert('Error de conexión con el servidor')
  }
}
function removeSelectedProduct(id: number) {
  selectedProducts.value = selectedProducts.value.filter((product) => product.id !== id)
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
            <h2 class="mb-3 text-lg font-semibold text-gray-800">Productos seleccionados</h2>

            <div class="max-h-54 overflow-y-auto pr-1">
              <SelectedProductsList :products="selectedProducts" @remove="removeSelectedProduct" />
            </div>
          </div>
          <div class="mt-6">
            <label>Método de pago</label>
            <div>
              <select
                class="appearance-noneappearance-none w-full bg-white border border-gray-300 rounded-lg py-1 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                v-model="selectedOption"
              >
                <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
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
                <span class="font-extrabold">${{ total }}</span>
              </div>
            </div>

            <button
              class="w-full bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition"
              type="submit"
              @click="registerSale"
              data-dialog-target="modal"
            >
              Cobrar
            </button>
          </div>
        </div>
      </aside>
    </div>
  </div>

  <!-- MODAL AL COBRAR -->
  <SuccessfulSale
    v-if="satisfiedSale"
    :total="saleSummary.total"
    :amount-received="saleSummary.amountReceived"
    :change="saleSummary.change"
    @click.self="satisfiedSale = false"
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
