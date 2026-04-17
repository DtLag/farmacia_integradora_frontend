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
  <div class="p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col bg-gray-50/50 w-full overflow-hidden">
    
    <header class="mb-4 sm:mb-6 text-center sm:text-left">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Historial de Tickets</h1>
      <p class="text-sm sm:text-base text-gray-500 mt-1">Visualiza y filtra todas las ventas realizadas.</p>
    </header>

    <section class="mb-6 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row flex-wrap items-start sm:items-end gap-4 sm:gap-6 w-full">
      
      <div class="flex flex-col gap-1.5 w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Desde</label>
        <input 
          v-model="filterStartDate" 
          type="date" 
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition"
        />
      </div>

      <div class="flex flex-col gap-1.5 w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Hasta</label>
        <input 
          v-model="filterEndDate" 
          type="date" 
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition"
        />
      </div>

      <div class="flex flex-col gap-1.5 w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Tipo de Origen</label>
        <select 
          v-model="filterType" 
          class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 transition min-w-[140px]"
        >
          <option value="Todos">Todos</option>
          <option value="Mostrador">Mostrador</option>
          <option value="Pickup">Pickup</option>
        </select>
      </div>

      <div class="flex items-center gap-4 w-full sm:w-auto sm:ml-auto">
        <button 
          @click="clearFilters"
          class="flex-1 sm:flex-none text-xs sm:text-sm font-bold text-red-500 hover:bg-red-50 border border-red-100 sm:border-none px-4 py-2.5 rounded-xl transition-colors text-center"
        >
          Limpiar
        </button>

        <div class="flex-1 sm:flex-none bg-blue-50 px-4 py-2.5 rounded-xl border border-blue-100 text-center">
          <span class="text-xs sm:text-sm font-bold text-blue-600">{{ filteredTransactions.length }} res</span>
        </div>
      </div>
    </section>

    <div class="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col w-full">
      <div class="overflow-x-auto overflow-y-auto w-full">
        <table class="w-full text-left border-collapse min-w-[650px]">
          <thead class="bg-gray-800 text-white uppercase text-[10px] sm:text-xs font-bold sticky top-0 z-10">
            <tr>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Folio / ID</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Fecha de Venta</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Tipo</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Total Neto</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap">Detalle</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm">
            <tr v-if="isLoading">
              <td colspan="5" class="px-6 py-16 text-center text-gray-400 font-medium animate-pulse">Sincronizando tickets...</td>
            </tr>
            <tr v-else-if="filteredTransactions.length === 0">
              <td colspan="5" class="px-6 py-16 text-center text-gray-400 italic">No se encontraron tickets con los filtros actuales.</td>
            </tr>
            <tr v-for="tx in filteredTransactions" :key="tx.sale_type + tx.id" class="hover:bg-gray-50 transition-colors">
              <td class="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 whitespace-nowrap">#{{ tx.id }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">{{ tx.date }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                <span 
                  :class="tx.sale_type === 'Mostrador' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-purple-100 text-purple-700 border-purple-200'" 
                  class="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border"
                >
                  {{ tx.sale_type }}
                </span>
              </td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 font-black text-emerald-600 text-base sm:text-lg whitespace-nowrap">${{ Number(tx.total).toFixed(2) }}</td>
              <td class="px-4 sm:px-6 py-3 sm:py-4 text-center whitespace-nowrap">
                <button @click="openTicket(tx)" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors">
                  Ver Ticket
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-[95%] sm:max-w-md overflow-hidden flex flex-col max-h-[90vh] animate-in">
        
        <div class="bg-gray-900 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center text-white shrink-0">
          <div>
            <h2 class="text-lg sm:text-xl font-black">Resumen de Venta</h2>
            <p class="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest">ID: #{{ selectedTicket?.id || '...' }}</p>
          </div>
          <button @click="isModalOpen = false" class="text-gray-400 hover:text-white text-3xl transition-colors p-2">&times;</button>
        </div>
        
        <div class="p-5 sm:p-8 overflow-y-auto bg-gray-50/50 flex-1">
          <div v-if="isLoadingTicket" class="py-12 text-center text-gray-500 font-bold animate-pulse">Consultando base de datos...</div>
          
          <div v-else-if="selectedTicket">
            <div class="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 mb-5 sm:mb-6 shadow-sm text-xs sm:text-sm space-y-3 sm:space-y-4">
              <div class="flex justify-between border-b border-gray-100 pb-2">
                <span class="text-gray-400 font-bold uppercase text-[10px]">Fecha</span>
                <span class="font-bold text-gray-800">{{ selectedTicket.date }}</span>
              </div>
              <div class="flex justify-between border-b border-gray-100 pb-2">
                <span class="text-gray-400 font-bold uppercase text-[10px]">Cliente</span>
                <span class="font-bold text-gray-800 text-right">{{ selectedTicket.customer }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400 font-bold uppercase text-[10px]">Método</span>
                <span class="font-bold text-gray-800">{{ selectedTicket.payment }}</span>
              </div>
            </div>

            <h3 class="font-black text-gray-800 text-xs sm:text-sm mb-3 ml-1 uppercase tracking-widest">Artículos en Ticket</h3>
            <ul class="space-y-3 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm">
              <li v-for="(item, i) in selectedTicket.details" :key="i" class="flex justify-between items-center text-xs sm:text-sm">
                <div class="flex flex-col max-w-[70%]">
                  <span class="text-gray-800 font-bold truncate">{{ item.name }}</span>
                  <span class="text-[10px] text-gray-400 font-bold mt-0.5">{{ item.amount }} unid(s) x ${{ Number(item.price).toFixed(2) }}</span>
                </div>
                <span class="font-black text-gray-800 whitespace-nowrap">${{ Number(item.subtotal).toFixed(2) }}</span>
              </li>
            </ul>

            <div class="mt-6 sm:mt-8 flex justify-between items-center bg-emerald-600 p-5 sm:p-6 rounded-2xl text-white shadow-lg shadow-emerald-600/30">
              <span class="text-sm sm:text-lg font-black uppercase tracking-tighter">Total Pagado</span>
              <span class="text-2xl sm:text-3xl font-black">${{ Number(selectedTicket.total).toFixed(2) }}</span>
            </div>
          </div>
        </div>
        
        <div class="p-4 sm:p-6 bg-white border-t border-gray-100 shrink-0">
          <button @click="isModalOpen = false" class="w-full bg-gray-900 text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black hover:bg-black transition-all shadow-md active:scale-[0.98]">
            Cerrar Ticket
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-name: fadeInScale;
  animation-duration: 0.25s;
  animation-timing-function: ease-out;
}
@keyframes fadeInScale {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>