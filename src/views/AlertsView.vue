<script setup lang="ts">
import AlertsCard from '@/components/AlertsCard.vue';
import { useApi } from '@/composables/useApiFetch.ts'
import { computed, onMounted, onUnmounted } from 'vue';
import { createEchoInstance } from '@/utils/echo'; 
import { useAuthStore } from '@/stores/auth'; 

const authStore = useAuthStore();
let echo: any = null;

const {data: stock, execute: reStock} = useApi(`/alert/stock`).get().json();
const {data: expire, execute: reExpire} = useApi(`/alert/expire`).get().json();
const {data: expired, execute: reExpired} = useApi(`/alert/expired`).get().json();

const stockData = computed(() => stock.value?.data || []);
const expireData = computed(() => expire.value?.data || []);
const expiredData = computed(() => expired.value?.data || []);

function refresh(){
  reStock();
  reExpire();
  reExpired();
}

onMounted(() => {
  refresh();

  if (authStore.token) {
    echo = createEchoInstance(authStore.token);

    echo.private('staff.alerts')
      .listen('.LowStock', (e: any) => {
          console.warn('⚠️ ¡Alerta de Stock Recibida!', e.alertData);
          refresh(); 
      });
  }
});

onUnmounted(() => {
  if (echo) {
    echo.leaveChannel('private-staff.alerts');
  }
});
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50/50">

    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">  
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-2"> 
          <i class="fas fa-exclamation-triangle text-amber-500"></i> Monitor de Alertas 
        </h2>
        <p class="text-sm sm:text-base text-gray-500 mt-1">Supervisa inventario bajo o productos por caducar.</p>
      </div>

      <button @click="refresh" class="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0B369E] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-800 active:scale-95 transition-all duration-200">
        <i class="fas fa-sync-alt"></i> Actualizar
      </button>
    </div>

    <AlertsCard :stock="stockData" :expire="expireData" :expired="expiredData" />

  </div>
</template>