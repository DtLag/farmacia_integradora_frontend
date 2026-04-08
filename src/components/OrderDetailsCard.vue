<script setup lang="ts">
import type { Order } from '@/types/types'

const props = defineProps<{ order: Order | null }>()
</script>

<template>
  <div v-if="props.order">  
    <h2 class="font-bold text-lg mb-2">Detalles de la orden #{{ props.order.id }}</h2>
    <p><strong>Cliente:</strong> {{ props.order.customer?.name }}</p>
    <p><strong>Empleado encargado:</strong> {{ props.order.employee?.name }} {{ props.order.employee.last_name }}</p>
    <p><strong>Fecha registro:</strong> {{ props.order.register_date_time }}</p>
    <p><strong>Fecha máxima:</strong> {{ props.order.scheduled_time }}</p>
    <p><strong>Método de pago:</strong> {{ props.order.payment?.method_name || 'Cancelado' }}</p>

    <h3 class="mt-4 font-bold text-md mb-2">Productos:</h3>
    
    <ul>
      <li v-for="detail in props.order.order_details" :key="detail.id" class="border-b py-2">
        <p><strong>Producto:</strong> {{ detail.product.name }} ({{ detail.product.presentation }})</p>
        <p><strong>Cantidad:</strong> {{ detail.amount }}</p>
        <p><strong>Precio unitario:</strong> ${{ detail.unit_price }}</p>
        <p><strong>Subtotal:</strong> ${{ detail.subtotal }}</p>
      </li>
    </ul>

    
  </div>
  <div v-else>
    <p>Selecciona un pedido para ver los detalles</p>
  </div>
</template>