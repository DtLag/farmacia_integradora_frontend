<script setup lang="ts">
import AuthLayout from '@/components/Customer/Auth/AuthLayout.vue'
import RegisterForm from '@/components/Customer/Auth/RegisterForm.vue'


</script>

<template>
  <AuthLayout :titulo-lineas="['Crear', 'Cuenta']">
    <RegisterForm />
  </AuthLayout>
</template>