<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApiFetch';

import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'
import CartItemComponent from '@/components/Customer/CartItem.vue'

const cartStore = useCartStore()
const authStore = useAuthStore()
const router = useRouter()

const pickupTime = ref('')
const isSubmitting = ref(false)
const showSuccessModal = ref(false)
const errorMessage = ref('')
const paymentMethods = ref<any[]>([])
const selectedPaymentMethod = ref('')

const now = new Date()
const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
const maxTime = '19:00'

async function fetchPaymentMethods() {
  try {
    const { data } = await useApi('/payment/methods').get().json()
    if (data.value && data.value.data) {
      paymentMethods.value = data.value.data
    } else if (data.value) {
      paymentMethods.value = data.value
    }
  } catch (e) {
    console.error('Error cargando métodos de pago:', e)
  }
}

onMounted(() => {
  fetchPaymentMethods()
})

function formatTo12Hour(time: string): string {
  if (!time) return ''
  const [h, m] = time.split(':')
  const date = new Date()
  date.setHours(Number(h), Number(m))
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

const currentTime12 = computed(() => formatTo12Hour(currentTime))
const maxTime12 = computed(() => formatTo12Hour(maxTime))
const pickupTime12 = computed(() => pickupTime.value ? formatTo12Hour(pickupTime.value) : '')

const isValidTime = computed(() => {
  if (!pickupTime.value) return false
  return pickupTime.value >= currentTime && pickupTime.value <= maxTime
})

async function handleCheckout() {
  if (!isValidTime.value || !selectedPaymentMethod.value || isSubmitting.value) return

  if (!authStore.token) {
    router.push({
      path: '/customer/login',
      query: { redirect: '/checkout' }
    })
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  const fullScheduledTime = `${year}-${month}-${day} ${pickupTime.value}:00`

  const payload = {
    scheduled_time: fullScheduledTime,
    payment_method_id: selectedPaymentMethod.value,
    products: cartStore.items.map(item => ({
      product_id: item.product.id,
      amount: item.quantity
    }))
  }

  try {
    const { data, error: apiError } = await useApi('/create/pick-up/order').post(payload).json()

    if (apiError.value) {
      throw new Error('No se pudo completar el pedido.')
    }

    cartStore.clearCart()
    showSuccessModal.value = true
    
  } catch (e: any) {
    console.error(e)
    errorMessage.value = 'Hubo un problema al procesar tu pedido. Verifica tu conexión o intenta de nuevo.'
  } finally {
    isSubmitting.value = false
  }
}

function updateQuantity(productId: number, newQuantity: number) {
  const item = cartStore.items.find(i => i.product.id === productId)
  if (item) {
    item.quantity = newQuantity
    localStorage.setItem('cart', JSON.stringify(cartStore.items))
  }
}

function removeItem(productId: number) {
  cartStore.removeFromCart(productId)
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50 relative">
    <ClientNavbar />

    <main class="flex-grow max-w-7xl mx-auto w-full p-4 md:p-10">
      <h2 class="text-3xl font-bold text-[#1a2b4b] mb-8">Carrito de compras</h2>

      <div v-if="cartStore.items.length > 0" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div class="lg:col-span-2 space-y-4">
          <div class="bg-white rounded-2xl shadow-sm border p-6">
            <div class="divide-y divide-gray-100">
              <CartItemComponent 
                v-for="item in cartStore.items" 
                :key="item.product.id" 
                :item="item"
                @remove="removeItem"
                @update-quantity="updateQuantity"
              />
            </div>
          </div>
          
          <button @click="cartStore.clearCart()" class="text-red-500 text-sm font-medium hover:underline ml-2 flex items-center gap-2">
             <i class="fas fa-trash-alt"></i> Vaciar carrito
          </button>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-2xl shadow-sm border p-6 sticky top-24">
            <h3 class="text-xl font-bold text-gray-800 mb-6">Resumen del pedido</h3>
            
            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-clock mr-1 text-blue-600"></i> Hora de recolección (Hoy)
              </label>

              <input 
                v-model="pickupTime"
                type="time" 
                :min="currentTime"
                :max="maxTime"
                class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                :class="{'border-red-500': pickupTime && !isValidTime}"
                required
              />

              <p class="text-[11px] text-gray-600 mt-2 font-medium">
                Disponible hoy de: {{ currentTime12 }} a {{ maxTime12 }}
              </p>
            </div>

            <div class="mb-6">
              <label class="block text-sm font-semibold text-gray-700 mb-2">
                <i class="fas fa-credit-card mr-1 text-blue-600"></i> Método de pago
              </label>
              
              <select 
                v-model="selectedPaymentMethod"
                class="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                :class="{'border-red-500': !selectedPaymentMethod && isSubmitting}"
                required
              >
                <option value="" disabled>Selecciona cómo pagarás</option>
                <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                  {{ method.method_name }}
                </option>
              </select>
              
              <p v-if="!selectedPaymentMethod" class="text-[10px] text-gray-400 mt-1 italic">
                * El pago se realizará al recoger tu pedido en ventanilla.
              </p>
            </div>

            <div class="space-y-3 mb-6">
              <div class="flex justify-between text-gray-600">
                <span>Productos ({{ cartStore.totalItems }})</span>
                <span>${{ cartStore.totalPrice }}</span>
              </div>
              <div class="flex justify-between text-gray-600">
                <span>Servicio Pick-up</span>
                <span class="text-green-600 font-medium">Sin costo</span>
              </div>
              <div class="border-t pt-3 flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span class="text-blue-600">${{ cartStore.totalPrice }}</span>
              </div>
            </div>

            <button 
              @click="handleCheckout"
              :disabled="!isValidTime || !selectedPaymentMethod || isSubmitting"
              class="block w-full bg-[#0B369E] text-white text-center py-4 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <i v-if="isSubmitting" class="fas fa-spinner animate-spin"></i>
              {{ isSubmitting ? 'Procesando...' : 'Confirmar pedido' }}
            </button>
            
            <p v-if="!isValidTime && pickupTime" class="text-xs text-center text-red-500 mt-3 font-medium">
              La hora debe ser posterior a la actual y antes de las 7:00 PM
            </p>
            <p v-if="errorMessage" class="text-xs text-center text-red-500 mt-3 font-bold">
              {{ errorMessage }}
            </p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
        <div class="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="fas fa-shopping-basket text-3xl text-gray-300"></i>
        </div>
        <p class="text-xl text-gray-500 mb-6">Tu carrito está vacío</p>
        <RouterLink to="/" class="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
          Volver al catálogo
        </RouterLink>
      </div>
    </main>

    <div v-if="showSuccessModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center">
        <div class="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-check text-4xl"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h3>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Tu reserva ha sido recibida. Te esperamos a las <span class="font-bold text-blue-600">{{ pickupTime12 }}</span> para la entrega en ventanilla.
        </p>
        <button 
          @click="router.push('/customer/my-orders')" 
          class="w-full bg-[#0B369E] text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg"
        >
          Ver mis pedidos
        </button>
      </div>
    </div>

    <ClientFooter />
  </div>
</template>