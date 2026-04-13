<script setup lang="ts">
import { ref } from 'vue'

const active = ref('Ventas')
</script>

<template>
  <div class="layout">
    <aside class="sidebar">
      <RouterLink :to="{ name: 'salesReport' }" class="nav-item link" active-class="active">
        Ventas
      </RouterLink>

      <RouterLink :to="{ name: 'inventoryReport' }" class="nav-item link" active-class="active">
        Inventario
      </RouterLink>

      <RouterLink :to="{ name: 'usersReport' }" class="nav-item link" active-class="active">
        Usuarios
      </RouterLink>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
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

.nav-item {
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  color: #4a6fa5;
  transition: all 0.2s ease;
  text-decoration: none;
  display: block;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.5);
}

.nav-item.active {
  background: white;
  color: #1e3a6e;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 20px;
}

.link {
  text-decoration: none;
}
</style>
