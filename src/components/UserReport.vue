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
  let url = `/user/metrics?user=${selectedUser.value} &period=${selectedPeriod.value}`

  if (selectedPeriod.value === 'custom') {
    if (!startDate.value || !endDate.value) {
      errorMessage.value = 'Selecciona ambas fechas'
    }
    if (startDate.value > endDate.value) {
      errorMessage.value = 'Fechas invalidas'
    }
    url += `&from=${startDate.value}&to=${endDate.value}`
    console.log(url)
  }

  try {
    isLoading.value = true
    errorMessage.value = ''

    if (startDate.value > endDate.value) {
      alert('Fechas invalidas')
      return
    }
    console.log(url)

    const { data, error } = await useApi(url).get().json()
    console.log(data.value)

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
//
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
  <div>
    <div class="bg-blue-100 p-3 rounded-xl flex gap-4 w-full">
      <div class="flex flex-col">
        <label class="text-xs mb-1">Usuario</label>
        <select v-model="selectedUser" class="bg-white h-8 w-fit rounded-xl px-2">
          <option v-for="user in users" :key="user.id">{{ user.name }} {{ user.last_name }}</option>
        </select>
      </div>

      <div class="flex flex-col">
        <label class="text-xs mb-1">Periodo</label>
        <select
          v-model="selectedPeriod"
          @change="getUserMetrics"
          class="bg-white h-8 w-fit rounded-xl px-2"
        >
          <option value="week">Últimos 7 días</option>
          <option value="month">Último mes</option>
          <option value="custom">Personalizado</option>
        </select>
      </div>

      <div class="flex flex-col" v-if="selectedPeriod === 'custom'">
        <label class="text-xs mb-1">Desde</label>
        <input type="date" class="rounded-xl h-20" v-model="startDate" />
      </div>
      <div class="flex flex-col mb-1" v-if="selectedPeriod === 'custom'">
        <label class="text-xs mb-1">Hasta</label>
        <input type="date" class="rounded-xl h-20" v-model="endDate" />
      </div>
    </div>
    <div class="m-6">
      <p class="text-gray-500 text-sm text-center animate-pulse" v-if="isLoading">Cargando...</p>
      <p v-if="errorMessage" class="text-gray-500 text-sm text-center animate-pulse">
        {{ errorMessage }}
      </p>

      <table
        v-if="metrics.length"
        class="w-full border border-b-yellow-700 rounded-lg overflow-hidden text-center"
      >
        <thead class="bg-yellow-500 text-white">
          <tr>
            <th class="px-4 py-2">Usuario</th>
            <th class="px-4 py-2">Rol</th>
            <th class="px-4 py-2">Ventas</th>
            <th class="px-4 py-2">Ventas Canceladas</th>
            <th class="px-4 py-2">Pedidos</th>
            <th class="px-4 py-2">Pedidos Cancelados</th>
            <th class="px-4 py-2">Ingresos Ventas</th>
            <th class="px-4 py-2">Ingresos Pedidos</th>
            <th class="px-4 py-2">Movimientos</th>
            <th class="px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in metrics"
            :key="item.user_id"
            class="hover:bg-blue-50 transition border-t border-b-yellow-700"
          >
            <td>{{ item.user_name }}</td>
            <td>{{ item.role_name }}</td>
            <td>{{ item.ventas_completadas }}</td>
            <td>{{ item.ventas_canceladas }}</td>
            <td>{{ item.pedidos_completados }}</td>
            <td>{{ item.pedidos_cancelados }}</td>
            <td>${{ item.ingresos_ventas }}</td>
            <td>${{ item.ingresos_pedidos }}</td>
            <td>{{ item.movimientos_inventario }}</td>
            <td>{{ item.acciones_registradas }}</td>
          </tr>
        </tbody>
      </table>

      <p class="text-gray-500 text-sm text-center animate-pulse" v-else-if="!isLoading">
        No hay datos
      </p>
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
