<script setup lang="ts">
import { useApi } from '@/composables/useApiFetch.ts'
import type { staff, UserMetricsItem } from '@/types/types.ts'
import { onMounted, ref, watch } from 'vue'

const users = ref<staff[]>()
const errorMessage = ref<string>('')
const isLoading = ref<boolean>(false)
const selectedUser = ref('Harold Admin')
const startDate = ref('2026-04-01')
const endDate = ref('2026-04-05')
const metrics = ref<UserMetricsItem[]>([])
const selectedPeriod = ref('week')

async function getUsersStaff() {
  const { data } = await useApi('/staff').get().json()
  users.value = data.value?.data ?? data.value ?? []
}

async function getUserMetrics() {
  let url = `/user/metrics?user=${selectedUser.value}&period=${selectedPeriod.value}`

  if (selectedPeriod.value === 'custom') {
    if (!startDate.value || !endDate.value) {
      errorMessage.value = 'Selecciona ambas fechas'
    }
    if (startDate.value > endDate.value) {
      errorMessage.value = 'Fechas invalidas'
    }
    url += `&from=${startDate.value}&to=${endDate.value}`
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    if (selectedPeriod.value === 'custom' && startDate.value > endDate.value) {
      alert('Fechas invalidas')
      return
    }

    const { data, error } = await useApi(url).get().json()

    if (error.value) {
      errorMessage.value = error.value.message
      metrics.value = []
      return
    }
    metrics.value = data.value?.data ?? data.value ?? []
  } catch (e) {
    console.log(e)
    errorMessage.value = 'Error al obtener el reporte'
    metrics.value = []
  } finally {
    isLoading.value = false
  }
}

watch([selectedUser, startDate, endDate, selectedPeriod], (newValue) => {
  errorMessage.value = ''
  metrics.value = []

  if (newValue) {
    getUserMetrics()
  }
})

onMounted(async () => {
  await getUsersStaff()
  await getUserMetrics()
})
</script>

<template>
  <div class="w-full flex flex-col">
    
    <div class="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row flex-wrap gap-4 items-end mb-6 w-full">
      
      <div class="flex flex-col gap-1.5 w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest px-1"><i class="fas fa-user mr-1"></i> Usuario</label>
        <div class="relative">
          <select v-model="selectedUser" class="w-full sm:w-56 appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#0B369E] outline-none transition shadow-sm">
            <option v-for="user in users" :key="user.id" :value="`${user.name} ${user.last_name}`">{{ user.name }} {{ user.last_name }}</option>
          </select>
          <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
        </div>
      </div>

      <div class="flex flex-col gap-1.5 w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest px-1"><i class="fas fa-calendar-alt mr-1"></i> Periodo</label>
        <div class="relative">
          <select
            v-model="selectedPeriod"
            @change="getUserMetrics"
            class="w-full sm:w-48 appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#0B369E] outline-none transition shadow-sm"
          >
            <option value="week">Últimos 7 días</option>
            <option value="month">Último mes</option>
            <option value="custom">Personalizado</option>
          </select>
          <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
        </div>
      </div>

      <div v-if="selectedPeriod === 'custom'" class="flex flex-col gap-1.5 w-full sm:w-auto animate-in">
        <label class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Desde</label>
        <input type="date" class="w-full sm:w-auto bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B369E] outline-none transition shadow-sm" v-model="startDate" />
      </div>
      
      <div v-if="selectedPeriod === 'custom'" class="flex flex-col gap-1.5 w-full sm:w-auto animate-in">
        <label class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Hasta</label>
        <input type="date" class="w-full sm:w-auto bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B369E] outline-none transition shadow-sm" v-model="endDate" />
      </div>
    </div>

    <div class="w-full">
      <div v-if="errorMessage" class="px-4 py-3 bg-rose-100 border border-rose-200 text-rose-800 rounded-xl font-bold text-sm shadow-sm mb-4 text-center">
        <i class="fas fa-exclamation-triangle mr-1"></i> {{ errorMessage }}
      </div>

      <div v-if="isLoading" class="py-12 text-center text-blue-600 font-bold bg-white rounded-2xl border border-gray-200 shadow-sm">
        <i class="fas fa-spinner animate-spin text-2xl mb-2"></i><br>Cargando métricas del usuario...
      </div>

      <div v-else-if="metrics.length > 0" class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse min-w-[1100px]">
            <thead class="bg-[#1a2b4b] text-white uppercase text-[10px] sm:text-xs font-bold tracking-wider">
              <tr>
                <th class="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">Usuario</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">Rol</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">Ventas</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap text-rose-300">Ventas Canceladas</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">Pedidos</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap text-rose-300">Pedidos Cancelados</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-right whitespace-nowrap bg-blue-900/50">Ingresos Ventas</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-right whitespace-nowrap bg-emerald-900/50">Ingresos Pedidos</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">Movimientos Inv.</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">Acciones Aud.</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-xs sm:text-sm">
              <tr
                v-for="item in metrics"
                :key="item.user_id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 sm:px-5 py-3 sm:py-4 font-bold text-gray-900">{{ item.user_name }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4">
                    <span class="px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-md text-[10px] font-bold uppercase tracking-wider">{{ item.role_name }}</span>
                </td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-bold text-emerald-600">{{ item.ventas_completadas }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-medium text-rose-600">{{ item.ventas_canceladas }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-bold text-blue-600">{{ item.pedidos_completados }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-medium text-rose-600">{{ item.pedidos_cancelados }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-right font-black bg-blue-50/30 text-blue-700">${{ item.ingresos_ventas }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-right font-black bg-emerald-50/30 text-emerald-700">${{ item.ingresos_pedidos }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-medium text-amber-600">{{ item.movimientos_inventario }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-medium text-purple-600">{{ item.acciones_registradas }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="!isLoading" class="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-user-clock text-2xl text-gray-300"></i>
        </div>
        <p class="text-gray-500 font-bold">No hay métricas registradas para este usuario en el periodo.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation-name: fadeInSlide;
  animation-duration: 0.2s;
  animation-timing-function: ease-out;
}
@keyframes fadeInSlide {
  from { opacity: 0; transform: translateX(-10px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>