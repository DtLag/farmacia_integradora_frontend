<script setup lang="ts">
import type { Product } from '@/types/types';
import { now } from '@vueuse/core';
import { ref } from 'vue';

defineProps<{stock: Product[], expire:Product[], expired: Product[]}>();

const hoy = ref(now());

const days = (date: string) => {
  const fechaHoy = new Date(hoy.value);
  const fechaExpiracion = new Date(date + 'T00:00:00');
  const diferencia = fechaExpiracion.getTime() - fechaHoy.getTime()
  return Math.ceil(diferencia/(1000 * 60 * 60 * 24));
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
    
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition">
      <div class="flex justify-between items-center px-5 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shrink-0">
        <span class="font-extrabold text-sm sm:text-base flex items-center gap-2"><i class="fas fa-boxes text-amber-900/60"></i> Stock bajo</span>
        <span class="bg-amber-900/10 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black">{{ stock?.length || 0 }}</span>
      </div>
      
      <div v-if="stock?.length" class="p-2 overflow-y-auto max-h-[400px] flex-grow">
        <div v-for="s in stock" :key="s.id" class="flex justify-between items-center p-3 sm:p-4 mb-2 bg-amber-50/30 rounded-xl border border-amber-100/50 hover:bg-amber-50 transition">
          <div class="min-w-0 pr-2">
            <strong class="block text-gray-800 text-sm truncate" :title="s.name">{{ s.name }}</strong>
            <small class="block text-xs text-gray-500 mt-0.5">Cant. mínima recomendada: {{ s.min_stock }}</small>
          </div>
          <span class="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1.5 rounded-lg font-black text-sm shrink-0 shadow-sm">
            {{ s.stock }}
          </span>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center p-10 text-gray-400 flex-grow">
        <i class="fas fa-check-circle text-4xl mb-2 text-gray-200"></i>
        <p class="text-sm font-medium">Stock en óptimas condiciones</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition">
      <div class="flex justify-between items-center px-5 py-3.5 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white shrink-0">
        <span class="font-extrabold text-sm sm:text-base flex items-center gap-2"><i class="fas fa-calendar-alt text-white/60"></i> Próximos a vencer</span>
        <span class="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black">{{ expire?.length || 0 }}</span>
      </div>
      
      <div v-if="expire?.length" class="p-2 overflow-y-auto max-h-[400px] flex-grow">
        <div v-for="e in expire" :key="e.id" class="flex justify-between items-center p-3 sm:p-4 mb-2 bg-cyan-50/30 rounded-xl border border-cyan-100/50 hover:bg-cyan-50 transition">
          <div class="min-w-0 pr-2">
            <strong class="block text-gray-800 text-sm truncate" :title="e.name">{{ e.name }}</strong>
            <div v-for="exp in e.product_receptions" :key="exp.id" class="mt-1.5 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
              <small class="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Lote expira: {{ exp.expiration_date }}</small>
              <small class="block text-xs font-black" :class="days(exp.expiration_date) <= 3 ? 'text-rose-600' : 'text-cyan-700'">Faltan {{ days(exp.expiration_date) }} días</small>
            </div>
          </div>
          <div class="flex flex-col items-center justify-center shrink-0 ml-2">
              <span class="text-[10px] font-bold text-gray-400 uppercase mb-1">Unidades</span>
              <span class="bg-cyan-100 text-cyan-800 border border-cyan-200 px-3 py-1.5 rounded-lg font-black text-sm shadow-sm">{{ e.stock }}</span>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center p-10 text-gray-400 flex-grow">
        <i class="fas fa-shield-alt text-4xl mb-2 text-gray-200"></i>
        <p class="text-sm font-medium">Lotes vigentes</p>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full hover:shadow-md transition">
      <div class="flex flex-col px-5 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white shrink-0">
        <div class="flex justify-between items-center w-full">
          <span class="font-extrabold text-sm sm:text-base flex items-center gap-2"><i class="fas fa-skull-crossbones text-white/60"></i> Productos caducados</span>
          <span class="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-black">{{ expired?.length || 0 }}</span>
        </div>
        <div class="text-[10px] sm:text-xs mt-1.5 font-bold text-rose-100 uppercase tracking-wider flex items-center gap-1.5">
          <i class="fas fa-exclamation-triangle"></i> Retirar de piso de ventas
        </div>
      </div>
              
      <div v-if="expired?.length" class="p-2 overflow-y-auto max-h-[400px] flex-grow bg-rose-50/10">
        <div v-for="ex in expired" :key="ex.id" class="flex justify-between items-center p-3 sm:p-4 mb-2 bg-white rounded-xl border border-rose-100 shadow-sm hover:shadow-md transition relative overflow-hidden">
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>
          <div class="min-w-0 pr-2 pl-1.5">
            <strong class="block text-gray-800 text-sm truncate" :title="ex.name">{{ ex.name }}</strong>
            <div v-for="exp in ex.product_receptions" :key="exp.id" class="mt-1">
              <small class="block text-xs font-bold text-rose-600">Venció: {{ exp.expiration_date }}</small>
            </div>
          </div>
          <div class="flex flex-col items-center justify-center shrink-0 ml-2">
              <span class="text-[10px] font-bold text-gray-400 uppercase mb-1">Pérdida</span>
              <span class="bg-rose-100 text-rose-800 border border-rose-200 px-3 py-1.5 rounded-lg font-black text-sm shadow-sm">{{ ex.stock }}</span>
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center p-10 text-gray-400 flex-grow">
        <i class="fas fa-box-check text-4xl mb-2 text-gray-200"></i>
        <p class="text-sm font-medium">Sin pérdidas por caducidad</p>
      </div>
    </div>

  </div>
</template>