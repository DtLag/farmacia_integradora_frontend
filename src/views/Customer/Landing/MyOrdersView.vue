<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { createEchoInstance } from '@/utils/echo'
import { useApi } from '@/composables/useApiFetch'
import type { Order } from '@/types/types'
import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'

let echo: any = null;
const orders = ref<Order[]>([])
const loading = ref(true)
const activeTab = ref('pending')
const isCancelling = ref<number | null>(null)

const tabs = [
  { id: 'pending', label: 'Pendientes', icon: 'fas fa-clock' },
  { id: 'ready', label: 'Listos para entrega', icon: 'fas fa-box-open' },
  { id: 'completed', label: 'Historial', icon: 'fas fa-check-circle' },
  { id: 'canceled', label: 'Cancelados', icon: 'fas fa-times-circle' }
]

async function fetchOrders(state: string) {
  loading.value = true
  activeTab.value = state
  try {
    const { data } = await useApi(`/pickup/order/${state}`).get().json()
    if (data.value && data.value.data) {
      orders.value = data.value.data
    } else if (data.value) {
      orders.value = data.value
    } else {
      orders.value = []
    }
  } catch (e) {
    console.error("Error al obtener pedidos:", e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders('pending')

  echo = createEchoInstance();

  echo.channel('public-orders')
    .listen('.OrderStatusChanged', (e: any) => {
        console.log('🔄 Estado de tu pedido actualizado:', e.orderData);
        
        const orderToUpdate = orders.value.find(o => o.id === e.orderData.id);
        
        if (orderToUpdate) {  
          orderToUpdate.state = e.orderData.state;

          if (activeTab.value !== 'completed' && activeTab.value !== 'canceled') {
            setTimeout(() => {
                fetchOrders(activeTab.value);
            }, 2000);
          }
        }
    });
})

onUnmounted(() => {
  if (echo) {
    echo.leaveChannel('public-orders');
  }
})

function getStatusLabel(state: string) {
  const labels: Record<string, string> = {
    pending: 'Recibido',
    'in preparation': 'En preparación',
    ready: 'Listo para recoger',
    completed: 'Entregado',
    cancelled: 'Cancelado'
  }
  return labels[state] || state
}

function getStatusClass(state: string) {
  const classes: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    'in preparation': 'bg-blue-100 text-blue-700 border-blue-200',
    ready: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-gray-100 text-gray-700 border-gray-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200'
  }
  return classes[state] || 'bg-gray-100 text-gray-700'
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

async function cancelOrder(orderId: number) {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido? Esta acción no se puede deshacer.')) {
        return
    }

    isCancelling.value = orderId

    try {
        const { error } = await useApi(`/pickup/${orderId}/cancel`).post().json()    
        
        if(error.value) throw new Error('No se pudo cancelar el pedido')
        
        // Refrescar lista
        fetchOrders(activeTab.value)
    } catch (e) {
        console.error("Error al cancelar:", e)
        alert("Hubo un problema al cancelar el pedido. Intenta de nuevo.")
    } finally {
        isCancelling.value = null
    }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-[#EDF7FE]">
    <ClientNavbar />

    <main class="flex-grow max-w-5xl mx-auto w-full p-4 sm:p-6 md:p-10">
      <header class="mb-6 sm:mb-10 text-center sm:text-left">
        <h2 class="text-2xl sm:text-3xl font-extrabold text-[#1a2b4b]">Mis Pedidos Pick-Up</h2>
        <p class="text-sm sm:text-base text-gray-500 mt-2">Gestiona tus reservaciones y consulta el estado de tus compras.</p>
      </header>

      <div class="mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        <div class="flex gap-2 sm:gap-3 bg-white p-1.5 rounded-2xl sm:rounded-full shadow-sm min-w-max border border-blue-50">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="fetchOrders(tab.id)"
            :class="activeTab === tab.id ? 'bg-[#0B369E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'"
            class="py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl sm:rounded-full font-bold transition-all duration-200 text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap"
          >
            <i :class="tab.icon"></i>
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="flex flex-col items-center py-20 bg-white rounded-3xl shadow-sm border border-blue-50">
        <div class="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-sm sm:text-base text-gray-500 font-medium">Actualizando tus pedidos...</p>
      </div>

      <div v-else-if="orders.length > 0" class="space-y-5 sm:space-y-6">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="bg-white rounded-2xl sm:rounded-3xl border border-blue-50 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div class="bg-blue-100 text-blue-800 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shrink-0">
                #{{ order.id }}
              </div>
              <div class="min-w-0">
                <p class="text-[10px] sm:text-xs text-gray-400 uppercase font-bold tracking-wider">Fecha de recolección</p>
                <p class="font-bold text-gray-800 text-sm sm:text-base truncate">{{ formatDate(order.scheduled_time) }}</p>
              </div>
            </div>
            
            <div :class="getStatusClass(order.state)" class="w-full sm:w-auto text-center px-3 py-1.5 sm:px-4 rounded-lg sm:rounded-full text-[10px] sm:text-xs font-black uppercase border tracking-widest">
              {{ getStatusLabel(order.state) }}
            </div>
          </div>

          <div class="p-4 sm:p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <h4 class="text-xs sm:text-sm font-bold text-gray-400 mb-3 sm:mb-4 uppercase tracking-tighter">Productos solicitados</h4>
                <ul class="space-y-2 sm:space-y-3">
                  <li v-for="detail in order.order_details" :key="detail.id" class="flex justify-between items-start sm:items-center gap-3">
                    <div class="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
                      <span class="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 sm:py-1 rounded shrink-0">x{{ detail.amount }}</span>
                      <span class="text-gray-700 font-medium text-xs sm:text-sm truncate" :title="detail.product.name">{{ detail.product.name }}</span>
                    </div>
                    <span class="text-gray-400 text-xs sm:text-sm shrink-0 whitespace-nowrap">${{ detail.unit_price }} c/u</span>
                  </li>
                </ul>
              </div>

              <div class="bg-blue-50/50 rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-blue-100 h-fit">
                <div class="flex justify-between mb-2">
                  <span class="text-gray-500 text-xs sm:text-sm">Método de pago:</span>
                  <span class="font-bold text-gray-700 text-xs sm:text-sm">{{ order.payment?.method_name || 'No especificado' }}</span>
                </div>
                <div class="flex justify-between items-center mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-blue-200">
                  <span class="text-blue-900 font-bold text-sm sm:text-base">Total a pagar:</span>
                  <span class="text-xl sm:text-2xl font-black text-[#0B369E]">
                    ${{ order.order_details.reduce((acc, d) => acc + (d.unit_price * d.amount), 0) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="order.state === 'pending'" class="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50/80 border-t border-gray-100 flex justify-center sm:justify-end">
            <button 
              @click="cancelOrder(order.id)"
              :disabled="isCancelling === order.id"
              class="w-full sm:w-auto justify-center text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-100 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i v-if="isCancelling === order.id" class="fas fa-spinner animate-spin"></i>
              <i v-else class="fas fa-ban"></i>
              {{ isCancelling === order.id ? 'Cancelando...' : 'Cancelar pedido' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-16 sm:py-24 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm mx-auto max-w-2xl px-4">
        <div class="bg-blue-50 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-5 sm:mb-6">
          <i class="fas fa-folder-open text-3xl sm:text-4xl text-blue-300"></i>
        </div>
        <h3 class="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Sin pedidos en esta sección</h3>
        <p class="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-sm mx-auto">
          Actualmente no tienes registros bajo el estado de "{{ tabs.find(t => t.id === activeTab)?.label }}".
        </p>
        <RouterLink to="/customer/products" class="inline-block bg-[#0B369E] text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-md text-sm sm:text-base">
          Ir al catálogo
        </RouterLink>
      </div>
    </main>

    <ClientFooter />
  </div>
</template>
<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>