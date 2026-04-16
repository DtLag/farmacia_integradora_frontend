<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useApi } from '@/composables/useApiFetch.ts'

const transactions = ref<any[]>([])
const selectedTicket = ref<any | null>(null)
const isModalOpen = ref(false)
const isLoading = ref(true)
const isLoadingTicket = ref(false)

const filterStartDate = ref('')
const filterEndDate = ref('')
const filterType = ref('Todos')


async function fetchTransactions() {
  isLoading.value = true
  try {
    const { data: reportData } = await useApi('/reports/sales-and-orders', {}).get().json()
    const fetchedTransactions = reportData.value?.data ?? reportData.value ?? []

    const { data: pickupData } = await useApi('/pickup/order/completed', {}).get().json()
    const completedPickups = pickupData.value?.data ?? []

    transactions.value = fetchedTransactions.map((tx: any) => {
      if (tx.sale_type === 'Pickup') {
        const orderInfo = completedPickups.find((o: any) => o.id === tx.id)
        
        if (orderInfo && orderInfo.order_details) {
          tx.total = orderInfo.order_details.reduce(
            (sum: number, item: any) => sum + Number(item.subtotal), 0
          )
        }
      }
      return tx
    })
  } catch (error) {
    console.error('Error al cargar transacciones:', error)
  } finally {
    isLoading.value = false
  }
}


const filteredTransactions = computed(() => {
  return transactions.value.filter((tx) => {
    const matchesType = filterType.value === 'Todos' || tx.sale_type === filterType.value

    const txDateOnly = tx.date.split(' ')[0]
    const matchesStart = !filterStartDate.value || txDateOnly >= filterStartDate.value
    const matchesEnd = !filterEndDate.value || txDateOnly <= filterEndDate.value

    return matchesType && matchesStart && matchesEnd
  })
})


async function openTicket(tx: any) {
  selectedTicket.value = null
  isModalOpen.value = true
  isLoadingTicket.value = true

  try {
    if (tx.sale_type === 'Mostrador') {
      const { data } = await useApi(`/sales/${tx.id}/ticket`, {}).get().json()
      const tData = data.value?.data ?? data.value
      
      selectedTicket.value = {
        id: tData.id,
        type: 'Mostrador',
        date: new Date(tData.date_time).toLocaleString(),
        customer: tData.customer || 'Público en general',
        payment: tData.payment_method || 'Efectivo',
        total: tData.total,
        details: tData.details.map((d: any) => ({
          name: d.product_name,
          amount: d.amount,
          price: d.unit_price,
          subtotal: d.subtotal
        }))
      }
    } else {
      const { data } = await useApi(`/pickup/order/completed`, {}).get().json()
      const orders = data.value?.data ?? []
      const order = orders.find((o: any) => o.id === tx.id)

      if (order) {
        const sumTotal = order.order_details.reduce(
          (sum: number, item: any) => sum + Number(item.subtotal), 0
        )

        selectedTicket.value = {
          id: order.id,
          type: 'Pickup',
          date: new Date(order.created_at).toLocaleString(),
          customer: order.customer?.name || order.customer?.user?.name || 'Cliente Pickup',
          payment: order.payment?.method_name || 'Pago en línea',
          total: sumTotal,
          details: order.order_details.map((d: any) => ({
            name: d.product?.name || 'Producto',
            amount: d.amount,
            price: d.unit_price,
            subtotal: d.subtotal
          }))
        }
      }
    }
  } catch (error) {
    console.error('Error al cargar detalle del ticket:', error)
    isModalOpen.value = false
  } finally {
    isLoadingTicket.value = false
  }
}

function clearFilters() {
  filterStartDate.value = ''
  filterEndDate.value = ''
  filterType.value = 'Todos'
}

onMounted(() => fetchTransactions())
</script>

<template>
  <div class="p-8 h-full flex flex-col bg-gray-50/50">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800 tracking-tight">Historial de Tickets</h1>
      <p class="text-gray-500">Visualiza y filtra todas las ventas realizadas en mostrador y pedidos pickup.</p>
    </header>

    <section class="mb-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-wrap items-end gap-6">
      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Desde</label>
        <input 
          v-model="filterStartDate" 
          type="date" 
          class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Hasta</label>
        <input 
          v-model="filterEndDate" 
          type="date" 
          class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition"
        />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Tipo de Origen</label>
        <select 
          v-model="filterType" 
          class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition min-w-[140px]"
        >
          <option value="Todos">Todos</option>
          <option value="Mostrador">Mostrador</option>
          <option value="Pickup">Pickup</option>
        </select>
      </div>

      <button 
        @click="clearFilters"
        class="text-sm font-bold text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors"
      >
        Limpiar Filtros
      </button>

      <div class="ml-auto bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">
        <span class="text-sm font-bold text-blue-600">{{ filteredTransactions.length }} resultados</span>
      </div>
    </section>

    <div class="flex-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col">
      <div class="overflow-y-auto">
        <table class="w-full text-left border-collapse">
          <thead class="bg-gray-800 text-white uppercase text-xs font-bold sticky top-0 z-10">
            <tr>
              <th class="px-6 py-4">Folio / ID</th>
              <th class="px-6 py-4">Fecha de Venta</th>
              <th class="px-6 py-4">Tipo</th>
              <th class="px-6 py-4">Total Neto</th>
              <th class="px-6 py-4 text-center">Detalle</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-16 text-center text-gray-400 font-medium">Sincronizando tickets...</td>
            </tr>
            <tr v-else-if="filteredTransactions.length === 0">
              <td colspan="5" class="px-6 py-16 text-center text-gray-400 italic">No se encontraron tickets con los filtros actuales.</td>
            </tr>
            <tr v-for="tx in filteredTransactions" :key="tx.sale_type + tx.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 font-bold text-gray-900">#{{ tx.id }}</td>
              <td class="px-6 py-4 text-gray-600">{{ tx.date }}</td>
              <td class="px-6 py-4">
                <span 
                  :class="tx.sale_type === 'Mostrador' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'" 
                  class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border border-current/20"
                >
                  {{ tx.sale_type }}
                </span>
              </td>
              <td class="px-6 py-4 font-black text-emerald-600 text-lg">${{ Number(tx.total).toFixed(2) }}</td>
              <td class="px-6 py-4 text-center">
                <button @click="openTicket(tx)" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors">
                  Ver Ticket
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        <div class="bg-gray-900 px-8 py-5 flex justify-between items-center text-white">
          <div>
            <h2 class="text-xl font-black">Resumen de Venta</h2>
            <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">ID: #{{ selectedTicket?.id || '...' }}</p>
          </div>
          <button @click="isModalOpen = false" class="text-gray-500 hover:text-white text-3xl transition-colors">&times;</button>
        </div>
        
        <div class="p-8 overflow-y-auto bg-gray-50/50 flex-1">
          <div v-if="isLoadingTicket" class="py-12 text-center text-gray-500 font-bold animate-pulse">Consultando base de datos...</div>
          
          <div v-else-if="selectedTicket">
            <div class="bg-white p-5 rounded-2xl border border-gray-200 mb-6 shadow-sm text-sm space-y-4">
              <div class="flex justify-between border-b border-gray-100 pb-2">
                <span class="text-gray-400 font-bold uppercase text-[10px]">Fecha</span>
                <span class="font-bold text-gray-800">{{ selectedTicket.date }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-100 pb-2">
                <span class="text-gray-400 font-bold uppercase text-[10px]">Cliente</span>
                <span class="font-bold text-gray-800">{{ selectedTicket.customer }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400 font-bold uppercase text-[10px]">Método</span>
                <span class="font-bold text-gray-800">{{ selectedTicket.payment }}</span>
              </div>
            </div>

            <h3 class="font-black text-gray-800 text-sm mb-3 ml-1 uppercase tracking-widest">Artículos en Ticket</h3>
            <ul class="space-y-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
              <li v-for="(item, i) in selectedTicket.details" :key="i" class="flex justify-between items-center text-sm">
                <div class="flex flex-col">
                  <span class="text-gray-800 font-bold">{{ item.name }}</span>
                  <span class="text-[10px] text-gray-400 font-bold">{{ item.amount }} unidad(es) x ${{ Number(item.price).toFixed(2) }}</span>
                </div>
                <span class="font-black text-gray-800">${{ Number(item.subtotal).toFixed(2) }}</span>
              </li>
            </ul>

            <div class="mt-8 flex justify-between items-center bg-emerald-600 p-6 rounded-2xl text-white shadow-lg shadow-emerald-100">
              <span class="text-lg font-black uppercase tracking-tighter">Total Pagado</span>
              <span class="text-3xl font-black">${{ Number(selectedTicket.total).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div class="p-6 bg-white border-t border-gray-100">
          <button @click="isModalOpen = false" class="w-full bg-gray-900 text-white py-4 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-[0.98]">
            Cerrar Ticket
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-name: fadeIn;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>