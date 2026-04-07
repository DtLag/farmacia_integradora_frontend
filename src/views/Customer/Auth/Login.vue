<script setup lang="ts">
import AuthLayout from '@/components/Customer/Auth/AuthLayout.vue'
import LoginForm from '@/components/Customer/Auth/LoginForm.vue'
</script>

<template>
  <AuthLayout :titulo-lineas="['Inicia', 'Sesión']">
    <LoginForm />
  </AuthLayout>
</template>