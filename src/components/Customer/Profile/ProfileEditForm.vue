<script setup lang="ts">
import { reactive } from 'vue'

interface ProfileFormValues {
  name: string
  last_name: string
  email: string
  phone?: string
}

const props = defineProps<{
  initialProfile: ProfileFormValues
}>()

const emit = defineEmits<{
  saved: [payload: ProfileFormValues]
}>()

const form = reactive<ProfileFormValues>({
  name: props.initialProfile.name,
  last_name: props.initialProfile.last_name,
  email: props.initialProfile.email,
  phone: props.initialProfile.phone || '',
})

function handleSubmit() {
  emit('saved', {
    name: form.name,
    last_name: form.last_name,
    email: form.email,
    phone: form.phone,
  })
}
</script>

<template>
  <form class="rounded-3xl border bg-white p-6 shadow-sm" @submit.prevent="handleSubmit">
    <header class="mb-6 border-b border-gray-100 pb-5">
      <h2 class="text-xl font-black text-[#1a2b4b]">Editar perfil</h2>
      <p class="mt-1 text-sm text-gray-500">Actualiza tu informacion personal.</p>
    </header>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="space-y-2">
        <span class="text-sm font-semibold text-gray-600">Nombre</span>
        <input
          v-model="form.name"
          type="text"
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
        >
      </label>

      <label class="space-y-2">
        <span class="text-sm font-semibold text-gray-600">Apellidos</span>
        <input
          v-model="form.last_name"
          type="text"
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
        >
      </label>

      <label class="space-y-2">
        <span class="text-sm font-semibold text-gray-600">Correo</span>
        <input
          v-model="form.email"
          type="email"
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
        >
      </label>

      <label class="space-y-2">
        <span class="text-sm font-semibold text-gray-600">Telefono</span>
        <input
          v-model="form.phone"
          type="tel"
          class="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:bg-white"
          placeholder="Ej. 871 000 0000"
        >
      </label>
    </div>

    <div class="mt-6 flex justify-end">
      <button
        type="submit"
        class="rounded-xl bg-[#0B369E] px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-blue-800"
      >
        Guardar cambios
      </button>
    </div>
  </form>
</template>
