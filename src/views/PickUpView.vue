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
          console.log('¡Nuevo pedido recibido!', e.order);
          if (orderStore.currentState === 'pending') {
              orderStore.getOrders('pending');
          }
      });

    echo.channel('public-orders')
      .listen('.OrderStatusChanged', (e: any) => {
          console.log('Estado de un pedido actualizado', e.order);
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
  <div class="p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-6 min-h-screen bg-gray-50/50">
    
    <div class="w-full lg:w-2/3 xl:w-3/4 flex flex-col">
      
      <div class="flex gap-2 sm:gap-3 mb-6 items-center overflow-x-auto pb-2 scrollbar-hide w-full border-b border-gray-200/60 lg:border-none">
        <button :class="['px-4 py-2 sm:py-1.5 rounded-lg font-bold text-sm transition-all border whitespace-nowrap', orderStore.currentState === 'pending' ? 'bg-amber-100 border-amber-300 text-amber-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50']" @click="orderStore.getOrders('pending')"> Pendientes </button>
        <button :class="['px-4 py-2 sm:py-1.5 rounded-lg font-bold text-sm transition-all border whitespace-nowrap', orderStore.currentState === 'ready' ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50']" @click="orderStore.getOrders('ready')"> Listos </button>
        <button :class="['px-4 py-2 sm:py-1.5 rounded-lg font-bold text-sm transition-all border whitespace-nowrap', orderStore.currentState === 'completed' ? 'bg-emerald-100 border-emerald-300 text-emerald-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50']" @click="orderStore.getOrders('completed')"> Completados </button>
        <button :class="['px-4 py-2 sm:py-1.5 rounded-lg font-bold text-sm transition-all border whitespace-nowrap', orderStore.currentState === 'canceled' ? 'bg-rose-100 border-rose-300 text-rose-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50']" @click="orderStore.getOrders('canceled')"> Cancelados</button>
  
        <button class="lg:ml-auto ml-4 flex items-center gap-2 px-4 py-2 sm:py-1.5 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-transform active:scale-95 shadow-sm text-sm font-bold whitespace-nowrap" @click="orderStore.getOrders(orderStore.currentState)">
          <i class="fas fa-sync-alt"></i> Refrescar
        </button>
      </div>
    
      <div class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
        <OrdersCard v-for="order in orderStore.orders" :key="order.id"  :order="order"
        @select="orderStore.selectOrder(order)" 
        @procesar="selectOption(order, 'procesar')" 
        @cancelar="selectOption(order, 'cancelar')" 
        @completar="selectOption(order, 'completar')"
        />
      </div>

      <div v-if="orderStore.orders.length === 0" class="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300 mt-4">
        <i class="fas fa-clipboard-list text-5xl mb-3 text-gray-300"></i>
        <p class="font-medium text-lg">No hay pedidos en esta sección</p>
      </div>
    </div>

    <div class="w-full lg:w-1/3 xl:w-1/4">
      <div class="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 lg:sticky lg:top-6 h-fit transition-all">
        <OrderDetailsCard :order="orderStore.selectedOrder"/>
      </div>
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
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>