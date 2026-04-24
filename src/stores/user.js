import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockUsers } from '../mock'

export const useUserStore = defineStore('user', () => {
  const currentUser = ref(null)
  const users = ref(mockUsers)

  const isLoggedIn = computed(() => currentUser.value !== null)
  const isCustomer = computed(() => currentUser.value?.role === 'customer')
  const isProvider = computed(() => currentUser.value?.role === 'provider')

  const login = (username, password) => {
    const user = users.value.find(
      u => u.username === username && u.password === password
    )
    if (user) {
      currentUser.value = { ...user }
      delete currentUser.value.password
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      return { success: true, message: '登录成功' }
    }
    return { success: false, message: '用户名或密码错误' }
  }

  const logout = () => {
    currentUser.value = null
    localStorage.removeItem('currentUser')
    return { success: true, message: '已退出登录' }
  }

  const restoreSession = () => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      currentUser.value = JSON.parse(stored)
    }
  }

  const register = (userData) => {
    const exists = users.value.find(u => u.username === userData.username)
    if (exists) {
      return { success: false, message: '用户名已存在' }
    }
    const newUser = {
      id: users.value.length + 1,
      ...userData,
      avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
    }
    users.value.push(newUser)
    return { success: true, message: '注册成功' }
  }

  return {
    currentUser,
    users,
    isLoggedIn,
    isCustomer,
    isProvider,
    login,
    logout,
    restoreSession,
    register
  }
})
