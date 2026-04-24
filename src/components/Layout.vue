<template>
  <div class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '220px'" style="background-color: #304156;">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.1);">
        <el-icon v-if="isCollapse" :size="24"><Promotion /></el-icon>
        <span v-else>低空飞行运营</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>工作台</template>
        </el-menu-item>
        
        <el-menu-item v-if="userStore.isCustomer" index="/orders">
          <el-icon><List /></el-icon>
          <template #title>我的订单</template>
        </el-menu-item>
        
        <el-menu-item v-if="userStore.isCustomer" index="/orders/new">
          <el-icon><Plus /></el-icon>
          <template #title>发布需求</template>
        </el-menu-item>
        
        <el-menu-item v-if="userStore.isProvider" index="/market">
          <el-icon><Shop /></el-icon>
          <template #title>需求市场</template>
        </el-menu-item>
        
        <el-menu-item v-if="userStore.isProvider" index="/orders">
          <el-icon><Document /></el-icon>
          <template #title>我的任务</template>
        </el-menu-item>
        
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <template #title>个人中心</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <div class="main-content">
      <el-header style="background: white; display: flex; align-items: center; justify-content: space-between; padding: 0 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: 16px;">
          <el-button text @click="toggleSidebar">
            <el-icon :size="20"><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
          </el-button>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        
        <div class="header-user" @click="handleUserMenu">
          <el-tag :type="userStore.isCustomer ? 'success' : 'primary'" size="small">
            {{ userStore.isCustomer ? '客户' : '服务商' }}
          </el-tag>
          <div class="header-user-avatar">
            <img :src="userStore.currentUser?.avatar" alt="avatar" />
          </div>
          <span>{{ userStore.currentUser?.name }}</span>
          <el-dropdown @command="handleCommand">
            <el-icon><ArrowDown /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <div class="page-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

const breadcrumbMap = {
  '/dashboard': ['工作台'],
  '/orders': ['订单管理'],
  '/orders/new': ['发布需求'],
  '/market': ['需求市场'],
  '/profile': ['个人中心']
}

const breadcrumbs = computed(() => {
  if (route.path.startsWith('/orders/') && route.params.id) {
    return ['订单管理', '订单详情']
  }
  return breadcrumbMap[route.path] || ['首页']
})

const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

const handleUserMenu = () => {
}

const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      userStore.logout()
      router.push('/login')
      ElMessage.success('已退出登录')
    } catch {
    }
  }
}
</script>
