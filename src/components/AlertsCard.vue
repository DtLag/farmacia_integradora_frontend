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

  const dias = Math.ceil(diferencia/(1000 * 60 * 60 * 24));
  
  return dias;
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-[18px] ">
    
    <div class="bg-white rounded-lg border border-[#ddd] overflow-hidden border-t-4 border-t-[#f4c542]">
      <div class="flex justify-between items-center px-[14px] py-2.5 font-semibold bg-[#f4c542] text-black">
        <span>Productos con stock bajo</span>
        <span class="bg-white text-black px-2 py-0.5 rounded-md text-xs">{{ stock?.length }}</span>
      </div>
      
      <div v-if="stock?.length" class="p-2.5">
        <div v-for="s in stock" :key="s.id" class="flex justify-between items-center p-2.5 border-b border-gray-100 last:border-0">
          <div>
            <strong class="block text-sm">{{ s.name }}</strong>
            <small class="block text-[14px] text-gray-500 leading-tight">Cantidad mínima: {{ s.min_stock }}</small>
          </div>
          <span class="bg-[#f4c542] px-2 py-1 rounded-md font-bold text-sm min-w-[32px] text-center">
            {{ s.stock }}
          </span>
        </div>
      </div>
      <div v-else class="p-[15px] text-center text-gray-500 italic text-sm">
        No hay productos con stock bajo.
      </div>
    </div>

    <div class="bg-white rounded-lg border border-[#ddd] overflow-hidden border-t-4 border-t-[#17a2b8]">
      <div class="flex justify-between items-center px-[14px] py-2.5 font-semibold bg-[#17a2b8] text-white">
        <span>Próximos a vencer (7 días)</span>
        <span class="bg-white text-[#17a2b8] px-2 py-0.5 rounded-md text-xs font-bold">{{ expire?.length }}</span>
      </div>
      
      <div v-if="expire?.length" class="p-2.5">
        <div v-for="e in expire" :key="e.id" class="flex justify-between items-center p-2.5 border-b border-gray-100 last:border-0">
          <div class="flex-1">
            <strong class="block text-sm">{{ e.name }}</strong>
            <div v-for="exp in e.product_receptions" :key="exp.id" class="mt-1">
              <small class="block text-[14px] text-gray-500 leading-tight">Fecha de vencimiento: {{ exp.expiration_date }}</small>
              <small class="block text-[14px] text-gray-500 leading-tight">Días para que expire: {{ days(exp.expiration_date) }} días</small>
            </div>
          </div>
          <span class="bg-[#17a2b8] text-white px-2 py-1 rounded-md font-bold text-sm ml-2">
            {{ e.stock }}
          </span>
        </div>
      </div>
      <div v-else class="p-[15px] text-center text-gray-500 italic text-sm">
        No hay lotes por vencer.
      </div>
    </div>

    <div class="bg-white rounded-lg border border-[#ddd] overflow-hidden border-t-4 border-t-[#dc3545]">
      <div class="flex flex-col px-[14px] py-2.5 bg-[#dc3545] text-white">
        <div class="flex justify-between items-center w-full">
          <span class="font-semibold">Productos caducados</span>
          <span class="bg-white text-[#dc3545] px-2 py-0.5 rounded-md text-xs font-bold">{{ expired?.length }}</span>
        </div>
        <div class="text-[11px] mt-1 font-medium opacity-90 uppercase tracking-wider">
          🚨 No deben venderse
        </div>
      </div>
              
      <div v-if="expired?.length" class="p-2.5">
        <div v-for="ex in expired" :key="ex.id" class="flex justify-between items-center p-2.5 border-b border-gray-100 last:border-0">
          <div class="flex-1">
            <strong class="block text-sm">{{ ex.name }}</strong>
            <div v-for="exp in ex.product_receptions" :key="exp.id">
              <small class="block text-[14px] text-gray-500 leading-tight">Fecha en que venció: {{ exp.expiration_date }}</small>
            </div>
          </div>
          <span class="bg-[#dc3545] text-white px-2 py-1 rounded-md font-bold text-sm ml-2">
            {{ ex.stock }}
          </span>
        </div>
      </div>
      <div v-else class="p-[15px] text-center text-gray-500 italic text-sm">
        No hay productos caducados.
      </div>
    </div>

  </div>
</template>

<style scoped></style>