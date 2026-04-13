<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import router from '@/router'

const authStore = useAuthStore()
const menuOpen = ref(false)

function logOut() {
  authStore.logOut()
  router.push('/login')
}

const linkClass =
  'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-white/40 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap'

const activeClass = 'text-white bg-white/20 shadow-inner'
</script>

<template>
  <nav class="w-full bg-[#375ab4] shadow-md">
    <div class="px-6">
      <div class="flex items-center h-14">
        <!-- IZQUIERDA -->
        <div class="flex items-center gap-6">
          <a class="text-white font-bold text-base flex items-center gap-2 shrink-0">
            <i class="fas fa-clinic-medical"></i>
            Farmacia Dr. Perez
          </a>

          <div class="hidden lg:flex items-center gap-0.5">
            <RouterLink to="/dashboard/pos" :class="linkClass" :active-class="activeClass">
              <i class="fas fa-cash-register text-xs"></i> Punto de Venta
            </RouterLink>

            <RouterLink to="/dashboard/pickup" :class="linkClass" :active-class="activeClass">
              <i class="fa-solid fa-envelope text-xs"></i> Pick Up
            </RouterLink>

            <RouterLink
              v-if="authStore.user?.role === 'Administrador'"
              to="/dashboard/inventory"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fas fa-boxes text-xs"></i> Inventario
            </RouterLink>

            <RouterLink to="/dashboard/alerts" :class="linkClass" :active-class="activeClass">
              <i class="fas fa-exclamation-triangle text-xs"></i> Alertas
            </RouterLink>

            <RouterLink
              v-if="authStore.user?.role === 'Administrador'"
              to="/dashboard/reports"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fa-solid fa-chart-bar text-xs"></i> Reportes
            </RouterLink>

            <RouterLink
              v-if="authStore.user?.role === 'Administrador'"
              to="/dashboard/audits"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fa-solid fa-eye-slash text-xs"></i> Auditorias
            </RouterLink>

            <RouterLink
              v-if="authStore.user?.role === 'Administrador'"
              to="/dashboard/users"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fa-solid fa-user text-xs"></i> Usuarios
            </RouterLink>
          </div>
        </div>

        <!-- DERECHA -->
        <div class="hidden lg:flex items-center gap-4 ml-auto">
          <div class="flex items-center gap-2 pr-4 border-r border-white/10">
            <i class="fa-solid fa-user text-white/40 text-xs"></i>

            <div class="leading-tight text-right">
              <p class="text-white/40 text-[10px] uppercase tracking-wide">Usuario</p>
              <p
                v-if="authStore.user"
                class="text-white font-medium text-sm truncate max-w-[120px]"
              >
                {{ authStore.user.name }}
              </p>
            </div>
          </div>

          <button
            @click="logOut"
            class="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded border border-white/10 flex items-center gap-1.5 transition-colors"
          >
            <i class="fas fa-sign-out-alt text-xs"></i> Salir
          </button>
        </div>

        <!-- BOTÓN MÓVIL -->
        <button class="lg:hidden text-white ml-auto" @click="menuOpen = !menuOpen">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              v-if="!menuOpen"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
            <path
              v-else
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- MÓVIL -->
    <div v-show="menuOpen" class="lg:hidden border-t border-white/10 px-4 pb-4">
      <div class="flex flex-col gap-1 pt-2">
        <RouterLink
          to="/pos"
          :class="linkClass"
          :active-class="activeClass"
          @click="menuOpen = false"
        >
          <i class="fas fa-cash-register text-xs w-4"></i> Punto de Venta
        </RouterLink>

        <RouterLink
          to="/pickup"
          :class="linkClass"
          :active-class="activeClass"
          @click="menuOpen = false"
        >
          <i class="fa-solid fa-envelope text-xs w-4"></i> Pick Up
        </RouterLink>

        <RouterLink
          to="/inventory"
          :class="linkClass"
          :active-class="activeClass"
          @click="menuOpen = false"
        >
          <i class="fas fa-boxes text-xs w-4"></i> Inventario
        </RouterLink>

        <RouterLink
          to="/alerts"
          :class="linkClass"
          :active-class="activeClass"
          @click="menuOpen = false"
        >
          <i class="fas fa-exclamation-triangle text-xs w-4"></i> Alertas
        </RouterLink>

        <RouterLink
          to="/reports"
          :class="linkClass"
          :active-class="activeClass"
          @click="menuOpen = false"
        >
          <i class="fa-solid fa-chart-bar text-xs w-4"></i> Reportes
        </RouterLink>

        <RouterLink
          to="/audits"
          :class="linkClass"
          :active-class="activeClass"
          @click="menuOpen = false"
        >
          <i class="fa-solid fa-eye-slash text-xs w-4"></i> Auditorias
        </RouterLink>

        <RouterLink
          to="/users"
          :class="linkClass"
          :active-class="activeClass"
          @click="menuOpen = false"
        >
          <i class="fa-solid fa-user text-xs w-4"></i> Usuarios
        </RouterLink>

        <div class="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
          <div class="flex items-center gap-2">
            <div>
              <p class="text-white/40 text-[10px] uppercase">Usuario</p>
              <p
                v-if="authStore.user"
                class="text-white font-medium text-sm truncate max-w-[120px]"
              >
                {{ authStore.user.name }}
              </p>
            </div>
          </div>

          <button
            @click="logOut"
            class="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded border border-white/10 flex items-center gap-1.5"
          >
            <i class="fas fa-sign-out-alt text-xs"></i> Salir
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>
