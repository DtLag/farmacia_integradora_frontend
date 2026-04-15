<template>
  <form @submit.prevent="handleSubmit" class="space-y-5">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">Nombre Completo</label>
      <input 
        id="name"
        v-model="form.name" 
        type="text" 
        :class="{'border-red-500 focus:ring-red-500': errors.name, 'border-gray-300 focus:ring-blue-500': !errors.name}" 
        class="mt-1 block w-full rounded-md shadow-sm sm:text-sm" 
        placeholder="Ej. Harold Martínez"
      />
      <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
    </div>

    <div>
      <label for="phone" class="block text-sm font-medium text-gray-700">Teléfono (Opcional)</label>
      <input 
        id="phone"
        v-model="form.phone" 
        type="tel" 
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
        placeholder="Ej. 871 123 4567"
      />
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">Correo Electrónico</label>
      <input 
        id="email"
        v-model="form.email" 
        type="email" 
        :class="{'border-red-500 focus:ring-red-500': errors.email, 'border-gray-300 focus:ring-blue-500': !errors.email}" 
        class="mt-1 block w-full rounded-md shadow-sm sm:text-sm" 
        placeholder="correo@ejemplo.com"
      />
      <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
      <input 
        id="password"
        v-model="form.password" 
        type="password" 
        :class="{'border-red-500 focus:ring-red-500': errors.password, 'border-gray-300 focus:ring-blue-500': !errors.password}" 
        class="mt-1 block w-full rounded-md shadow-sm sm:text-sm" 
        placeholder="••••••••"
      />
      <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
    </div>

    <button 
      type="submit" 
      :disabled="loading" 
      class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <span v-if="loading" class="flex items-center">
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Procesando...
      </span>
      <span v-else>Registrarse</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useCustomerAuth } from '@/composables/customer/useCustomerAuth'; 

const emit = defineEmits(['registered']);

// Ajustado a los nombres reales de tu composable
const { register, loading } = useCustomerAuth();

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
});

const errors = ref<Record<string, string>>({});

const validateForm = () => {
  errors.value = {};
  if (!form.name.trim()) errors.value.name = 'El nombre es obligatorio.';
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.email || !emailRegex.test(form.email)) {
    errors.value.email = 'Ingresa un correo electrónico válido.';
  }
  
  if (form.password.length < 8) {
    errors.value.password = 'La contraseña debe tener al menos 8 caracteres.';
  }

  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    // Usar la función register de tu composable
    await register(form); 
    
    // Emitir el correo para abrir el modal
    emit('registered', form.email);
    
  } catch (err: any) {
    // Si usas fetch nativo o useFetch de VueUse, asegúrate de cómo devuelve los errores.
    // Si tienes acceso a la respuesta cruda, puedes capturar el 422:
    if (err.response?.status === 422) {
      const backendErrors = err.response.data.errors;
      if (backendErrors.name) errors.value.name = backendErrors.name[0];
      if (backendErrors.email) errors.value.email = backendErrors.email[0];
      if (backendErrors.password) errors.value.password = backendErrors.password[0];
    } else {
      errors.value.email = 'Ocurrió un error inesperado al conectar con el servidor.';
    }
  }
};
</script>