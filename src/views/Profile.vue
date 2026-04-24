<template>
  <Layout>
    <div>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card>
            <template #header>
              <span class="card-title">个人信息</span>
            </template>
            
            <div style="text-align: center; padding: 20px 0;">
              <el-avatar :size="100" :src="userStore.currentUser?.avatar" />
              <h3 style="margin-top: 16px; margin-bottom: 8px;">
                {{ userStore.currentUser?.name }}
              </h3>
              <el-tag :type="userStore.isCustomer ? 'success' : 'primary'" size="large">
                {{ userStore.isCustomer ? '客户' : '服务商' }}
              </el-tag>
            </div>
            
            <el-divider />
            
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">
                {{ userStore.currentUser?.username }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号">
                {{ userStore.currentUser?.phone }}
              </el-descriptions-item>
              <el-descriptions-item v-if="userStore.isProvider" label="所属公司">
                {{ userStore.currentUser?.company || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </el-col>
        
        <el-col :span="16">
          <el-card style="margin-bottom: 20px;">
            <template #header>
              <span class="card-title">账户统计</span>
            </template>
            
            <div class="stats-grid">
              <div class="stat-card" v-for="stat in stats" :key="stat.label">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
          
          <el-card>
            <template #header>
              <div class="flex-between">
                <span class="card-title">最近订单</span>
                <el-button type="primary" link @click="goOrders">查看全部</el-button>
              </div>
            </template>
            
            <div v-if="recentOrders.length === 0" class="empty-state" style="padding: 40px;">
              <el-icon><Document /></el-icon>
              <p>暂无订单记录</p>
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
const viewOrder = (id) => router.push(`/orders/${id}`)
</script>
