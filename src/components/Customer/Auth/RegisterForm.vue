<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerAuth } from '@/composables/customer/useCustomerAuth'
import { usePublicApi } from '@/composables/usePublicApi'
import VerifyModal from './VerifyModal.vue'

interface RegisterForm {
  name: string
  email: string
  phone: string
  password: string
}

const form = reactive<RegisterForm>({
  name: '',
  email: '',
  phone: '',
  password: '',
})

const { loading, error, register } = useCustomerAuth()

const showModal = ref(false)
const emailToVerify = ref('')
const code = ref('')

const router = useRouter()

async function onSubmit() {
  const email = await register({ ...form })

  if (email) {
    emailToVerify.value = email
    showModal.value = true
  }
}

async function verifyCode() {
  try {
    const { error: fetchError } = await usePublicApi('verify-code').post({
      email: emailToVerify.value,
      code: code.value, 
    }).json()

    if (fetchError.value) {
      console.error('Error en verificación:', fetchError.value)
      throw new Error('No se pudo verificar el correo')
    }

    showModal.value = false
    await router.replace('/customer/login')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error al verificar el correo'
  }
}

async function resendCode() {
  try {
    await usePublicApi('resend-code').post({
      email: emailToVerify.value
    })
  } catch (e) {
    console.error('Error al reenviar:', e)
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-4">
      <label for="nombre" class="block text-gray-700 font-semibold mb-2">Nombre</label>
      <input v-model="form.name" type="text" id="nombre" class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200" placeholder="Ingresa tu nombre" />
    </div>

    <div class="mb-4">
      <label for="email" class="block text-gray-700 font-semibold mb-2">Correo</label>
      <input v-model="form.email" type="email" id="email" class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200" placeholder="Ingresa tu correo" />
    </div>

    <div class="mb-4">
      <label for="phone" class="block text-gray-700 font-semibold mb-2">Telefono</label>
      <input v-model="form.phone" type="tel" id="phone" class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200" placeholder="Ingresa tu telefono" />
    </div>

    <div class="mb-4">
      <label for="password" class="block text-gray-700 font-semibold mb-2">Contraseña</label>
      <input v-model="form.password" type="password" id="password" class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200" placeholder="Crea tu contraseña" />
    </div>

    <p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>

    <input
      :disabled="loading"
      :value="loading ? 'Creando...' : 'Crear cuenta'"
      type="submit"
      class="block w-full sm:w-2/3 md:w-1/3 mx-auto py-2 px-3 text-lg bg-[#046EB9] text-white font-extralight rounded-2xl hover:bg-[#02416e] transition duration-200 mt-6"
    />

    <RouterLink
      to="/customer/login"
      class="block w-full sm:w-2/3 md:w-1/3 mx-auto mt-2 py-2 px-3 text-lg text-center text-[#205DB3] font-extralight rounded-2xl hover:text-[#002742] transition duration-200"
    >
      Iniciar sesión
    </RouterLink>
  </form>

  <VerifyModal 
    v-if="showModal" 
    :emailToVerify="emailToVerify" 
    v-model:code="code"
    @close="showModal = false"
    @verify="verifyCode"
    @resend="resendCode"
  />
</template>