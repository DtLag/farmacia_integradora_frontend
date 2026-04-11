<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useCustomerAuth } from '@/composables/customer/useCustomerAuth'
import type { Credentials } from '@/types/types'
import ForgotPasswordModal from './ForgotPasswordModal.vue'
import VerifyResetModal from './VerifyResetModal.vue'
import ResetPasswordModal from './ResetPasswordModal.vue'

const activeModal = ref<'forgot' | 'verify' | 'reset' | null>(null)
const recoverEmail = ref('')
const recoverCode = ref('')

const form = reactive<Credentials>({
  email: '',
  password: '',
})

const { loading, error, login } = useCustomerAuth()

async function onSubmit() {
  await login({ ...form })
}

const handleForgotSuccess = (email: string) => {
  recoverEmail.value = email
  activeModal.value = 'verify'
}

const handleVerifySuccess = (code: string) => {
  recoverCode.value = code
  activeModal.value = 'reset'
}

const handleResetSuccess = () => {
  activeModal.value = null
  alert('Contraseña actualizada correctamente.')
}
</script>

<template>
  <form @submit.prevent="onSubmit">
    <div class="mb-4 login">
      <label for="email" class="block text-gray-700 font-semibold mb-2">Correo Electrónico</label>
      <input
        v-model="form.email"
        type="email"
        id="email"
        class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Ingresa tu correo electrónico"
      />
    </div>

    <div class="mb-1">
      <label for="password" class="block text-gray-700 font-semibold mb-2">Contraseña</label>
      <input
        v-model="form.password"
        type="password"
        id="password"
        class="bg-white w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        placeholder="Ingresa tu contraseña"
      />
    </div>

    <div>
      <button type="button" @click="activeModal = 'forgot'" class="text-sm hover:underline mb-10 inline-block text-[#205DB3]">¿Olvidaste tu contraseña?</button>
    </div>

    <p v-if="error" class="text-red-600 text-sm mt-2">{{ error }}</p>

    <input
      :disabled="loading"
      :value="loading ? 'Iniciando...' : 'Iniciar sesión'"
      type="submit"
      class="block w-full sm:w-2/3 md:w-1/3 mx-auto py-2 px-3 text-lg bg-[#046EB9] text-white font-extralight rounded-2xl hover:bg-[#02416e] transition duration-200"
    />

    <RouterLink
      to="/customer/register"
      class="block w-full sm:w-2/3 md:w-1/3 mx-auto mt-4 py-2 px-3 text-lg text-center text-[#205DB3] font-extralight rounded-2xl hover:text-[#002742] transition duration-200"
    >
      Regístrate
    </RouterLink>
  </form>

  <ForgotPasswordModal 
  v-if="activeModal === 'forgot'"
  @close="activeModal = null"
  @success="handleForgotSuccess"
  />

  <VerifyResetModal 
  v-if="activeModal === 'verify'"
  :email="recoverEmail"
  @close="activeModal = null"
  @success="handleVerifySuccess"
  />

  <ResetPasswordModal
  v-if="activeModal === 'reset'"
  :email="recoverEmail"
  :code="recoverCode"
  @close="activeModal = null"
  @success="handleResetSuccess"
  />
</template>
