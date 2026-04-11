<script setup lang="ts">
import { ref } from 'vue'
import { usePublicApi } from '@/composables/usePublicApi';

const props = defineProps<{
    email: string
}>()

const emit = defineEmits(['close', 'success'])

const code = ref('')
const loading = ref(false)
const error = ref('')

async function verifyCode(){
    const payload = {
        'email': props.email,
        'code': code.value  
    }

    loading.value = true
    error.value = ''

    try {
        const { data, error: fetchError } = await usePublicApi('/customer/check-reset-code').post(payload).json()
        if(fetchError.value) throw new Error('No se pudo enviar el código')

        emit('success', code.value)
    } catch (e) {
        error.value = 'Ocurrio un error al enviar el código'
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

      <h2 class="text-2xl font-bold text-[#1a2b4b] mb-4">Ingrese el código</h2>
      <p class="text-gray-600 mb-6 text-sm">
        Te hemos enviado un código a tu correo: <span class="font-bold text-[#1a2b4b]">{{ email }}</span>
      </p>
      
      <div v-if="error" class="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm">
        {{ error }}
      </div>

      <div class="mb-8">
        <input 
          v-model="code"
          type="text"
          maxlength="4"
          placeholder="----"
          @keyup.enter="verifyCode"
          class="w-full text-center text-3xl tracking-[1em] font-bold py-3 border border-[#4285F4] rounded focus:outline-none focus:ring-1 focus:ring-[#4285F4] bg-white"
        />
      </div>
      
      <div class="flex justify-end">
        <button 
          @click="verifyCode" 
          :disabled="loading" 
          class="bg-[#4285F4] hover:bg-blue-600 disabled:opacity-50 text-white font-medium py-2 px-6 rounded transition-colors"
        >
          {{ loading ? 'Verificando...' : 'Aceptar' }}
        </button>
      </div>

    </div>
  </div>
</template>