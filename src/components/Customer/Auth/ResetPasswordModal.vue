<script setup lang="ts">
import { ref } from 'vue'
import { usePublicApi } from '@/composables/usePublicApi';

const newPassword = ref('')
const newPasswordConfirmation = ref('')
const loading = ref(false)
const error = ref('')

const props = defineProps<{
    email: string
    code: string
}>()

const emit = defineEmits(['close', 'success'])

async function resetPassword() {
    if(newPassword.value != newPasswordConfirmation.value) {
        error.value = 'La contraseña debe ser igual en ambos parametros'
        return
    }

    const payload = {
        'email': props.email,
        'code': props.code,
        'new_password': newPassword.value,
        'new_password_confirmation': newPasswordConfirmation.value
    }

    loading.value = true
    error.value = ''

    try {
        const { data, error: errorFetching} = await usePublicApi('customer/reset-password').post(payload).json()
        if(errorFetching.value) throw new Error('No se pudo actualizar la contraseña.')

        emit('success')
    } catch (e) {
        error.value = 'Ocurrió un error al actualizar la contraseña.'
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

      <h2 class="text-2xl font-bold text-[#1a2b4b] mb-6">Nueva contraseña</h2>

      <div v-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
        {{ error }}
      </div>
      
      <div class="mb-4">
        <label class="block text-[#1a2b4b] mb-2 text-sm">Nueva Contraseña</label>
        <input 
          v-model="newPassword" 
          type="password" 
          class="w-full px-3 py-2 border border-[#4285F4] rounded focus:outline-none focus:ring-1 focus:ring-[#4285F4]" 
        />
      </div>

      <div class="mb-6">
        <label class="block text-[#1a2b4b] mb-2 text-sm">Confirmar Contraseña</label>
        <input 
          v-model="newPasswordConfirmation" 
          type="password" 
          @keyup.enter="resetPassword" 
          class="w-full px-3 py-2 border border-[#4285F4] rounded focus:outline-none focus:ring-1 focus:ring-[#4285F4]" 
        />
      </div>

      <p class="text-gray-500 text-xs mb-6">
        La contraseña debe tener al menos 8 caracteres, una mayúscula y una minúscula.
      </p>
      
      <div class="flex justify-center">
        <button 
          @click="resetPassword" 
          :disabled="loading" 
          class="bg-[#4285F4] hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-2 px-10 rounded transition-colors"
        >
          {{ loading ? 'Guardando...' : 'Aceptar' }}
        </button>
      </div>

    </div>
  </div>
</template>