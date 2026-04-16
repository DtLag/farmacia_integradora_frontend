<script setup lang="ts">
import { computed } from 'vue'

interface ProfileInfo {
  name: string
  last_name: string
  email: string
  user_id?: string
  phone?: string
}

const props = defineProps<{
  profile: ProfileInfo
}>()

const initials = computed(() => {
  const first = props.profile.name?.charAt(0) ?? ''
  const last = props.profile.last_name?.charAt(0) ?? ''
  return `${first}${last}`.toUpperCase()
})
</script>

<template>
  <section class="overflow-hidden rounded-3xl border bg-white shadow-sm transition-shadow hover:shadow-md">
    <div class="mb-6 flex flex-wrap items-center gap-4 border-b bg-gray-50/50 p-6 pb-5">
      <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-2xl font-black text-blue-800">
        {{ initials }}
      </div>
      <div>
        <h2 class="text-xl font-black text-[#1a2b4b]">{{ profile.name }} {{ profile.last_name }}</h2>
        <p class="text-sm text-gray-500">Cliente activo</p>
      </div>
    </div>

    <div class="grid gap-4 p-6 pt-0 sm:grid-cols-2">
      <article class="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-700">Nombre</p>
        <p class="mt-1 text-sm font-semibold text-gray-700">{{ profile.name }}</p>
      </article>

      <article class="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-700">Apellidos</p>
        <p class="mt-1 text-sm font-semibold text-gray-700">{{ profile.last_name }}</p>
      </article>

      <article class="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-700">Correo</p>
        <p class="mt-1 text-sm font-semibold text-gray-700">{{ profile.email }}</p>
      </article>

      <article class="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-700">Telefono</p>
        <p class="mt-1 text-sm font-semibold text-gray-700">{{ profile.phone || 'No registrado' }}</p>
      </article>

      <article class="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 sm:col-span-2">
        <p class="text-xs font-bold uppercase tracking-wider text-blue-700">Usuario</p>
        <p class="mt-1 text-sm font-semibold text-gray-700">{{ profile.user_id || 'Sin identificador' }}</p>
      </article>
    </div>
  </section>
</template>
