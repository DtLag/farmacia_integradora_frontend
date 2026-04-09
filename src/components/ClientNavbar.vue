<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import ClientSearchBar from '@/components/ClientSearchBar.vue'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()
const menuOpen = ref(false)

function logOut() {
  authStore.logOut()
  router.push('/login')
}

const emit = defineEmits(['onSearch'])
</script>

<template>
    <nav class="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div class="px-6 max-w-7xl mx-auto flex items-center justify-between h-16">
            <RouterLink to="/" class="text-blue-600 font-bold text-xl flex items-center gap-2">
                <i class="fas fa-clinic-medical"></i> Farmacia
            </RouterLink>

            <div class="hidden md:block flex-1 max-w-lg mx-8">
                <ClientSearchBar @search="(q) => emit('onSearch', q)" />
            </div>

            <div class="flex items-center gap-6">
                <RouterLink to="/cart" class="relative text-gray-600 hover:text-blue-600 transition">
                <i class="fas fa-shopping-cart text-xl"></i>
                <span v-if="cartStore.totalItems > 0" class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {{ cartStore.totalItems }}
                </span>
                </RouterLink>

                <div v-if="authStore.isAuthenticated" class="hidden sm:flex items-center gap-3 border-l pl-4">
                    <RouterLink to="/profile" class="text-sm font-medium text-gray-700 hover:text-blue-600">
                        {{ authStore.user?.name }}
                    </RouterLink>
                    <RouterLink to="/">
                        <button @click="logOut" class="text-xs text-red-500 hover:bg-red-50 px-2 py-1 rounded transition">
                                Salir
                        </button>
                    </RouterLink>
                </div>

                <div v-else class="hidden sm:flex items-center gap-3">
                    <RouterLink to="/customer/login" class="text-sm font-medium text-gray-600 hover:text-blue-600">
                    Ingresar
                    </RouterLink>
                </div>
            </div>
        </div>
    </nav>
</template>