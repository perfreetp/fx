<template>
  <Layout>
    <div>
      <el-card>
        <template #header>
          <div class="flex-between">
            <span class="card-title">需求市场</span>
            <el-button type="primary" @click="refresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
        </template>
        
        <div v-if="pendingOrders.length === 0" class="empty-state">
          <el-icon><Shop /></el-icon>
          <p>暂无待接单的需求</p>
          <p style="color: #909399; font-size: 14px; margin-top: 8px;">
            稍后再查看或关注系统通知
          </p>
        </div>
        
        <div v-else>
          <div v-for="order in pendingOrders" :key="order.id" class="order-card">
            <el-card shadow="hover">
              <div class="flex-between">
                <div>
                  <div style="font-size: 18px; font-weight: 600; margin-bottom: 8px;">
                    {{ order.title }}
                  </div>
                  <div style="display: flex; gap: 16px; color: #909399; font-size: 14px; margin-bottom: 12px;">
                    <span>订单号：{{ order.id }}</span>
                    <span>
                      <el-tag :type="getUrgencyType(order.urgency)" size="small">
                        {{ getUrgencyLabel(order.urgency) }}
                      </el-tag>
                    </span>
                    <span>发布时间：{{ order.createdAt }}</span>
                  </div>
                  <p style="color: #606266; margin-bottom: 12px;">
                    {{ order.description }}
                  </p>
                  <div style="display: flex; gap: 24px; color: #909399; font-size: 14px;">
                    <span>
                      <el-icon><Promotion /></el-icon>
                      飞行类型：{{ order.flightType }}
                    </span>
                    <span>
                      <el-icon><Location /></el-icon>
                      区域面积：{{ order.area?.areaSize?.toFixed(2) || 0 }} km²
                    </span>
                    <span>
                      <el-icon><Calendar /></el-icon>
                      期望日期：{{ order.expectedDate }}
                    </span>
                  </div>
                </div>
                
                <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 12px;">
                  <div style="text-align: right;">
                    <div style="color: #909399; font-size: 14px;">参考报价</div>
                    <div style="color: #409eff; font-size: 24px; font-weight: 600;">
                      ¥{{ calculateQuote(order) }}
                    </div>
                  </div>
                  <el-button type="primary" size="large" @click="openAcceptDialog(order)">
                    <el-icon><Check /></el-icon>
                    立即接单
                  </el-button>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-card>
    </div>
    
    <el-dialog v-model="acceptDialogVisible" title="接单确认" width="500px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="订单号">
          {{ currentOrder?.id }}
        </el-descriptions-item>
        <el-descriptions-item label="需求标题">
          {{ currentOrder?.title }}
        </el-descriptions-item>
        <el-descriptions-item label="飞行类型">
          {{ currentOrder?.flightType }}
        </el-descriptions-item>
        <el-descriptions-item label="区域面积">
          {{ currentOrder?.area?.areaSize?.toFixed(2) || 0 }} km²
        </el-descriptions-item>
        <el-descriptions-item label="期望日期">
          {{ currentOrder?.expectedDate }}
        </el-descriptions-item>
      </el-descriptions>
      
      <el-divider />
      
      <el-form :model="acceptForm" label-width="80px">
        <el-form-item label="报价金额" required>
          <el-input-number
            v-model="acceptForm.price"
            :min="100"
            :max="100000"
            :step="100"
            style="width: 100%;"
          >
            <template #suffix>元</template>
          </el-input-number>
          <div style="color: #909399; font-size: 12px; margin-top: 8px;">
            提示：系统参考报价为 ¥{{ currentOrder ? calculateQuote(currentOrder) : 0 }}
          </div>
        </el-form-item>
        
        <el-form-item label="备注说明">
          <el-input
            v-model="acceptForm.remark"
            type="textarea"
            :rows="3"
            placeholder="可选：填写服务说明或备注..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="acceptDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="accepting" @click="confirmAccept">
          确认接单
        </el-button>
      </template>
    </el-dialog>
  </Layout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order'
import { useUserStore } from '../stores/user'
import { mockUrgencyLevels, mockOrderStatuses } from '../mock'
import Layout from '../components/Layout.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

const acceptDialogVisible = ref(false)
const currentOrder = ref(null)
const accepting = ref(false)

const acceptForm = reactive({
  price: 0,
  remark: ''
})

const pendingOrders = computed(() => orderStore.getPendingOrders())

const getUrgencyType = (urgency) => {
  const level = mockUrgencyLevels.find(l => l.value === urgency)
  return level?.color || 'info'
}

const getUrgencyLabel = (urgency) => {
  const level = mockUrgencyLevels.find(l => l.value === urgency)
  return level?.label || '未知'
}

const calculateQuote = (order) => {
  if (!order || !order.area) return 0
  const basePrice = 500
  const areaPrice = (order.area.areaSize || 0) * 200
  const typeMultiplier = {
    '航拍': 1,
    '巡检': 1.2,
    '测绘': 1.5,
    '监测': 1.3,
    '植保': 0.8,
    '搜救': 2
  }
  const urgencyMultiplier = {
    'low': 0.8,
    'normal': 1,
    'high': 1.3,
    'urgent': 1.8
  }
  const base = basePrice + areaPrice
  const type = typeMultiplier[order.flightType] || 1
  const urgency = urgencyMultiplier[order.urgency] || 1
  
  return Math.round(base * type * urgency)
}

const refresh = () => {
  ElMessage.success('已刷新')
}

const openAcceptDialog = (order) => {
  currentOrder.value = order
  acceptForm.price = calculateQuote(order)
  acceptForm.remark = ''
  acceptDialogVisible.value = true
}

const confirmAccept = async () => {
  if (!acceptForm.price || acceptForm.price < 100) {
    ElMessage.warning('请输入有效的报价金额')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认接单吗？接单后客户将收到通知进行支付。', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    accepting.value = true
    
    setTimeout(() => {
      accepting.value = false
      const result = orderStore.acceptOrder(
        currentOrder.value.id,
        userStore.currentUser.id,
        acceptForm.price
      )
      
      if (result.success) {
        acceptDialogVisible.value = false
        ElMessage.success('接单成功！等待客户支付后即可开始执行')
      } else {
        ElMessage.error(result.message || '接单失败')
      }
    }, 1000)
  } catch {
  }
}
</script>
