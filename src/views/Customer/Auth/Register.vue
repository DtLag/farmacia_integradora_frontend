<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/components/Customer/Auth/AuthLayout.vue'
import RegisterForm from '@/components/Customer/Auth/RegisterForm.vue'
import VerifyModal from '@/components/Customer/Auth/VerifyModal.vue'

const router = useRouter()
const showVerifyModal = ref(false)
const registeredEmail = ref('')

// Recibimos el evento emitido por RegisterForm
const handleSuccessfulRegistration = (email: string) => {
  registeredEmail.value = email
  showVerifyModal.value = true
}

// Recibimos el evento emitido por VerifyModal
const handleVerificationSuccess = () => {
  showVerifyModal.value = false
  router.push('/login')
}
</script>

<template>
  <div>
    <AuthLayout :titulo-lineas="['Crea tu', 'Cuenta']">
      <RegisterForm @registered="handleSuccessfulRegistration" />
    </AuthLayout>

    <VerifyModal 
      v-if="showVerifyModal" 
      :email="registeredEmail" 
      @close="showVerifyModal = false"
      @success="handleVerificationSuccess" 
    />
  </div>
</template>