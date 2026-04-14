<script setup lang="ts">

import AuditsCard from '@/components/AuditsCard.vue';
import { useApi } from '@/composables/useApiFetch.ts'
import { onMounted, onUnmounted, ref } from 'vue';

const url = ref(`/audits`)
const {data: auditsData, execute: executeData} = useApi(url).get().json();
const {data: todayAudits, execute: exTodayAudits} = useApi(`/today/audits`).get().json();
const {data: staff, execute: runStaff} = useApi(`/staff`).get().json();

const interval = ref<number | null>(null);

const start = ref<string>('');
const end = ref<string>('');
const usuario = ref<number | ''>('');
const modulo = ref<string>('');

function filtrar(){
  url.value = `/audits?startDate=${start.value}&endDate=${end.value}&user=${usuario.value}&module=${modulo.value}`
  executeData();
}

function limpiar(){
  start.value = '';
  end.value = '';
  usuario.value = '';
  modulo.value = '';
  url.value = `/audits`;
  executeData();
}

onMounted (() => {
  executeData();
  exTodayAudits();
  runStaff();
  
  interval.value = setInterval(() => {
    executeData();
    exTodayAudits();
  }, 30000);
});

onUnmounted(() => {
  if(interval.value){
    clearInterval(interval.value);
    interval.value = null;
  }
});

</script>

<template>
  <div class="p-6 space-y-6">

    <div class="rounded-xl shadow-md overflow-hidden">
      <div class="bg-teal-500 text-white px-4 py-3">
        <h2 class="text-lg font-semibold">Filtros de Auditoría</h2>
      </div>
      

      <div class="grid grid-cols- md:grid-cols-5 gap-4 items-end p-4">
        <div>
          <label class="block text-sm text-gray-600">Fecha Desde</label>
          <input v-model="start" type="date" class="w-full border border-gray-200 rounded shadow-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" placeholder="AAA-MM-DD" />
        </div>

        <div>
          <label class="block text-sm text-gray-600">Fecha Hasta</label>
          <input v-model="end" type="date" class="w-full border border-gray-200 rounded shadow-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition" placeholder="AAA-MM-DD" />
        </div>

        <div>
          <label class="block text-sm text-gray-600">Usuario</label>
          <select v-model="usuario" class="w-full border border-gray-200 rounded shadow-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition">
            <option disabled value="">Seleccione un usuario</option>
            <option v-for="u in staff?.data" :key="u.id" :value="u.id"> {{ u.name }} </option>
          </select>
        </div>

        <div>
          <label class="block text-sm text-gray-600">Módulo</label>
          <select v-model="modulo"  class="w-full border border-gray-200 rounded shadow-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition">
            <option disabled value="">Seleccione un módulo</option>
            <option>Update</option>
            <option>Nueva Venta</option>
            <option>Actualizado</option>
            <option>Output</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition shadow-md cursor-pointer" @click="filtrar">
            Buscar
          </button>
          <button class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition shadow-md cursor-pointer" @click="limpiar">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-md flex items-center gap-4">
        <div class="w-2 h-full bg-blue-500 rounded"></div>
        <div>
          <p class="text-2xl font-bold">{{auditsData?.data.length}}</p>
          <p class="text-gray-500 text-sm">Eventos Totales </p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-md flex items-center gap-4">
        <div class="w-2 h-full bg-green-500 rounded"></div>
        <div>
          <p class="text-2xl font-bold">{{ todayAudits?.data.length }}</p>
          <p class="text-gray-500 text-sm">Eventos Hoy</p>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-300 text-gray-800">
          <tr>
            <th class="text-left px-4 py-3">ID Evento</th>
            <th class="text-left px-4 py-3">Fecha</th>
            <th class="text-left px-4 py-3">Hora</th>
            <th class="text-left px-4 py-3">Usuario</th>
            <th class="text-left px-4 py-3">Rol</th>
            <th class="text-left px-4 py-3">Módulo afectado</th>
            <th class="text-left px-4 py-3">Acción realizada</th>
            <th class="text-left px-4 py-3">Detalles</th>
          </tr>
        </thead>

        <tbody>
          <AuditsCard v-for="auds in auditsData?.data" :key="auds.id" :audits="auds" />
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped></style>