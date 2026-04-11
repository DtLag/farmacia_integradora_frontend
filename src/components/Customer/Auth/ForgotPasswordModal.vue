<script setup lang="ts">
import { ref } from 'vue'
import { usePublicApi } from '@/composables/usePublicApi'

const emit = defineEmits(['close', 'success'])

const email = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''

  try {
    const { error: fetchError, data } = await usePublicApi('customer/forgot-password').post({ email: email.value }).json()
    if (fetchError.value) {
      throw new Error('No se pudo enviar el correo')
    }

    emit('success', email.value)
  } catch (e) {
    error.value = 'Ocurrió un error al enviar el enlace'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div 
    class="fixed inset-0 bg-black/40 bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
    @click.self="emit('close')"
  >
    <div class="bg-[#F4F7F9] p-8 rounded-xl w-full max-w-[28rem] relative shadow-lg text-left">
      
      <button 
        @click="emit('close')" 
        class="absolute top-5 right-5 text-gray-800 hover:text-black bg-black rounded-full text-white w-6 h-6 flex items-center justify-center text-sm font-bold"
      >
        ✕
      </button>

      <h2 class="text-2xl font-bold text-[#1a2b4b] mb-4">¿Olvidaste tu contraseña?</h2>
      <p class="text-gray-600 mb-6 text-sm">
        Introduce tu dirección de correo electrónico a continuación para recibir un enlace de restablecimiento de contraseña.
      </p>

      <div v-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
        {{ error }}
      </div>
      
      <div class="mb-6">
        <input 
          v-model="email"
          placeholder="Correo electrónico"
          type="email"
          @keyup.enter="submit"
          class="w-full px-3 py-2 border border-[#4285F4] rounded focus:outline-none focus:ring-1 focus:ring-[#4285F4]"
        />
      </div>
      
      <div class="flex justify-end">
        <button 
          @click="submit" 
          :disabled="loading" 
          class="bg-[#4285F4] hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-2 px-6 rounded transition-colors"
        >
          {{ loading ? 'Enviando...' : 'Recuperar' }}
        </button>
      </div>

    </div>
  </div>
</template>