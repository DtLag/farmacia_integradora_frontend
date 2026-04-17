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
  'flex items-center gap-2 px-3 py-2 lg:py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap font-medium lg:font-normal'

const activeClass = 'text-white bg-white/20 shadow-inner'
</script>

<template>
  <nav class="w-full bg-[#0B369E] shadow-md relative z-50">
    <div class="px-4 sm:px-6">
      <div class="flex items-center h-14 sm:h-16">
        <div class="flex items-center gap-6">
          <a class="text-white font-bold text-base sm:text-lg flex items-center gap-2 shrink-0">
            <i class="fas fa-clinic-medical text-blue-300"></i>
            Farmacia
          </a>

          <div class="hidden lg:flex items-center gap-1">
            <RouterLink to="/dashboard/pos" :class="linkClass" :active-class="activeClass">
              <i class="fas fa-cash-register text-xs w-4 text-center"></i> POS
            </RouterLink>

            <RouterLink to="/dashboard/pickup" :class="linkClass" :active-class="activeClass">
              <i class="fa-solid fa-envelope text-xs w-4 text-center"></i> Pick Up
            </RouterLink>

            <RouterLink
              v-if="authStore.user?.role === 'Administrador'"
              to="/dashboard/inventory"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fas fa-boxes text-xs w-4 text-center"></i> Inventario
            </RouterLink>

            <RouterLink to="/dashboard/alerts" :class="linkClass" :active-class="activeClass">
              <i class="fas fa-exclamation-triangle text-xs w-4 text-center"></i> Alertas
            </RouterLink>

            <RouterLink
              v-if="authStore.user?.role === 'Administrador'"
              to="/dashboard/reports"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fa-solid fa-chart-bar text-xs w-4 text-center"></i> Reportes
            </RouterLink>

            <RouterLink
              v-if="authStore.user?.role === 'Administrador'"
              to="/dashboard/audits"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fa-solid fa-eye-slash text-xs w-4 text-center"></i> Auditorias
            </RouterLink>

            <RouterLink
              v-if="authStore.user?.role === 'Administrador'"
              to="/dashboard/users"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fa-solid fa-users text-xs w-4 text-center"></i> Usuarios
            </RouterLink>

            <RouterLink
              to="/dashboard/tickets"
              :class="linkClass"
              :active-class="activeClass"
            >
              <i class="fa-solid fa-ticket text-xs w-4 text-center"></i> Tickets
            </RouterLink>
          </div>
        </div>

        <div class="hidden lg:flex items-center gap-4 ml-auto">
          <div class="flex items-center gap-3 pr-4 border-r border-white/20">
            <div class="bg-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-white/80">
              <i class="fa-solid fa-user text-xs"></i>
            </div>

            <div class="leading-tight text-left">
              <p class="text-blue-200 text-[10px] uppercase tracking-wide font-bold">{{ authStore.user?.role || 'Staff' }}</p>
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
            class="bg-red-500/20 hover:bg-red-500/40 text-red-100 text-sm px-4 py-1.5 rounded-lg border border-red-500/30 flex items-center gap-2 transition-colors font-semibold"
          >
            <i class="fas fa-sign-out-alt text-xs"></i> Salir
          </button>
        </div>

        <button class="lg:hidden text-white ml-auto p-2 rounded-lg hover:bg-white/10 transition" @click="menuOpen = !menuOpen">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

    <transition name="fade-slide">
      <div v-show="menuOpen" class="lg:hidden absolute top-full left-0 w-full bg-[#092b7c] border-t border-white/10 shadow-xl pb-4">
        <div class="px-4 py-3 flex flex-col gap-1.5">
          <RouterLink
            to="/dashboard/pos"
            :class="linkClass"
            :active-class="activeClass"
            @click="menuOpen = false"
          >
            <i class="fas fa-cash-register text-blue-300 text-base w-6 text-center"></i> Punto de Venta
          </RouterLink>

          <RouterLink
            to="/dashboard/pickup"
            :class="linkClass"
            :active-class="activeClass"
            @click="menuOpen = false"
          >
            <i class="fa-solid fa-envelope text-blue-300 text-base w-6 text-center"></i> Pick Up
          </RouterLink>

          <RouterLink
            v-if="authStore.user?.role === 'Administrador'"
            to="/dashboard/inventory"
            :class="linkClass"
            :active-class="activeClass"
            @click="menuOpen = false"
          >
            <i class="fas fa-boxes text-blue-300 text-base w-6 text-center"></i> Inventario
          </RouterLink>

          <RouterLink
            to="/dashboard/alerts"
            :class="linkClass"
            :active-class="activeClass"
            @click="menuOpen = false"
          >
            <i class="fas fa-exclamation-triangle text-blue-300 text-base w-6 text-center"></i> Alertas
          </RouterLink>

          <RouterLink
            v-if="authStore.user?.role === 'Administrador'"
            to="/dashboard/reports"
            :class="linkClass"
            :active-class="activeClass"
            @click="menuOpen = false"
          >
            <i class="fa-solid fa-chart-bar text-blue-300 text-base w-6 text-center"></i> Reportes
          </RouterLink>

          <RouterLink
            v-if="authStore.user?.role === 'Administrador'"
            to="/dashboard/audits"
            :class="linkClass"
            :active-class="activeClass"
            @click="menuOpen = false"
          >
            <i class="fa-solid fa-eye-slash text-blue-300 text-base w-6 text-center"></i> Auditorias
          </RouterLink>

          <RouterLink
            v-if="authStore.user?.role === 'Administrador'"
            to="/dashboard/users"
            :class="linkClass"
            :active-class="activeClass"
            @click="menuOpen = false"
          >
            <i class="fa-solid fa-users text-blue-300 text-base w-6 text-center"></i> Usuarios
          </RouterLink>

          <RouterLink
            to="/dashboard/tickets"
            :class="linkClass"
            :active-class="activeClass"
            @click="menuOpen = false"
          >
            <i class="fa-solid fa-ticket text-blue-300 text-base w-6 text-center"></i> Tickets
          </RouterLink>

          <div class="mt-4 pt-4 border-t border-white/10 flex flex-col gap-3">
            <div class="flex items-center gap-3 px-2">
              <div class="bg-blue-800 w-10 h-10 rounded-full flex items-center justify-center text-white/80">
                <i class="fa-solid fa-user text-sm"></i>
              </div>
              <div>
                <p class="text-blue-200 text-[10px] uppercase font-bold">{{ authStore.user?.role || 'Staff' }}</p>
                <p v-if="authStore.user" class="text-white font-medium text-base truncate max-w-[200px]">
                  {{ authStore.user.name }}
                </p>
              </div>
            </div>

            <button
              @click="logOut"
              class="w-full bg-red-500/20 hover:bg-red-500/40 text-red-100 text-base px-4 py-3 rounded-xl border border-red-500/30 flex items-center justify-center gap-2 transition-colors font-bold mt-2"
            >
              <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </transition>
  </nav>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>