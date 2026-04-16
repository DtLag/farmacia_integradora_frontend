<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import ClientNavbar from '@/components/Customer/ClientNavbar.vue'
import ClientFooter from '@/components/Customer/ClientFooter.vue'
import ProfileSidebar from '@/components/Customer/Profile/ProfileSidebar.vue'
import ProfileEditForm from '@/components/Customer/Profile/ProfileEditForm.vue'

const authStore = useAuthStore()
const wasSaved = ref(false)

const initialProfile = computed(() => ({
  name: authStore.user?.name || 'Nombre',
  last_name: authStore.user?.last_name || 'Apellido',
  email: authStore.user?.email || 'correo@ejemplo.com',
  phone: '',
}))

function handleSaved() {
  wasSaved.value = true
  setTimeout(() => {
    wasSaved.value = false
  }, 2000)
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-gray-50">
    <ClientNavbar />

    <main class="mx-auto w-full max-w-5xl grow p-4 md:p-10">
      <header class="mb-8">
        <h1 class="text-3xl font-extrabold text-[#1a2b4b]">Editar perfil</h1>
        <p class="mt-2 text-gray-500">Realiza cambios sobre tu informacion personal.</p>
      </header>

      <div class="grid gap-5 md:grid-cols-[240px_1fr]">
        <ProfileSidebar />

        <div class="space-y-4">
          <transition
            enter-active-class="transition duration-300"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <p v-if="wasSaved" class="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800">
              Cambios guardados visualmente.
            </p>
          </transition>

          <ProfileEditForm :initial-profile="initialProfile" @saved="handleSaved" />
        </div>
      </div>
    </main>

    <ClientFooter />
  </div>
</template>
