import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const user = ref(JSON.parse(sessionStorage.getItem('user')) || null)

  const token = ref(sessionStorage.getItem('token') || null)

  const setToken = (value) => {
    sessionStorage.setItem('token', value)
    token.value = value
  }

  const setUser = (value = {}) => {
    sessionStorage.setItem('user', JSON.stringify(value))
    user.value = value
  }

  return { user, setUser, token, setToken }
})
