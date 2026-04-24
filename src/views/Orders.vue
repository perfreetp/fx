<template>
  <Layout>
    <div>
      <el-card>
        <template #header>
          <div class="flex-between">
            <span class="card-title">
              {{ userStore.isCustomer ? '我的订单' : '我的任务' }}
            </span>
            <el-button type="primary" @click="goCreateOrder" v-if="userStore.isCustomer">
              <el-icon><Plus /></el-icon>
              发布需求
            </el-button>
          </div>
        </template>
        
        <el-form :inline="true" style="margin-bottom: 20px;">
          <el-form-item label="订单状态">
            <el-select v-model="filterStatus" placeholder="全部状态" clearable style="width: 150px;">
              <el-option
                v-for="(item, key) in mockOrderStatuses"
                :key="key"
                :label="item.label"
                :value="key"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="applyFilter">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
        
        <div v-if="filteredOrders.length === 0" class="empty-state">
          <el-icon><Document /></el-icon>
          <p>暂无订单数据</p>
          <el-button v-if="userStore.isCustomer" type="primary" @click="goCreateOrder">
            发布第一个需求
          </el-button>
        </div>
        
        <div v-else>
          <div v-for="order in filteredOrders" :key="order.id" class="order-card">
            <el-card shadow="hover" @click="viewOrder(order.id)">
              <div class="flex-between">
                <div style="display: flex; align-items: center; gap: 16px; cursor: pointer;">
                  <div>
                    <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
                      {{ order.title }}
                    </div>
                    <div style="display: flex; gap: 16px; color: #909399; font-size: 14px;">
                      <span>订单号：{{ order.id }}</span>
                      <span>类型：{{ order.flightType }}</span>
                      <span>创建时间：{{ order.createdAt }}</span>
                    </div>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 16px;">
                  <div style="text-align: right;">
                    <div style="color: #409eff; font-size: 20px; font-weight: 600;">
                      {{ order.price > 0 ? `¥${order.price}` : '待报价' }}
                    </div>
                  </div>
                  
                  <el-tag :type="getStatusType(order.status)" size="large">
                    {{ getStatusLabel(order.status) }}
                  </el-tag>
                </div>
              </div>
              
              <el-divider style="margin: 12px 0;" />
              
              <div class="flex-between">
                <div style="color: #606266; font-size: 14px;">
                  <el-icon><Location /></el-icon>
                  区域面积：{{ order.area?.areaSize || 0 }} km²
                  <el-divider direction="vertical" />
                  <el-icon><Calendar /></el-icon>
                  期望日期：{{ order.expectedDate }}
                </div>
                
                <div>
                  <el-button type="primary" link @click.stop="viewOrder(order.id)">
                    查看详情
                  </el-button>
                  
                  <el-button
                    v-if="userStore.isProvider && order.status === 'paid'"
                    type="primary"
                    size="small"
                    @click.stop="handleStartFlight(order)"
                  >
                    开始执行
                  </el-button>
                  
                  <el-button
                    v-if="userStore.isCustomer && order.status === 'accepted'"
                    type="primary"
                    size="small"
                    @click.stop="handlePay(order)"
                  >
                    去支付
                  </el-button>
                  
                  <el-button
                    v-if="userStore.isCustomer && order.status === 'completed' && !order.evaluation"
                    type="success"
                    size="small"
                    @click.stop="openEvaluateDialog(order)"
                  >
                    去评价
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-dialog v-model="payDialogVisible" title="订单支付" width="500px">
      <el-steps :active="1" align-center class="payment-steps">
        <el-step title="待支付" />
        <el-step title="已支付" />
        <el-step title="已完成" />
      </el-steps>
      
      <div class="payment-amount">
        <div style="color: #909399; margin-bottom: 8px;">订单金额</div>
        <div class="amount">{{ currentOrder?.price }}</div>
      </div>
      
      <template #footer>
        <el-button @click="payDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="paying" @click="confirmPay">
          确认支付
        </el-button>
      </template>
    </el-dialog>
    
    <el-dialog v-model="evaluateDialogVisible" title="订单评价" width="500px">
      <el-form :model="evaluateForm" label-width="80px">
        <el-form-item label="服务评分">
          <el-rate v-model="evaluateForm.rating" :max="5" show-text />
        </el-form-item>
        <el-form-item label="评价内容">
          <el-input
            v-model="evaluateForm.content"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评价..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="evaluateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="evaluating" @click="confirmEvaluate">
          提交评价
        </el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useOrderStore } from '../stores/order'
import { mockOrderStatuses } from '../mock'
import Layout from '../components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const filterStatus = ref('')
const payDialogVisible = ref(false)
const evaluateDialogVisible = ref(false)
const currentOrder = ref(null)
const paying = ref(false)
const evaluating = ref(false)

const evaluateForm = reactive({
  rating: 5,
  content: ''
})

const myOrders = computed(() => {
  if (userStore.isCustomer) {
    return orderStore.getOrdersByCustomerId(userStore.currentUser.id)
  } else {
    return orderStore.getOrdersByProviderId(userStore.currentUser.id)
  }
})

const filteredOrders = computed(() => {
  if (!filterStatus.value) return myOrders.value
  return myOrders.value.filter(o => o.status === filterStatus.value)
})

const getStatusType = (status) => mockOrderStatuses[status]?.color || 'info'
const getStatusLabel = (status) => mockOrderStatuses[status]?.label || '未知'

const goCreateOrder = () => router.push('/orders/new')
const viewOrder = (id) => router.push(`/orders/${id}`)

const applyFilter = () => {
}

const resetFilter = () => {
  filterStatus.value = ''
}

const handleStartFlight = async (order) => {
  try {
    await ElMessageBox.confirm('确定要开始执行此飞行任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    orderStore.startFlight(order.id)
    ElMessage.success('已开始执行飞行任务')
  } catch {
  }
}

const handlePay = (order) => {
  currentOrder.value = order
  payDialogVisible.value = true
}

const confirmPay = async () => {
  paying.value = true
  
  setTimeout(() => {
    paying.value = false
    orderStore.payOrder(currentOrder.value.id)
    payDialogVisible.value = false
    ElMessage.success('支付成功！服务商已收到通知，即将开始执行')
  }, 1500)
}

const openEvaluateDialog = (order) => {
  currentOrder.value = order
  evaluateForm.rating = 5
  evaluateForm.content = ''
  evaluateDialogVisible.value = true
}

const confirmEvaluate = () => {
  if (!evaluateForm.rating) {
    ElMessage.warning('请先选择评分')
    return
  }
  
  evaluating.value = true
  
  setTimeout(() => {
    evaluating.value = false
    orderStore.evaluateOrder(currentOrder.value.id, {
      rating: evaluateForm.rating,
      content: evaluateForm.content
    })
    evaluateDialogVisible.value = false
    ElMessage.success('评价提交成功！')
  }, 500)
}
</script>
