<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.ts'
import { ref } from 'vue'
import { useFetch } from '@vueuse/core'
import router from '@/router'
import type { Credentials } from '@/types/types.ts'

const authStore = useAuthStore()

const credenciales = ref<Credentials>({
  email: 'admin@farmacia.com',
  password: 'password',
})

function Login() {
  const { data, onFetchResponse, onFetchError } = useFetch(
    'https://api.harold-dev.me/api/login/staff',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    },
  )
    .post(credenciales.value)
    .json<{
      token: string
      user: {
        id: number
        name: string
        email: string
        role: string
      }
    }>()

  onFetchResponse(() => {
    console.log(data.value)
    if (data.value) {
      const token = data.value.token
      const userData = data.value.user
      if (token) {
        authStore.logIn(token, userData)
      }

      router.push('/dashboard')
    }
  })

  onFetchError((error) => {
    console.error('Error en el login:', error)
    alert('Credenciales incorrectas')
  })
}
</script>

<template>
  <div class="page">
    <div class="login-card">
      <div class="login-header">
        <h1>Iniciar sesión</h1>
      </div>

      <form @submit.prevent="Login">
        <div class="input-group">
          <label for="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            v-model="credenciales.email"
            placeholder="Ingresa tu correo"
          />
        </div>
        <div class="input-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            type="password"
            v-model="credenciales.password"
            placeholder="Ingresa tu contraseña"
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.login-container {
  width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: #f9fbfd;
  border: 1px solid #d0e4f7;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  color: #1565c0;
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3e50;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #aacbea;
  border-radius: 6px;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #1976d2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover:not(:disabled) {
  background-color: #155fa0;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

p {
  text-align: center;
  margin-top: 15px;
  color: #1565c0;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 18px;
  padding: 32px;
  box-shadow:
    0 20px 50px rgba(15, 23, 42, 0.12),
    0 8px 20px rgba(15, 23, 42, 0.08);
  border: 1px solid #e5eef9;
}

.login-header {
  margin-bottom: 28px;
  text-align: center;
}

.login-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.login-header p {
  margin-top: 8px;
  font-size: 14px;
  color: #64748b;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 14px;
  font-weight: 600;
  color: #334155;
}

input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  font-size: 15px;
  color: #0f172a;
  background: #f8fbff;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
  box-sizing: border-box;
}

input::placeholder {
  color: #94a3b8;
}

input:focus {
  border-color: #2563eb;
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
}

button {
  width: 100%;
  padding: 13px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.22);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(37, 99, 235, 0.28);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.error-message {
  margin: 0;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #dc2626;
  background: #fef2f2;
  border: 1px solid #fecaca;
  padding: 10px 12px;
  border-radius: 10px;
}
</style>
