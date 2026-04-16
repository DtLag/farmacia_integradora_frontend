<script setup lang="ts">
import OrdersCard from '@/components/OrdersCard.vue';
import OrderDetailsCard from '@/components/OrderDetailsCard.vue';
import OrderActions from '@/components/OrderActions.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import type { Order } from '@/types/types';
import { useOrdersStore } from '@/stores/order';
import { createEchoInstance } from '@/utils/echo'; 
import { useAuthStore } from '@/stores/auth'; 

const orderStore = useOrdersStore();
const authStore = useAuthStore();
let echo: any = null; 

onMounted(() => {
  orderStore.getOrders();
  
  if (authStore.token) {
    echo = createEchoInstance(authStore.token);

    echo.private('staff.orders')
      .listen('.NewPickUpOrder', (e: any) => {
          console.log('🔔 ¡Nuevo pedido recibido!', e.orderData);
          if (orderStore.currentState === 'pending') {
              orderStore.getOrders('pending');
          }
      })
      .listen('.OrderStatusChanged', (e: any) => {
          console.log('🔄 Estado de un pedido actualizado', e.orderData);
          orderStore.getOrders(orderStore.currentState);
      });
  } else {
    console.warn("No hay token disponible para conectar a WebSockets");
  }
});

onUnmounted(() => {
  if (echo) {
    echo.leaveChannel('private-staff.orders');
  }
});

function selectOption(order: Order, state: 'procesar' | 'cancelar' | 'completar'){
  orderStore.selectOrder(order)
  orderStore.openModal(state)
}
</script>

<template>
  <div class="p-6 flex gap-6" >
    <div class="w-2/3">
      <div class="flex gap-3 mb-6 items-center">
        <button :class="['px-4 py-1.5 rounded-lg font-semibold transition-all border', orderStore.currentState === 'pending' ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50']" @click="orderStore.getOrders('pending')"> Pendientes </button>
        <button :class="['px-4 py-1.5 rounded-lg font-semibold transition-all border', orderStore.currentState === 'ready' ? 'bg-blue-100 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50']" @click="orderStore.getOrders('ready')"> Listos </button>
        <button :class="['px-4 py-1.5 rounded-lg font-semibold transition-all border', orderStore.currentState === 'completed' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50']" @click="orderStore.getOrders('completed')"> Completados </button>
        <button :class="['px-4 py-1.5 rounded-lg font-semibold transition-all border', orderStore.currentState === 'canceled' ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50']" @click="orderStore.getOrders('canceled')"> Cancelados</button>
  
        <button class="ml-auto flex items-center gap-2 px-4 py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-transform active:scale-95 shadow-sm text-sm" @click="orderStore.getOrders(orderStore.currentState)">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refrescar
        </button>
      </div>
    
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
  @cerrar="orderStore.closeModal()"
  @process="orderStore.startProcessOrder()" 
  @cancel="orderStore.cancelOrder()" 
  @complete="orderStore.completeOrder()"/>

</template>

<style scoped>
</style>