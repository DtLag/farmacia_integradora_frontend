<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import ClientSearchBar from './ClientSearchBar.vue'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const menuOpen = ref(false)

function logOut() {
  authStore.logOut()
  router.push('/login')
}

function closeMenu() {
  menuOpen.value = false
}

const emit = defineEmits(['onSearch'])
</script>

<template>
  <nav class="w-full bg-[#0B369E] shadow-md sticky top-0 z-50">
    <div class="px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-between h-16">
      
      <RouterLink to="/" @click="closeMenu" class="text-white font-bold text-xl flex items-center gap-2">
        <i class="fas fa-clinic-medical text-blue-300"></i> Farmacia
      </RouterLink>

      <div class="hidden md:block flex-1 max-w-lg mx-8">
        <ClientSearchBar @search="(q) => emit('onSearch', q)" />
      </div>

      <div class="flex items-center gap-4 sm:gap-6">
        
        <RouterLink to="/customer/cart" @click="closeMenu" class="relative text-white hover:text-blue-200 transition">
          <i class="fas fa-shopping-cart text-xl"></i>
          <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {{ cartStore.totalItems }}
          </span>
        </RouterLink>

        <div class="hidden md:flex items-center gap-6">
          <RouterLink to="/customer/products" class="text-sm font-medium text-white hover:text-blue-200 transition">
            Productos
          </RouterLink>

          <template v-if="authStore.isAuthenticated">
            <div class="flex items-center gap-4 border-l border-blue-700 pl-4">
              <RouterLink to="/customer/my-orders" class="text-sm font-medium text-white hover:text-blue-200 transition">
                Mis Pedidos
              </RouterLink>
              <RouterLink to="/profile" class="text-sm font-medium text-white hover:text-blue-200 transition">
                {{ authStore.user?.name }}
              </RouterLink>
              <button @click="logOut" class="text-xs text-red-300 hover:text-red-100 bg-red-900/30 hover:bg-red-900/50 px-3 py-1.5 rounded transition font-bold">
                Salir
              </button>
            </div>
          </template>

          <template v-else>
            <div class="flex items-center gap-3 border-l border-blue-700 pl-4">
              <RouterLink to="/customer/login" class="text-sm font-medium text-white hover:text-blue-200 transition">
                Ingresar
              </RouterLink>
            </div>
          </template>
        </div>

        <button 
          @click="menuOpen = !menuOpen" 
          class="md:hidden text-white hover:text-blue-200 focus:outline-none p-1"
        >
          <i class="fas text-2xl" :class="menuOpen ? 'fa-times' : 'fa-bars'"></i>
        </button>

      </div>
    </div>

    <div 
      v-show="menuOpen" 
      class="md:hidden bg-[#0a2c82] border-t border-blue-800 absolute w-full shadow-lg"
    >
      <div class="px-4 pt-3 pb-5 space-y-3">
        
        <div class="mb-4">
          <ClientSearchBar @search="(q) => { emit('onSearch', q); closeMenu(); }" />
        </div>

        <RouterLink to="/customer/products" @click="closeMenu" class="block text-white font-medium hover:bg-blue-800/50 px-3 py-2 rounded-lg transition">
          <i class="fas fa-pills w-6 text-blue-300"></i> Productos
        </RouterLink>

        <template v-if="authStore.isAuthenticated">
          <RouterLink to="/customer/my-orders" @click="closeMenu" class="block text-white font-medium hover:bg-blue-800/50 px-3 py-2 rounded-lg transition">
            <i class="fas fa-box-open w-6 text-blue-300"></i> Mis Pedidos
          </RouterLink>
          
          <RouterLink to="/profile" @click="closeMenu" class="block text-white font-medium hover:bg-blue-800/50 px-3 py-2 rounded-lg transition">
            <i class="fas fa-user w-6 text-blue-300"></i> Perfil ({{ authStore.user?.name }})
          </RouterLink>
          
          <button @click="() => { logOut(); closeMenu(); }" class="w-full text-left text-red-300 font-medium hover:bg-red-900/30 px-3 py-2 rounded-lg transition">
            <i class="fas fa-sign-out-alt w-6"></i> Salir
          </button>
        </template>

        <template v-else>
          <RouterLink to="/customer/login" @click="closeMenu" class="block text-white font-medium hover:bg-blue-800/50 px-3 py-2 rounded-lg transition">
            <i class="fas fa-sign-in-alt w-6 text-blue-300"></i> Ingresar
          </RouterLink>
        </template>
        
      </div>
    </div>
  </nav>
</template>