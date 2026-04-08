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
  <div @click="select" class="p-5 flex justify-between items-start border-b border-slate-50 cursor-pointer">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">    
      <div class="flex items-center gap-3">
        <div>
          <span class="text-xs font-bold text-slate-400">
            ID: #{{ props.order.id }}
          </span>
        
          <h2 class="font-bold text-slate-800">
            Cliente: {{ props.order.customer?.name  || 'Cancelado' }}
          </h2>
          <h2 class="font-bold text-slate-800">
            Empleado encargado: {{ props.order.employee?.name || 'Cancelado' }} {{ props.order.employee.last_name }}
          </h2>
        </div>
      </div>
    
      <div class="p-5 flex-grow space-y-3 text-sm text-slate-600">
      
        <p><strong>Fecha registro:</strong> {{ props.order.register_date_time }}</p>
        <p><strong>Fecha máxima para recoger:</strong> {{ props.order.scheduled_time }}</p>      
        <p><strong>Método de pago:</strong> {{ props.order.payment?.method_name || 'Cancelado' }}</p>
      </div>
      
      <div class="p-4 bg-slate-50/50 border-t border-slate-100 flex gap-2">      
        <div v-if="props.order.state === 'pending'">        
          <button @click.stop="procesar" class="flex-1 bg-amber-100 text-amber-700 py-2 rounded-lg font-bold text-xs cursor-pointer">
            PROCESAR        
          </button>
        
          <button @click.stop="cancelar" class="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg font-bold text-xs cursor-pointer">
            CANCELAR
          </button>
        </div>
      
        <div v-else-if="props.order.state === 'ready'">
          <button @click.stop="completar" class="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold text-xs cursor-pointer">
            COMPLETAR
          </button>
          <button @click.stop="cancelar" class="bg-rose-50 text-rose-600 px-3 py-2 rounded-lg font-bold text-xs cursor-pointer">
            CANCELAR
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>