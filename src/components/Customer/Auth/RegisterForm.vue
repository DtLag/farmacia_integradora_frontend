<script setup lang="ts">
import { reactive } from 'vue'
import { useCustomerAuth } from '@/composables/customer/useCustomerAuth'

interface RegisterForm {
  name: string
  lastname: string
  email: string
  phone: string
  password: string
}

const form = reactive<RegisterForm>({
  name: '',
  lastname: '',
  email: '',
  phone: '',
  password: '',
})

const { loading, error, register } = useCustomerAuth()

async function onSubmit() {
  await register({ ...form })
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-4">
      <label for="nombre" class="block text-gray-700 font-semibold mb-2">Nombre(s)</label>
      <input
        v-model="form.name"
        type="text"
        id="nombre"
        class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Ingresa tu nombre(s)"
      />
    </div>

    <div class="mb-4">
      <label for="apellido" class="block text-gray-700 font-semibold mb-2">Apellido</label>
      <input
        v-model="form.lastname"
        type="text"
        id="apellido"
        class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Ingresa tus apellidos"
      />
    </div>

    <div class="mb-4">
      <label for="email" class="block text-gray-700 font-semibold mb-2">Correo</label>
      <input
        v-model="form.email"
        type="email"
        id="email"
        class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Ingresa tu correo"
      />
    </div>

    <div class="mb-4">
      <label for="phone" class="block text-gray-700 font-semibold mb-2">Telefono</label>
      <input
        v-model="form.phone"
        type="tel"
        id="phone"
        class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Ingresa tu telefono"
      />
    </div>

    <div class="mb-4">
      <label for="password" class="block text-gray-700 font-semibold mb-2">Contraseña</label>
      <input
        v-model="form.password"
        type="password"
        id="password"
        class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Crea tu contraseña"
      />
    </div>

    <p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>

    <input
      :disabled="loading"
      :value="loading ? 'Creando...' : 'Crear cuenta'"
      type="submit"
      class="block w-1/3 mx-auto py-2 px-3 text-1xl bg-[#046EB9] text-white font-extralight rounded-2xl hover:bg-[#02416e] transition duration-200"
    />
    

    <RouterLink
      to="/customer/login"
      class="block w-1/3 mx-auto mt-1 py-2 px-3 text-1xl text-center text-[#205DB3] font-extralight rounded-2xl hover:text-[#002742] transition duration-200"
    >
      Iniciar sesión
    </RouterLink>
  </form>
</template>