<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useApi } from '@/composables/useApiFetch.ts'
import type { ReportItem } from '@/types/types.ts'

const report = ref<ReportItem[]>([])
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
    alert('Fechas invalidas')
    return
  }

  try {
    let url = `/sales/report?period=${selectedPeriod.value}`

    if (selectedPeriod.value === 'custom') {
      if (!startDate.value || !endDate.value) {
        errorMessage.value = 'Selecciona ambas fechas'
      }
      if (startDate.value > endDate.value) {
        errorMessage.value = 'Fechas invalidas'
      }
      url += `&from=${startDate.value}&to=${endDate.value}`
      console.log('from:', startDate.value)
      console.log('to:', endDate.value)
    }
    const { data, error } = await useApi(url, {}).get().json()

    if (error.value) {
      console.error(error.value)
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
  <div >
    <div class="bg-blue-100 p-3 rounded-xl flex gap-4 items-center ">
      <div class="flex flex-col">
        <label class="text-xs mb-1">Periodo</label>
        <select
          v-model="selectedPeriod"
          @change="getReport"
          class="bg-white h-8 w-fit rounded-xl px-2"
        >
          <option value="week">Últimos 7 días</option>
          <option value="month">Último mes</option>
          <option value="custom">Personalizado</option>
          <option value="historical">Histórico</option>
        </select>
      </div>
      <input
        v-if="selectedPeriod === 'custom'"
        type="date"
        class="rounded-xl h-20"
        placeholder="Desde"
        v-model="startDate"
      />
      <input
        v-if="selectedPeriod === 'custom'"
        type="date"
        class="rounded-xl h-20"
        placeholder="Hasta"
        v-model="endDate"
      />
    </div>
    <div class="m-6">
      <p v-if="isLoading">Cargando...</p>
      <p v-if="errorMessage">{{ errorMessage }}</p>

      <table
        v-if="report.length"
        class="w-full border border-gray-800 rounded-lg overflow-hidden text-center"
      >
        <thead class="bg-[#375ab4] text-white">
          <tr>
            <th class="px-4 py-2">Código</th>
            <th class="px-4 py-2">Producto</th>
            <th class="px-4 py-2">Cantidad</th>
            <th class="px-4 py-2">Ventas</th>
            <th class="px-4 py-2">Pedidos</th>
            <th class="px-4 py-2">Ingresos</th>
            <th class="px-4 py-2">Costo</th>
            <th class="px-4 py-2">Ganancia</th>
            <th class="px-4 py-2">Margen</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in report"
            :key="item.product_id"
            class="hover:bg-blue-50 transition border-t border-blue-800"
          >
            <td>{{ item.codigo }}</td>
            <td>{{ item.name }}</td>
            <td>{{ item.cantidad }}</td>
            <td>{{ item.ventas_realizadas }}</td>
            <td>{{ item.pedidos_realizados }}</td>
            <td>{{ item.ingresos }}</td>
            <td>{{ item.costo }}</td>
            <td>{{ item.ganancia }}</td>
            <td>{{ item.margen }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else-if="!isLoading">No hay datos</p>
    </div>
  </div>
</template>

<style scoped>
input {
  background-color: white;
  width: fit-content;
  height: 32px;
  padding: 5px;
}
label {
  color: #1e3a6e;
}
</style>
