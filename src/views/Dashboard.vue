<template>
  <Layout>
    <div>
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in stats" :key="stat.label">
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
      
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card>
            <template #header>
              <div class="flex-between">
                <span class="card-title">
                  {{ userStore.isCustomer ? '我的订单' : '最近任务' }}
                </span>
                <el-button type="primary" link @click="goOrders">查看全部</el-button>
              </div>
            </template>
            
            <div v-if="recentOrders.length === 0" class="empty-state">
              <el-icon><Document /></el-icon>
              <p>暂无订单数据</p>
              <el-button v-if="userStore.isCustomer" type="primary" @click="goCreateOrder">
                发布第一个需求
              </el-button>
            </div>
            
            <div v-else>
              <el-table :data="recentOrders" style="width: 100%">
                <el-table-column prop="id" label="订单号" width="140" />
                <el-table-column prop="title" label="订单标题" min-width="200" />
                <el-table-column prop="flightType" label="飞行类型" width="100" />
                <el-table-column label="状态" width="100">
                  <template #default="scope">
                    <el-tag :type="getStatusType(scope.row.status)">
                      {{ getStatusLabel(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="price" label="金额" width="100">
                  <template #default="scope">
                    {{ scope.row.price > 0 ? `¥${scope.row.price}` : '-' }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100">
                  <template #default="scope">
                    <el-button type="primary" link @click="viewOrder(scope.row.id)">
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <template #header>
              <span class="card-title">快捷操作</span>
            </template>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <el-button type="primary" size="large" @click="goCreateOrder" v-if="userStore.isCustomer">
                <el-icon><Plus /></el-icon>
                发布飞行需求
              </el-button>
              
              <el-button type="primary" size="large" @click="goMarket" v-if="userStore.isProvider">
                <el-icon><Shop /></el-icon>
                浏览需求市场
              </el-button>
              
              <el-button size="large" @click="goOrders">
                <el-icon><List /></el-icon>
                查看所有订单
              </el-button>
              
              <el-button size="large" @click="goProfile">
                <el-icon><User /></el-icon>
                个人中心
              </el-button>
            </div>
          </el-card>
          
          <el-card style="margin-top: 20px;">
            <template #header>
              <span class="card-title">账户信息</span>
            </template>
            
            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
              <el-avatar :size="64" :src="userStore.currentUser?.avatar" />
              <div>
                <div style="font-size: 18px; font-weight: 600;">
                  {{ userStore.currentUser?.name }}
                </div>
                <div style="color: #909399; font-size: 14px;">
                  {{ userStore.currentUser?.phone }}
                </div>
              </div>
            </div>
            
            <el-divider />
            
            <div style="display: flex; justify-content: space-between; color: #606266;">
              <span>角色类型</span>
              <el-tag :type="userStore.isCustomer ? 'success' : 'primary'">
                {{ userStore.isCustomer ? '客户' : '服务商' }}
              </el-tag>
            </div>
            
            <div v-if="userStore.isProvider" style="display: flex; justify-content: space-between; color: #606266; margin-top: 12px;">
              <span>所属公司</span>
              <span>{{ userStore.currentUser?.company || '-' }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useOrderStore } from '../stores/order'
import { mockOrderStatuses } from '../mock'
import Layout from '../components/Layout.vue'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const myOrders = computed(() => {
  if (userStore.isCustomer) {
    return orderStore.getOrdersByCustomerId(userStore.currentUser.id)
  } else {
    return orderStore.getOrdersByProviderId(userStore.currentUser.id)
  }
})

const recentOrders = computed(() => myOrders.value.slice(0, 5))

const stats = computed(() => {
  const orders = myOrders.value
  return [
    {
      value: orders.length,
      label: userStore.isCustomer ? '总订单数' : '总任务数'
    },
    {
      value: orders.filter(o => o.status === 'pending' || o.status === 'accepted' || o.status === 'paid' || o.status === 'executing').length,
      label: '进行中'
    },
    {
      value: orders.filter(o => o.status === 'completed').length,
      label: '已完成'
    },
    {
      value: orders.reduce((sum, o) => sum + (o.price || 0), 0) + '元',
      label: userStore.isCustomer ? '总支出' : '总收入'
    }
  ]
})

const getStatusType = (status) => mockOrderStatuses[status]?.color || 'info'
const getStatusLabel = (status) => mockOrderStatuses[status]?.label || '未知'

const goOrders = () => router.push('/orders')
const goCreateOrder = () => router.push('/orders/new')
const goMarket = () => router.push('/market')
const goProfile = () => router.push('/profile')
const viewOrder = (id) => router.push(`/orders/${id}`)
</script>
