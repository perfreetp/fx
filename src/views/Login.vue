<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <el-icon :size="48" color="#409eff"><Promotion /></el-icon>
        <h2>低空飞行运营平台</h2>
        <p>请登录您的账户</p>
      </div>
      
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" prefix-icon="User">
            <template #prepend>
              <el-select v-model="loginForm.role" style="width: 100px;">
                <el-option label="客户" value="customer" />
                <el-option label="服务商" value="provider" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" class="w-full" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      
      <div style="text-align: center; margin-top: 20px;">
        <span style="color: #909399;">还没有账户？</span>
        <el-button text type="primary" @click="goRegister">立即注册</el-button>
      </div>
      
      <el-divider />
      
      <div style="color: #909399; font-size: 12px;">
        <p><strong>测试账号：</strong></p>
        <p>客户：customer1 / 123456</p>
        <p>服务商：provider1 / 123456</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  role: 'customer'
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const result = userStore.login(loginForm.username, loginForm.password)
      
      setTimeout(() => {
        loading.value = false
        if (result.success) {
          ElMessage.success(result.message)
          const redirect = route.query.redirect || '/dashboard'
          router.push(redirect)
        } else {
          ElMessage.error(result.message)
        }
      }, 500)
    }
  })
}

const goRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
