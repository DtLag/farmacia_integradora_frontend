<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import router from '@/router'
const authStore = useAuthStore()

function logOut() {
  authStore.logOut()
  router.push('/login')
}
</script>

<template>
  <nav
    class="navbar navbar-expand-lg navbar-dark bg-primary mb-4"
    style="background-color: #375ab4ff !important"
  >
    <div class="container-fluid">
      <!-- Marca / Logo -->
      <a class="navbar-brand fw-bold">
        <i class="fas fa-clinic-medical me-2"></i>Farmacia Dr. Perez
      </a>

      <!-- Botón Hamburguesa (Móvil) -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Menú Colapsable -->
      <div class="collapse navbar-collapse" id="mainNavbar">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <!-- 1. Enlace a POS -->
          <li class="nav-item mx-2">
            <RouterLink to="/pos" class="nav-link" active-class="active">
              <i class="fas fa-cash-register me-1"></i>
              Punto de Venta
            </RouterLink>
          </li>

          <!-- 2. Enlace a Inventario (Activo también en sub-vistas como Ajustes) -->
          <li class="nav-item mx-2">
            <RouterLink to="/inventory" class="nav-link" active-class="active">
              <i class="fas fa-boxes me-1"></i> Inventario
            </RouterLink>
          </li>

          <!-- 3. Enlace a Alertas -->
          <li class="nav-item mx-2">
            <RouterLink to="/inventory" class="nav-link" active-class="active">
              <i class="fas fa-exclamation-triangle me-1"></i> Alertas
            </RouterLink>
          </li>

          <!-- 4. Reportes -->
          <li class="nav-item mx-2">
            <RouterLink to="/reports" class="nav-link" active-class="active">
              <i class="fa-solid fa-chart-bar"></i>
              Reportes
            </RouterLink>
          </li>

          <!-- 5. Auditorias -->
          <li class="nav-item mx-2">
            <RouterLink to="/audits" class="nav-link" active-class="active">
              <i class="fa-solid fa-eye-slash"></i> Auditorias
            </RouterLink>
          </li>

          <!-- 6. Usuarios -->
          <li class="nav-item mx-2">
            <RouterLink to="/users" class="nav-link" active-class="active">
              <i class="fa-solid fa-user"></i> Usuarios
            </RouterLink>
          </li>
        </ul>

        <!-- Sección de Usuario -->
        <div class="d-flex align-items-center text-white">
          <div class="me-3 text-end d-none d-lg-block">
            <small class="d-block text-white-50" style="line-height: 1">Usuario</small>
            <span class="fw-bold">{{authStore.user.name}}</span>
          </div>
          <a @click="logOut" class="btn btn-sm btn-light text-primary fw-bold">
            <i class="fas fa-sign-out-alt"></i> Salir
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<style scoped></style>
