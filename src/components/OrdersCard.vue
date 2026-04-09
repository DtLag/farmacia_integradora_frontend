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
  <div @click="select" class="cursor-pointer group"> 
    <div :class="'bg-white rounded-2xl border transition-all duration-200 flex flex-col h-full'">    
      <div class="p-4 border-b border-slate-50">
        <div class="flex justify-between items-start mb-1">
          <span class="text-[10px] font-black text-slate-400 uppercase tracking-wider"> No. Pedido: #{{ props.order.id }} </span>          
        </div>
        
        <h2 class="font-bold text-slate-800 text-sm line-clamp-1">
          {{ props.order.customer?.name || 'Venta General' }}
        </h2>
      </div>
    
      <div class="p-4 flex-grow space-y-2 text-[13px] text-slate-600">
        <p class="flex justify-between">
          <span class="text-slate-400 font-medium">Fecha límite:</span> 
          <span class="font-bold text-slate-700">{{ props.order.scheduled_time}}</span>
        </p>
        <p class="flex justify-between">
          <span class="text-slate-400 font-medium">Método de pago:</span>
          <span class="text-slate-700">{{ props.order.payment?.method_name || 'N/A' }}</span>
        </p>
      </div>
      
      <div class="p-3 bg-slate-50/80 border-t border-slate-100 flex gap-2">      
        <div v-if="props.order.state === 'pending'" class="flex w-full gap-2">        
          <button @click.stop="procesar" class="flex-[2] bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm">
            PROCESAR        
          </button>
        
          <button @click.stop="cancelar" class="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 hover:border-rose-200 py-2.5 rounded-xl font-bold text-[10px] transition-all">
            CANCELAR
          </button>
        </div>
      
        <div v-else-if="props.order.state === 'ready'" class="flex w-full gap-2">
          <button @click.stop="completar" class="flex-[2] bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-bold text-xs transition-colors shadow-sm">
            COMPLETAR
          </button>
          <button @click.stop="cancelar" class="flex-1 bg-white hover:bg-rose-50 text-rose-500 border border-slate-200 py-2.5 rounded-xl font-bold text-[10px]">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>