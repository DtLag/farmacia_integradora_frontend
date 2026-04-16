<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'
import ProfileSidebar from '@/components/Customer/Profile/ProfileSidebar.vue'
import ProfileInfoCard from '@/components/Customer/Profile/ProfileInfoCard.vue'

const authStore = useAuthStore()

const profile = computed(() => ({
  name: authStore.user?.name || 'Nombre',
  last_name: authStore.user?.last_name || 'Apellido',
  email: authStore.user?.email || 'correo@ejemplo.com',
  user_id: authStore.user?.user_id || '',
  phone: 'No registrado',
}))
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <ClientNavbar />

    <main class="mx-auto w-full max-w-5xl grow p-4 md:p-10">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-[#1a2b4b]">Informacion personal</h1>
        <p class="mt-2 text-gray-500">Consulta tus datos del perfil de cliente.</p>
      </header>

      <div class="grid gap-5 md:grid-cols-[240px_1fr]">
        <ProfileSidebar />
        <ProfileInfoCard :profile="profile" />
      </div>
    </main>

    <ClientFooter />
  </div>
</template>
