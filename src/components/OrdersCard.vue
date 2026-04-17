<script setup lang="ts">
import type { Order } from '@/types/types'

const props = defineProps<{order: Order}>()

const emit = defineEmits([
  'select',
  'procesar',
  'cancelar',
  'completar'
])

function select(){
    emit('select');
}

function procesar(){
  emit('procesar');
}

function cancelar(){
  emit('cancelar');
}

function completar(){
  emit('completar');
}
</script>

<template>
  <div @click="select" class="cursor-pointer group h-full"> 
    <div class="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col h-full overflow-hidden">    
      
      <div class="p-3 sm:p-4 border-b border-gray-100 bg-gray-50/50">
        <div class="flex justify-between items-start mb-1">
          <span class="text-[10px] sm:text-xs font-black text-blue-600 uppercase tracking-wider"> Pedido #{{ props.order.id }} </span>          
        </div>
        
        <h2 class="font-bold text-gray-800 text-sm sm:text-base line-clamp-1" :title="props.order.customer?.name || 'Venta General'">
          {{ props.order.customer?.name || 'Venta General' }}
        </h2>
      </div>
    
      <div class="p-3 sm:p-4 flex-grow space-y-2 text-xs sm:text-[13px] text-gray-600">
        <p class="flex justify-between items-center gap-2">
          <span class="text-gray-400 font-medium whitespace-nowrap">Fecha límite:</span> 
          <span class="font-bold text-gray-700 text-right">{{ props.order.scheduled_time}}</span>
        </p>
        <p class="flex justify-between items-center gap-2">
          <span class="text-gray-400 font-medium whitespace-nowrap">Método de pago:</span>
          <span class="text-gray-700 font-medium text-right truncate">{{ props.order.payment?.method_name || 'N/A' }}</span>
        </p>
      </div>
      
      <div class="p-3 bg-gray-50/80 border-t border-gray-100 flex flex-col min-[350px]:flex-row gap-2">      
        
        <div v-if="props.order.state === 'pending'" class="flex flex-col min-[350px]:flex-row w-full gap-2">        
          <button @click.stop="procesar" class="flex-[2] bg-amber-500 hover:bg-amber-600 text-white py-2.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs transition-colors shadow-sm">
            PROCESAR        
          </button>
          <button @click.stop="cancelar" class="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-gray-200 hover:border-rose-200 py-2.5 sm:py-2 rounded-xl font-bold text-[10px] transition-all">
            CANCELAR
          </button>
        </div>
      
        <div v-else-if="props.order.state === 'ready'" class="flex flex-col min-[350px]:flex-row w-full gap-2">
          <button @click.stop="completar" class="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 sm:py-2 rounded-xl font-bold text-[11px] sm:text-xs transition-colors shadow-sm">
            COMPLETAR
          </button>
          <button @click.stop="cancelar" class="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-gray-200 hover:border-rose-200 py-2.5 sm:py-2 rounded-xl font-bold text-[10px] transition-all">
            CANCELAR
          </button>
        </div>

      </div>
    </div>
  </div>
</template>