<script setup lang="ts">
import type { Order } from '@/types/types'
import { computed } from 'vue';

const props = defineProps<{ order: Order | null }>()

const total = computed(() => {
  return props.order?.order_details.reduce((sumar, detail) => {
    return sumar + Number(detail.subtotal);
  }, 0);
})
</script>

<template>
  <div v-if="props.order" class="bg-slate-100 rounded-xl overflow-hidden animate-in fade-in duration-300 shadow-md">
    <div class="bg-slate-800 p-4 text-white">
      <h2 class="text-lg font-bold">Detalles del Pedido #{{ props.order.id }}</h2>
    </div>

    <div class="p-5 space-y-6">
      <div class="grid gap-4 text-base">
        <div class="flex items-start gap-3">
          <div>
            <p class="text-xs uppercase font-bold text-slate-500">Cliente</p>
            <p class="font-semibold text-slate-800 text-base">
              {{ props.order.customer?.name }}
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div>
            <p class="text-xs uppercase font-bold text-slate-500">Empleado encargado</p>
            <p class="text-slate-700 text-base font-medium">
              {{ props.order.employee?.name }} {{ props.order.employee?.last_name }}
            </p>
          </div>
        </div>

        <div class="flex items-start gap-3">
          <div>
            <p class="text-slate-600 text-sm">
              Fecha de registro: {{ props.order.register_date_time }}
            </p>
            <p class="text-rose-600 font-semibold text-sm">
              Fecha de expiración: {{ props.order.scheduled_time }}
            </p>
          </div>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-3 border-b pb-2">
          <h3 class="font-bold text-slate-800">Productos</h3>
          <span class="text-sm font-semibold text-slate-500">Cantidad</span>
        </div>
        
        <ul class="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
          <li v-for="detail in props.order.order_details" :key="detail.id" class="py-3 group">
            <div class="flex justify-between items-start">
              <div class="pr-2">
                <p class="font-semibold text-slate-800 text-base"> {{ detail.product.name }} </p>
                <p class="text-sm text-slate-500 italic"> {{ detail.product.presentation }} </p>
              </div>
              <p class="font-bold text-slate-900 text-base whitespace-nowrap"> x{{ detail.amount }} </p>
            </div>
            <div class="flex justify-between mt-2 text-sm">
              <span class="text-slate-600"> Precio unitario: ${{ detail.unit_price }} </span>
            </div>
            <div class="flex justify-between mt-1 text-sm">
              <span class="text-slate-700 font-medium"> Subtotal: ${{ detail.subtotal }} </span>
            </div>
          </li>
        </ul>
      </div>

      <div class="bg-blue-100 p-4 rounded-xl border border-blue-400 shadow-s">
        <div class="flex justify-between items-center mb-1">
          <span class="text-xs text-blue-700 font-bold uppercase">Método de Pago</span>
          <span class="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full font-bold">
            {{ props.order.payment?.method_name || 'N/A' }}
          </span>
        </div>
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-blue-200">
          <span class="font-bold text-blue-900 text-lg tracking-tight">TOTAL</span>
          <span class="text-2xl font-black text-blue-900 font-mono tracking-tighter"> ${{ total}} </span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="h-full flex flex-col items-center justify-center p-8 text-center  rounded-xl opacity-60">
    <p class="text-slate-500 font-medium">Selecciona un pedido para ver sus detalles</p>
  </div>
</template>

<style scoped></style>