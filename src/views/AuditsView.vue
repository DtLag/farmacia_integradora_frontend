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
  <div class="p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-gray-50/50 w-full overflow-hidden">

    <header class="mb-2 sm:mb-6">
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">Registro de Auditoría</h1>
      <p class="text-sm sm:text-base text-gray-500 mt-1">Monitorea la actividad del sistema y los usuarios.</p>
    </header>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="bg-[#1a2b4b] text-white px-5 py-3">
        <h2 class="text-sm sm:text-base font-bold flex items-center gap-2"><i class="fas fa-filter text-blue-300"></i> Filtros de Búsqueda</h2>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end p-4 sm:p-5">
        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Fecha Desde</label>
          <input v-model="start" type="date" class="w-full border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B369E] transition" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Fecha Hasta</label>
          <input v-model="end" type="date" class="w-full border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B369E] transition" />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Usuario</label>
          <select v-model="usuario" class="w-full border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B369E] transition">
            <option value="">Todos los usuarios</option>
            <option v-for="u in staff?.data" :key="u.id" :value="u.id"> {{ u.name }} </option>
          </select>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Módulo</label>
          <select v-model="modulo" class="w-full border border-gray-200 rounded-xl bg-gray-50/50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B369E] transition">
            <option value="">Todos los módulos</option>
            <option value="Venta">Venta</option>
            <option value="Productos">Productos</option>
            <option value="Producto">Producto</option>
            <option value="Movimientos de Inventario">Movimientos de Inventario</option>
            <option value="Reservaciones">Reservaciones</option>
          </select>
        </div>

        <div class="flex gap-2 lg:col-span-1 sm:col-span-2 pt-2 lg:pt-0">
          <button class="flex-1 bg-[#0B369E] text-white font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-blue-800 transition shadow-sm" @click="filtrar">
            Buscar
          </button>
          <button class="flex-1 bg-gray-100 text-gray-700 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-gray-200 border border-gray-200 transition shadow-sm" @click="limpiar">
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
      <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-5 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <i class="fas fa-list text-xl"></i>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-800">{{auditsData?.data.length || 0}}</p>
          <p class="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-wider mt-0.5">Eventos Filtrados</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex items-center gap-5 hover:shadow-md transition">
        <div class="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <i class="fas fa-calendar-day text-xl"></i>
        </div>
        <div>
          <p class="text-3xl font-black text-gray-800">{{ todayAudits?.data.length || 0 }}</p>
          <p class="text-gray-500 text-xs sm:text-sm font-bold uppercase tracking-wider mt-0.5">Eventos de Hoy</p>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col w-full">
      <div class="overflow-x-auto overflow-y-auto w-full max-h-[60vh]">
        <table class="w-full text-sm text-left border-collapse min-w-[900px]">
          <thead class="bg-gray-100 text-gray-600 uppercase text-[10px] sm:text-xs font-bold sticky top-0 z-10 border-b border-gray-200">
            <tr>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">ID Evento</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Fecha</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Hora</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Usuario</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Rol</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Módulo</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Acción</th>
              <th class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">Detalles</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <tr v-if="!auditsData?.data || auditsData.data.length === 0">
                <td colspan="8" class="px-6 py-16 text-center text-gray-400 italic">No hay registros de auditoría que mostrar.</td>
            </tr>
            <AuditsCard v-else v-for="auds in auditsData?.data" :key="auds.id" :audits="auds" class="hover:bg-gray-50 transition-colors" />
          </tbody>
        </table>
      </div>
    </div>

  </div>
</template>