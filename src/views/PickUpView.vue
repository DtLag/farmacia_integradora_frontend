<script setup lang="ts">
import OrdersCard from '@/components/OrdersCard.vue';
import OrderDetailsCard from '@/components/OrderDetailsCard.vue';
import OrderActions from '@/components/OrderActions.vue';
import {useFetch} from '@vueuse/core'
import { ref, onMounted } from 'vue';
import type { Order } from '@/types/types';
import { useOrdersStore } from '@/stores/order';

const orderStore = useOrdersStore()

onMounted(() => {
  orderStore.getOrders()
})

function selectOption(order: Order, state: 'procesar' | 'cancelar' | 'completar'){
  orderStore.selectOrder(order)
  orderStore.openModal(state)
}

</script>

<template>
  <div class="bg-blue-600 text-white p-6 rounded-b-2xl shadow-md flex justify-between items-center mb-6">
    <h1 class="text-2xl font-extrabold"> Pedidos Pick-Up </h1>
  </div>

  <div class="p-6 flex gap-6" >
    <div class="w-2/3">
      <div class="flex gap-2 mb-6">
        <button class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" @click="orderStore.getOrders()">Pendientes</button>
        <button class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" @click="orderStore.getOrders('ready')">Listos</button>
        <button class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" @click="orderStore.getOrders('completed')">Completados</button>
        <button class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300" @click="orderStore.getOrders('canceled')">Cancelados</button>
      </div>
    
      <!--div v-if="isFetching">Cargando...</div-->
    
      <div class="grid grid-cols-3 gap-4">
        <OrdersCard v-for="order in orderStore.orders" :key="order.id"  :order="order"
        @select="orderStore.selectOrder(order)" 
        @procesar="selectOption(order, 'procesar')" 
        @cancelar="selectOption(order, 'cancelar')" 
        @completar="selectOption(order, 'completar')"
        />
      </div>
    </div>

    <div class="w-1/3 bg-gray-50 p-4 rounded shadow">
      <OrderDetailsCard :order="orderStore.selectedOrder"/>
    </div>

  </div>

  <OrderActions v-if="orderStore.selectedOrder && orderStore.activeModal" 
  :order="orderStore.selectedOrder" :modal="orderStore.activeModal" 
  @process="orderStore.startProcessOrder()" 
  @cancel="orderStore.cancelOrder()" 
  @complete="orderStore.completeOrder()"/>

</template>

<style scoped>
</style>