<script setup lang="ts">
import { ref } from 'vue'

const active = ref('Ventas')
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="nav-item" :class="{ active: active === 'Ventas' }" @click="active = 'Ventas'">
        <RouterLink to="/reports/sales" class="link">Ventas</RouterLink>
      </div>

      <div
        class="nav-item"
        :class="{ active: active === 'Inventario' }"
        @click="active = 'Inventario'"
      >
        <RouterLink to="/reports/inventory" class="link">Inventario</RouterLink>
      </div>

      <div class="nav-item" :class="{ active: active === 'Usuario' }" @click="active = 'Usuario'">
        <RouterLink to="/reports/users" class="link">Usuarios</RouterLink>
      </div>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background: #dce8f8;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  height: 100vh;
}

.nav-item {
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  color: #4a6fa5;
  transition: all 0.2s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.nav-item.active {
  background: white;
  color: #1e3a6e;
  font-weight: 600;
}
.layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 250px;
  background: #dce8f8;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content {
  flex: 1; /* ocupa todo lo que sobra */
  padding: 20px;
}
</style>
