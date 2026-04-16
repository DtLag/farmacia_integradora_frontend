<script setup lang="ts">
import AlertsCard from '@/components/AlertsCard.vue';
import { useApi } from '@/composables/useApiFetch.ts'
import { computed, onMounted, onUnmounted } from 'vue';
import { createEchoInstance } from '@/utils/echo'; // Tu utilidad de WebSockets
import { useAuthStore } from '@/stores/auth'; // Necesitamos el token del empleado

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
  // Siempre limpiar el canal al salir de la vista
  if (echo) {
    echo.leaveChannel('private-staff.alerts');
  }
});
</script>

<template>
  <div class="p-6">

    <div class="flex justify-between items-center mb-6">  
      <div>
        <h2 class="text-2xl font-semibold text-gray-800"> ⚠️ Monitor de Alertas </h2>
      </div>

      <button @click="refresh" class="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-blue-700 active:scale-95 transition-all duration-200">
        🔄 Actualizar
      </button>
    </div>

    <AlertsCard :stock="stockData" :expire="expireData" :expired="expiredData" />

  </div>
</template>

<style scoped></style>