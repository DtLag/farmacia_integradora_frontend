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
  <tr class="border-t hover:bg-gray-50">
    <td class="px-4 py-3 font-medium text-gray-700">
      {{ audits?.id }}
    </td>

    <td class="px-4 py-3">
      {{sacarFecha(audits?.date_time)}}
    </td>

    <td class="px-4 py-3">
      {{calcularHora(audits?.date_time)}}
    </td>

    <td class="px-4 py-3">
       {{audits?.user?.name ? audits.user.name : 'N/A'}} 
    </td>

    <td class="px-4 py-3">
      {{ audits?.user?.role?.name ? audits?.user.role.name : 'N/A' }}
    </td>

    <td class="px-4 py-3">
      {{ audits?.affected_module }}
    </td>

    <td class="px-4 py-3">
      {{ audits?.action_performed }}
    </td>

    <td class="px-4 py-3">
      {{ audits?.detail }}
    </td>
  </tr>
</template>