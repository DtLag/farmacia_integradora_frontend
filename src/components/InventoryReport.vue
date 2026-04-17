<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useApi } from '@/composables/useApiFetch.ts'
import type { InventoryReportItem } from '@/types/types.ts'

const report = ref<InventoryReportItem[]>([])
const selectedPeriod = ref('week')
const isLoading = ref(false)
const errorMessage = ref('')
const startDate = ref()
const endDate = ref()

async function getReport() {
  isLoading.value = true
  errorMessage.value = ''

  if (selectedPeriod.value === 'custom') {
    if (!startDate.value || !endDate.value) return
  }
  if (startDate.value > endDate.value) {
    alert('Fechas inválidas')
    return
  }

  try {
    let url = `/report/inventory?period=${selectedPeriod.value}`

    if (selectedPeriod.value === 'custom') {
      if (!startDate.value || !endDate.value) {
        errorMessage.value = 'Selecciona ambas fechas'
      }

      url += `&from=${startDate.value}&to=${endDate.value}`
    }
    const { data, error } = await useApi(url, {}).get().json()

    if (error.value) {
      errorMessage.value = 'Error al obtener el reporte'
      report.value = []
      return
    }

    report.value = data.value?.data ?? data.value ?? []
  } catch (err) {
    console.error(err)
    errorMessage.value = 'No se pudo cargar el reporte'
    report.value = []
  } finally {
    isLoading.value = false
  }
}
watch(selectedPeriod, (newValue) => {
  errorMessage.value = ''

  if (newValue !== 'custom') {
    getReport()
  } else {
    report.value = []
    startDate.value = ''
    endDate.value = ''
  }
})

watch([startDate, endDate], () => {
  if (selectedPeriod.value === 'custom' && startDate.value && endDate.value) {
    getReport()
  }
})

onMounted(() => {
  getReport()
})
</script>

<template>
  <div class="w-full flex flex-col">
    <div class="bg-gray-50 border border-gray-200 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row flex-wrap gap-4 items-end mb-6 w-full">
      <div class="flex flex-col gap-1.5 w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest px-1"><i class="fas fa-calendar-alt mr-1"></i> Periodo del Reporte</label>
        <div class="relative">
          <select
            v-model="selectedPeriod"
            @change="getReport"
            class="w-full sm:w-48 appearance-none bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-[#0B369E] outline-none transition shadow-sm"
          >
            <option value="week">Últimos 7 días</option>
            <option value="month">Último mes</option>
            <option value="custom">Personalizado</option>
          </select>
          <i class="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
        </div>
      </div>

      <div v-if="selectedPeriod === 'custom'" class="flex flex-col gap-1.5 w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Fecha Inicio</label>
        <input type="date" class="w-full sm:w-auto bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B369E] outline-none transition shadow-sm" v-model="startDate" />
      </div>
      
      <div v-if="selectedPeriod === 'custom'" class="flex flex-col gap-1.5 w-full sm:w-auto">
        <label class="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Fecha Fin</label>
        <input type="date" class="w-full sm:w-auto bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#0B369E] outline-none transition shadow-sm" v-model="endDate" />
      </div>
    </div>
    
    <div class="w-full">
      <div v-if="errorMessage" class="px-4 py-3 bg-rose-100 border border-rose-200 text-rose-800 rounded-xl font-bold text-sm shadow-sm mb-4 text-center">
        <i class="fas fa-exclamation-triangle mr-1"></i> {{ errorMessage }}
      </div>
      
      <div v-if="isLoading" class="py-12 text-center text-blue-600 font-bold bg-white rounded-2xl border border-gray-200">
        <i class="fas fa-spinner animate-spin text-2xl mb-2"></i><br>Calculando rotación de inventario...
      </div>

      <div v-else-if="report.length > 0" class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full">
        <div class="overflow-x-auto w-full">
          <table class="w-full text-left border-collapse min-w-[850px]">
            <thead class="bg-[#1a2b4b] text-white uppercase text-[10px] sm:text-xs font-bold tracking-wider">
              <tr>
                <th class="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">Producto</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 whitespace-nowrap">Categoría</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">Ventas (Mostrador)</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">Pedidos (PickUp)</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">Pedidos Cancelados</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap bg-blue-900/50">Movimiento Real</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">% Rotación</th>
                <th class="px-4 sm:px-5 py-3 sm:py-4 text-center whitespace-nowrap">Clasificación ABC</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 text-xs sm:text-sm">
              <tr
                v-for="item in report"
                :key="item.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 sm:px-5 py-3 sm:py-4 font-bold text-gray-900">{{ item.name }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-gray-600">{{ item.categoria }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-medium">{{ item.cantidad_ventas }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-medium">{{ item.cantidad_ordenes_completadas }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center text-rose-600 font-bold">{{ item.cantidad_ordenes_canceladas }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-black bg-blue-50/50 text-blue-800">{{ item.movimiento_real }}</td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center font-black" :class="Number(item.porcentaje_rotacion) > 50 ? 'text-emerald-600' : (Number(item.porcentaje_rotacion) > 20 ? 'text-amber-600' : 'text-gray-500')">
                    {{ item.porcentaje_rotacion }}%
                </td>
                <td class="px-4 sm:px-5 py-3 sm:py-4 text-center">
                    <span class="px-2.5 py-1 rounded-lg text-[10px] font-black border" :class="item.clasificacion_rotacion === 'Alta' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : (item.clasificacion_rotacion === 'Media' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200')">
                        {{ item.clasificacion_rotacion }}
                    </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else-if="!isLoading" class="py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
        <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <i class="fas fa-chart-line text-2xl text-gray-300"></i>
        </div>
        <p class="text-gray-500 font-bold">No hay datos de movimiento en el periodo seleccionado.</p>
        <p class="text-sm text-gray-400 mt-1">Intenta ampliar el rango de fechas.</p>
      </div>
    </div>
  </div>
</template>