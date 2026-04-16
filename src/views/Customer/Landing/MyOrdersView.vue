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
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
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
    } catch (e) {
        console.error("Error al cancelar:", e)
        alert("Hubo un problema al cancelar el pedido. Intenta de nuevo.")
    } finally {
        isCancelling.value = null
    }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-50">
    <ClientNavbar />

    <main class="flex-grow max-w-5xl mx-auto w-full p-4 md:p-10">
      <header class="mb-10">
        <h2 class="text-3xl font-extrabold text-[#1a2b4b]">Mis Pedidos Pick-Up</h2>
        <p class="text-gray-500 mt-2">Gestiona tus reservaciones y consulta el estado de tus medicamentos.</p>
      </header>

      <div class="flex flex-wrap gap-2 mb-8 bg-white p-1.5 rounded-2xl border shadow-sm">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          @click="fetchOrders(tab.id)"
          :class="activeTab === tab.id ? 'bg-[#0B369E] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'"
          class="flex-1 min-w-[140px] py-3 px-4 rounded-xl font-bold transition-all duration-200 text-sm flex items-center justify-center gap-2"
        >
          <i :class="tab.icon"></i>
          {{ tab.label }}
        </button>
      </div>

      <div v-if="loading" class="flex flex-col items-center py-20">
        <div class="w-12 h-12 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin"></div>
        <p class="mt-4 text-gray-500 font-medium">Actualizando tus pedidos...</p>
      </div>

      <div v-else-if="orders.length > 0" class="space-y-6">
        <div 
          v-for="order in orders" 
          :key="order.id" 
          class="bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="p-6 border-b bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
            <div class="flex items-center gap-4">
              <div class="bg-blue-100 text-blue-800 w-12 h-12 rounded-2xl flex items-center justify-center font-bold">
                #{{ order.id }}
              </div>
              <div>
                <p class="text-xs text-gray-400 uppercase font-bold tracking-wider">Fecha de recolección</p>
                <p class="font-bold text-gray-800">{{ formatDate(order.scheduled_time) }}</p>
              </div>
            </div>
            
            <div :class="getStatusClass(order.state)" class="px-4 py-1.5 rounded-full text-xs font-black uppercase border tracking-widest">
              {{ getStatusLabel(order.state) }}
            </div>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 class="text-sm font-bold text-gray-400 mb-4 uppercase tracking-tighter">Productos solicitados</h4>
                <ul class="space-y-3">
                  <li v-for="detail in order.order_details" :key="detail.id" class="flex justify-between items-center">
                    <div class="flex items-center gap-3">
                      <span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">x{{ detail.amount }}</span>
                      <span class="text-gray-700 font-medium">{{ detail.product.name }}</span>
                    </div>
                    <span class="text-gray-400 text-sm">${{ detail.unit_price }} c/u</span>
                  </li>
                </ul>
              </div>

              <div class="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                <div class="flex justify-between mb-2">
                  <span class="text-gray-500 text-sm">Método de pago:</span>
                  <span class="font-bold text-gray-700">{{ order.payment?.method_name || 'No especificado' }}</span>
                </div>
                <div class="flex justify-between items-center mt-4 pt-4 border-t border-blue-200">
                  <span class="text-blue-900 font-bold">Total a pagar:</span>
                  <span class="text-2xl font-black text-[#0B369E]">${{ order.order_details.reduce((acc, d) => acc + (d.unit_price * d.amount), 0) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="order.state === 'pending'" class="px-6 py-4 bg-gray-50 border-t flex justify-end">
            <button 
            @click="cancelOrder(order.id)"
            :disabled="isCancelling === order.id"
            class="text-red-500 hover:text-red-800 text-sm font-bold transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
            <i v-if="isCancelling === order.id" class="fas fa-spinner animate-spin"></i>
            <i v-else class="fas fa-ban"></i>
            {{ isCancelling === order.id ? 'Cancelando...' : 'Cancelar pedido' }}
            </button>
            </div>
        </div>
      </div>

      <div v-else class="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300">
        <div class="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
          <i class="fas fa-folder-open text-4xl text-gray-300"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-2">Sin pedidos en esta sección</h3>
        <p class="text-gray-500 mb-8 max-w-xs mx-auto">Actualmente no tienes registros bajo el estado de "{{ tabs.find(t => t.id === activeTab)?.label }}".</p>
        <RouterLink to="/" class="bg-[#0B369E] text-white px-10 py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg">
          Ir al catálogo
        </RouterLink>
      </div>
    </main>

    <ClientFooter />
  </div>
</template>