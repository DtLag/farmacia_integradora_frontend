<script setup lang="ts">
import type { Audits } from '@/types/types';

defineProps<{audits: Audits}>();

function calcularHora(fecha: string){
  const date = new Date(fecha.replace(' ', 'T'));
  const hora = date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
  });
  return hora;
}

function sacarFecha(time: string){
  const date = new Date(time.replace(' ', 'T'));
  const fecha = date.toLocaleDateString('es-MX');
  return fecha;
}
</script>

<template>
  <tr class="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
    <td class="px-4 sm:px-6 py-3 sm:py-4 font-bold text-gray-900 whitespace-nowrap">
      #{{ audits?.id }}
    </td>

    <td class="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 whitespace-nowrap">
      <i class="far fa-calendar-alt mr-1 text-gray-400"></i> {{ sacarFecha(audits?.date_time) }}
    </td>

    <td class="px-4 sm:px-6 py-3 sm:py-4 text-gray-500 font-mono text-xs sm:text-sm whitespace-nowrap">
      {{ calcularHora(audits?.date_time) }}
    </td>

    <td class="px-4 sm:px-6 py-3 sm:py-4 font-medium text-blue-700 whitespace-nowrap">
      <i class="fas fa-user-circle mr-1 text-blue-300"></i> {{ audits?.user?.name ? audits.user.name : 'Sistema' }} 
    </td>

    <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
      <span class="px-2.5 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded-md text-[10px] font-bold uppercase tracking-wider">
        {{ audits?.user?.role?.name ? audits?.user.role.name : 'N/A' }}
      </span>
    </td>

    <td class="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
      <span class="text-xs font-bold text-gray-700 uppercase tracking-wide bg-gray-50 px-2 py-1 rounded">
        {{ audits?.affected_module }}
      </span>
    </td>

    <td class="px-4 sm:px-6 py-3 sm:py-4 font-bold whitespace-nowrap" :class="audits?.action_performed === 'delete' ? 'text-rose-600' : (audits?.action_performed === 'update' ? 'text-amber-600' : 'text-emerald-600')">
      {{ audits?.action_performed }}
    </td>

    <td class="px-4 sm:px-6 py-3 sm:py-4 text-xs text-gray-500 max-w-xs truncate" :title="audits?.detail">
      {{ audits?.detail }}
    </td>
  </tr>
</template>