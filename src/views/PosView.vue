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
  <div class="min-h-[calc(100vh-3.5rem)] bg-gray-100 p-3 sm:p-4 lg:p-6 flex flex-col lg:flex-row gap-4 sm:gap-6 lg:overflow-hidden">
    
    <section class="w-full lg:w-2/3 xl:w-3/4 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 h-[60vh] lg:h-[calc(100vh-4.5rem)] overflow-hidden shrink-0 lg:shrink">
      
      <div class="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
        <div class="relative w-full">
          <input
            v-model="query"
            type="text"
            placeholder="Buscar producto por nombre o código..."
            class="block w-full rounded-xl border border-gray-300 px-10 py-3 sm:py-3.5 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#0B369E] focus:border-transparent transition-shadow bg-white shadow-sm"
          />
          <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
        </div>
      </div>

      <div class="p-3 sm:p-4 overflow-y-auto flex-grow bg-gray-50/20">
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 content-start">
          <ProductCard
            v-for="product in products"
            :key="product.codigo"
            :product="product"
            @click="selectProducts(product)"
            class="cursor-pointer hover:ring-2 hover:ring-blue-500 hover:shadow-lg transition-all transform hover:-translate-y-1"
          />
        </div>
        
        <div v-if="products.length === 0" class="flex flex-col items-center justify-center h-full text-gray-400 py-10">
          <i class="fas fa-box-open text-5xl mb-4 text-gray-300"></i>
          <p class="text-lg">No se encontraron productos.</p>
        </div>
      </div>
    </section>

    <aside class="w-full lg:w-1/3 xl:w-1/4 flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 h-auto lg:h-[calc(100vh-4.5rem)] lg:overflow-hidden shrink-0">
      
      <div class="p-4 sm:p-5 border-b border-gray-100 shrink-0 flex items-center justify-between bg-white">
        <h1 class="text-xl sm:text-2xl font-extrabold text-[#1a2b4b]">Venta en Mostrador</h1>
        <button
          v-if="authStore.user?.role === 'Administrador'"
          @click="router.push('/dashboard/tickets')"
          class="rounded-lg bg-blue-100 text-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold shadow-sm transition hover:bg-blue-200 flex items-center gap-2"
        >
          <i class="fas fa-ticket-alt"></i> <span class="hidden min-[400px]:inline">Tickets</span>
        </button>
      </div>

      <div class="p-4 sm:p-5 flex-grow overflow-y-auto bg-gray-50/30">
        <h2 class="mb-3 text-sm font-bold text-gray-400 uppercase tracking-wider">Productos en carrito</h2>

        <div v-if="selectedProducts.length === 0" class="text-center py-10 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
           <i class="fas fa-shopping-cart text-3xl mb-2 text-gray-300"></i>
           <p class="text-sm">El carrito está vacío</p>
        </div>

        <SelectedProductsList 
          v-else 
          :products="selectedProducts" 
          @remove="removeSelectedProduct" 
        />
      </div>

      <div class="p-4 sm:p-5 border-t border-gray-200 bg-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
        <div class="space-y-4">
          
          <div>
            <label class="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wider"> Método de pago </label>
            <div class="relative">
              <select
                v-model="selectedOption"
                class="appearance-none w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 sm:py-2.5 text-sm sm:text-base font-medium focus:outline-none focus:border-[#0B369E] focus:ring-2 focus:ring-[#0B369E] transition-all"
              >
                <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                  {{ method.method_name }}
                </option>
              </select>
              <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm"></i>
            </div>
          </div>

          <div v-if="selectedOption === 1" class="animate-in fade-in slide-in-from-top-2 duration-200">
            <label class="mb-1 block text-xs font-bold text-gray-500 uppercase tracking-wider"> Monto recibido en Caja </label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input
                v-model="amountReceived"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                class="appearance-none w-full rounded-xl border border-gray-300 bg-white pl-8 pr-4 py-3 sm:py-2.5 text-lg font-bold focus:outline-none focus:border-[#0B369E] focus:ring-2 focus:ring-[#0B369E] transition-all"
              />
            </div>
          </div>

          <div class="w-full h-px bg-gray-200 my-2"></div>

          <div class="flex items-center justify-between text-gray-800 bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-100">
            <span class="text-sm sm:text-base font-bold text-blue-900">Total a cobrar:</span>
            <span class="text-3xl sm:text-4xl font-black text-[#0B369E]">${{ total.toFixed(2) }}</span>
          </div>

          <button
            class="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-4 sm:py-3.5 text-base sm:text-lg font-bold text-white shadow-lg shadow-emerald-600/30 transition-all hover:bg-emerald-700 hover:shadow-emerald-700/40 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            type="button"
            @click="registerSale"
            :disabled="selectedProducts.length === 0"
          >
            <i class="fas fa-check-circle"></i> Procesar Venta
          </button>
        </div>
      </div>

    </aside>
  </div>

  <SuccessfulSale
    v-if="satisfiedSale"
    :total="saleSummary.total"
    :amount-received="saleSummary.amountReceived"
    :change="saleSummary.change"
    @click.self="resetPos"
    @close="resetPos"
  />
</template>