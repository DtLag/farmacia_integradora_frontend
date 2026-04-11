<script setup lang="ts">
const props = defineProps<{
  emailToVerify: string;
}>()

const code = defineModel('code', { type: String, default: '' })

const emit = defineEmits<{
  (e: 'close'): void       
  (e: 'verify'): void         
  (e: 'resend'): void         
}>()
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
    <div class="bg-[#EAF4FC] p-6 rounded-lg w-80 text-center">
      <h2 class="text-xl font-semibold mb-4">Verificar correo</h2>
      <p class="text-sm mb-4">
        Ingresa el código enviado a {{ emailToVerify }}
      </p>
      
      <input
        v-model="code"
        type="text"
        placeholder="Código"
        class="w-full px-3 py-2 border rounded mb-4 text-center text-lg tracking-widest"
      />
      
      <div class="grid grid-flow-col grid-rows-1 gap-2">
        <button
          @click="emit('verify')" 
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Verificar
        </button>

        <button
          @click="emit('resend')"
          class="w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
        >
          Reenviar código
        </button>
      </div>
      
      <button
        @click="emit('close')"
        class="mt-2 text-sm text-gray-500"
      >
        Cancelar
      </button>
    </div>
  </div>
</template>