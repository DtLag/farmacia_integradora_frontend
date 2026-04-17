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
  <div v-if="props.order" class="bg-white rounded-2xl overflow-hidden animate-in fade-in duration-300 shadow-sm border border-gray-200 h-full flex flex-col max-h-[80vh] lg:max-h-[calc(100vh-10rem)]">
    
    <div class="bg-[#1a2b4b] p-4 sm:p-5 text-white shrink-0">
      <h2 class="text-base sm:text-lg font-bold flex items-center gap-2">
        <i class="fas fa-file-invoice"></i> Detalles del Pedido #{{ props.order.id }}
      </h2>
    </div>

    <div class="p-4 sm:p-5 flex-grow flex flex-col overflow-hidden space-y-5">
      <div class="grid gap-4 text-sm sm:text-base shrink-0 bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <p class="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider">Cliente</p>
          <p class="font-semibold text-gray-800">{{ props.order.customer?.name }}</p>
        </div>

        <div>
          <p class="text-[10px] sm:text-xs uppercase font-bold text-gray-400 tracking-wider">Empleado encargado</p>
          <p class="text-gray-700 font-medium">{{ props.order.employee?.name }} {{ props.order.employee?.last_name }}</p>
        </div>

        <div class="pt-2 border-t border-gray-200/60">
          <p class="text-gray-500 text-xs sm:text-sm mb-1">
            <span class="font-medium">Registro:</span> {{ props.order.register_date_time }}
          </p>
          <p class="text-rose-600 font-bold text-xs sm:text-sm">
            <span>Límite:</span> {{ props.order.scheduled_time }}
          </p>
        </div>
      </div>

      <div class="flex flex-col flex-grow overflow-hidden">
        <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-200 shrink-0">
          <h3 class="font-bold text-gray-800 text-sm sm:text-base">Productos</h3>
          <span class="text-xs sm:text-sm font-semibold text-gray-400">Cant.</span>
        </div>
        
        <ul class="divide-y divide-gray-100 overflow-y-auto flex-grow pr-1">
          <li v-for="detail in props.order.order_details" :key="detail.id" class="py-3">
            <div class="flex justify-between items-start gap-2">
              <div class="pr-2 min-w-0">
                <p class="font-bold text-gray-800 text-sm sm:text-base truncate" :title="detail.product.name"> {{ detail.product.name }} </p>
                <p class="text-[10px] sm:text-xs text-gray-500 italic truncate"> {{ detail.product.presentation }} </p>
              </div>
              <div class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs sm:text-sm font-bold shrink-0">
                x{{ detail.amount }}
              </div>
            </div>
            <div class="flex justify-between items-center mt-2 text-xs sm:text-sm">
              <span class="text-gray-500"> ${{ detail.unit_price }} c/u </span>
              <span class="text-gray-800 font-bold"> ${{ detail.subtotal }} </span>
            </div>
          </li>
        </ul>
      </div>

      <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shrink-0">
        <div class="flex justify-between items-center mb-2">
          <span class="text-[10px] sm:text-xs text-blue-800 font-bold uppercase tracking-wider">Método de Pago</span>
          <span class="text-[10px] sm:text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold">
            {{ props.order.payment?.method_name || 'N/A' }}
          </span>
        </div>
        <div class="flex justify-between items-center mt-3 pt-3 border-t border-blue-200/60">
          <span class="font-black text-blue-900 text-base sm:text-lg tracking-tight">TOTAL</span>
          <span class="text-2xl sm:text-3xl font-black text-[#0B369E] tracking-tighter"> ${{ total?.toFixed(2) }} </span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="h-[300px] lg:h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-white rounded-2xl border border-dashed border-gray-300">
    <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
      <i class="fas fa-mouse-pointer text-2xl text-gray-300"></i>
    </div>
    <p class="text-gray-500 font-medium text-sm sm:text-base">Selecciona un pedido de la lista para ver sus detalles</p>
  </div>
</template>