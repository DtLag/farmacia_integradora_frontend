import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { User } from '@/types/types.ts'

export const useAuthStore = defineStore('auth', () => {
  //state
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)

  function logIn(newToken: string, newUSer: User) {
    token.value = newToken
    user.value = newUSer

    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUSer))
  }

  function logOut() {
    token.value = null
    user.value = null

    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return { token, user, isAuthenticated, logIn, logOut }
})
