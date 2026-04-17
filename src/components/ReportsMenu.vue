<script setup lang="ts">
import { ref } from 'vue'

const active = ref('Ventas')
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-[calc(100vh-3.5rem)] bg-gray-50/50 w-full overflow-hidden">
    
    <aside class="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-4 sm:p-5 shrink-0 lg:h-[calc(100vh-3.5rem)] lg:sticky lg:top-0">
      
      <div class="mb-4 hidden lg:block">
        <h2 class="text-lg font-bold text-gray-800">Centro de Reportes</h2>
        <p class="text-xs text-gray-500 mt-1">Selecciona una categoría</p>
      </div>

      <nav class="flex lg:flex-col gap-2 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
        <RouterLink 
          :to="{ name: 'salesReport' }" 
          class="px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal border border-transparent flex items-center gap-2" 
          active-class="bg-blue-50 text-blue-700 border-blue-100 shadow-sm"
          :class="$route.name !== 'salesReport' ? 'text-gray-500 hover:bg-gray-100' : ''"
        >
          <i class="fas fa-chart-line"></i> Ventas
        </RouterLink>

        <RouterLink 
          :to="{ name: 'inventoryReport' }" 
          class="px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal border border-transparent flex items-center gap-2" 
          active-class="bg-blue-50 text-blue-700 border-blue-100 shadow-sm"
          :class="$route.name !== 'inventoryReport' ? 'text-gray-500 hover:bg-gray-100' : ''"
        >
          <i class="fas fa-boxes"></i> Inventario
        </RouterLink>

        <RouterLink 
          :to="{ name: 'usersReport' }" 
          class="px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap lg:whitespace-normal border border-transparent flex items-center gap-2" 
          active-class="bg-blue-50 text-blue-700 border-blue-100 shadow-sm"
          :class="$route.name !== 'usersReport' ? 'text-gray-500 hover:bg-gray-100' : ''"
        >
          <i class="fas fa-users"></i> Usuarios
        </RouterLink>
      </nav>
    </aside>

    <main class="flex-1 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>