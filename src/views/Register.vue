<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="login-header">
        <el-icon :size="48" color="#409eff"><Promotion /></el-icon>
        <h2>注册账户</h2>
        <p>加入低空飞行运营平台</p>
      </div>
      
      <el-form :model="registerForm" :rules="rules" ref="registerFormRef" label-position="top">
        <el-form-item label="角色类型" prop="role">
          <el-radio-group v-model="registerForm.role">
            <el-radio value="customer">客户</el-radio>
            <el-radio value="provider">服务商</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" prefix-icon="User" />
        </el-form-item>
        
        <el-form-item label="姓名" prop="name">
          <el-input v-model="registerForm.name" placeholder="请输入真实姓名" prefix-icon="UserFilled" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" prefix-icon="Phone" />
        </el-form-item>
        
        <el-form-item v-if="registerForm.role === 'provider'" label="公司名称" prop="company">
          <el-input v-model="registerForm.company" placeholder="请输入公司名称" prefix-icon="OfficeBuilding" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" :loading="loading" class="w-full" @click="handleRegister">
            注册
          </el-button>
        </el-form-item>
      </el-form>
      
      <div style="text-align: center; margin-top: 20px;">
        <span style="color: #909399;">已有账户？</span>
        <el-button text type="primary" @click="goLogin">立即登录</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref(null)
const loading = ref(false)

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value?.validateField('confirmPassword')
    }
    callback()
  }
}

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: '',
  role: 'customer',
  company: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  password: [{ required: true, validator: validatePass, trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      const userData = {
        username: registerForm.username,
        password: registerForm.password,
        name: registerForm.name,
        phone: registerForm.phone,
        role: registerForm.role,
        company: registerForm.company
      }
      
      setTimeout(() => {
        loading.value = false
        const result = userStore.register(userData)
        if (result.success) {
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        } else {
          ElMessage.error(result.message)
        }
      }, 500)
    }
  })
}

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.w-full {
  width: 100%;
}
</style>
