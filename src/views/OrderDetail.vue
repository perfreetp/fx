<template>
  <Layout>
    <div v-if="order">
      <el-card>
        <template #header>
          <div class="flex-between">
            <div style="display: flex; align-items: center; gap: 16px;">
              <el-button text @click="goBack">
                <el-icon><ArrowLeft /></el-icon>
                返回
              </el-button>
              <span class="card-title">订单详情</span>
              <el-tag :type="getStatusType(order.status)" size="large">
                {{ getStatusLabel(order.status) }}
              </el-tag>
            </div>
            <span>{{ order.id }}</span>
          </div>
        </template>
        
        <el-steps :active="getStepActive()" align-center style="margin-bottom: 30px;">
          <el-step title="发布需求" :status="order.status !== 'pending' ? 'success' : 'process'" />
          <el-step title="服务商接单" :status="['accepted', 'paid', 'executing', 'completed'].includes(order.status) ? 'success' : (order.status === 'pending' ? 'wait' : 'error')" />
          <el-step title="客户支付" :status="['paid', 'executing', 'completed'].includes(order.status) ? 'success' : (order.status === 'accepted' ? 'process' : 'wait')" />
          <el-step title="执行飞行" :status="['executing', 'completed'].includes(order.status) ? 'process' : 'wait'" />
          <el-step title="完成评价" :status="order.status === 'completed' ? (order.evaluation ? 'success' : 'process') : 'wait'" />
        </el-steps>
        
        <el-row :gutter="20">
          <el-col :span="16">
            <el-card style="margin-bottom: 20px;">
              <template #header>
                <span class="card-title">基本信息</span>
              </template>
              
              <el-descriptions :column="2" border>
                <el-descriptions-item label="需求标题" :span="2">
                  {{ order.title }}
                </el-descriptions-item>
                <el-descriptions-item label="需求描述" :span="2">
                  {{ order.description }}
                </el-descriptions-item>
                <el-descriptions-item label="飞行类型">
                  {{ order.flightType }}
                </el-descriptions-item>
                <el-descriptions-item label="紧急程度">
                  <el-tag :type="getUrgencyType(order.urgency)">
                    {{ getUrgencyLabel(order.urgency) }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="期望日期">
                  {{ order.expectedDate }}
                </el-descriptions-item>
                <el-descriptions-item label="订单金额">
                  <span style="color: #409eff; font-size: 18px; font-weight: 600;">
                    {{ order.price > 0 ? `¥${order.price}` : '待报价' }}
                  </span>
                </el-descriptions-item>
              </el-descriptions>
            </el-card>
            
            <el-card style="margin-bottom: 20px;">
              <template #header>
                <span class="card-title">飞行区域</span>
              </template>
              
              <div v-if="order.area">
                <MapPlanner v-model="order.area" :read-only="true" />
                <div style="margin-top: 12px; padding: 12px; background: #f5f7fa; border-radius: 8px; display: flex; gap: 24px;">
                  <span>
                    <el-icon color="#409eff"><Location /></el-icon>
                    区域类型：{{ order.area.type === 'polygon' ? '多边形' : '圆形' }}
                  </span>
                  <span>
                    <el-icon color="#409eff"><DataLine /></el-icon>
                    区域面积：{{ order.area.areaSize?.toFixed(2) || 0 }} km²
                  </span>
                </div>
              </div>
              <div v-else class="empty-state" style="padding: 40px;">
                <el-icon><Location /></el-icon>
                <p>暂无区域数据</p>
              </div>
            </el-card>
            
            <el-card v-if="order.flightResult">
              <template #header>
                <span class="card-title">飞行结果</span>
              </template>
              
              <div style="margin-bottom: 20px;">
                <h4 style="margin-bottom: 12px;">飞行轨迹</h4>
                <TrailMap :trails="order.flightResult.trails" :area="order.area" />
                
                <div class="trail-info" style="margin-top: 16px;">
                  <div class="trail-info-item">
                    <el-icon color="#409eff"><Clock /></el-icon>
                    <span>飞行时长：约 60 分钟</span>
                  </div>
                  <div class="trail-info-item">
                    <el-icon color="#409eff"><Promotion /></el-icon>
                    <span>平均速度：{{ calculateAvgSpeed(order.flightResult.trails) }} m/s</span>
                  </div>
                  <div class="trail-info-item">
                    <el-icon color="#409eff"><TrendCharts /></el-icon>
                    <span>平均高度：{{ calculateAvgAltitude(order.flightResult.trails) }} m</span>
                  </div>
                </div>
              </div>
              
              <el-divider />
              
              <div v-if="order.flightResult.photos && order.flightResult.photos.length > 0">
                <h4 style="margin-bottom: 12px;">拍摄照片</h4>
                <div class="photo-grid">
                  <div
                    v-for="(photo, index) in order.flightResult.photos"
                    :key="index"
                    class="photo-item"
                    @click="previewPhoto(photo)"
                  >
                    <img :src="photo" :alt="`照片 ${index + 1}`" />
                  </div>
                </div>
              </div>
              
              <el-divider v-if="order.flightResult.report" />
              
              <div v-if="order.flightResult.report">
                <h4 style="margin-bottom: 12px;">飞行报告</h4>
                <el-input
                  :model-value="order.flightResult.report"
                  type="textarea"
                  :rows="4"
                  readonly
                />
              </div>
            </el-card>
            
            <el-card v-if="order.evaluation" style="margin-top: 20px;">
              <template #header>
                <span class="card-title">用户评价</span>
              </template>
              
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <span>评分：</span>
                <el-rate :model-value="order.evaluation.rating" disabled show-text />
                <span style="color: #909399; font-size: 12px;">
                  {{ order.evaluation.createdAt }}
                </span>
              </div>
              
              <div v-if="order.evaluation.content" style="color: #606266;">
                {{ order.evaluation.content }}
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card style="margin-bottom: 20px;">
              <template #header>
                <span class="card-title">时间线</span>
              </template>
              
              <el-timeline>
                <el-timeline-item timestamp="发布于" placement="top">
                  <template #dot>
                    <el-icon size="18" color="#67c23a"><Document /></el-icon>
                  </template>
                  <p style="font-size: 14px;">订单创建</p>
                  <p style="color: #909399; font-size: 12px;">{{ order.createdAt }}</p>
                </el-timeline-item>
                
                <el-timeline-item v-if="order.acceptedAt" timestamp="接单于" placement="top">
                  <template #dot>
                    <el-icon size="18" color="#409eff"><User /></el-icon>
                  </template>
                  <p style="font-size: 14px;">服务商已接单</p>
                  <p style="color: #909399; font-size: 12px;">{{ order.acceptedAt }}</p>
                </el-timeline-item>
                
                <el-timeline-item v-if="order.paidAt" timestamp="支付于" placement="top">
                  <template #dot>
                    <el-icon size="18" color="#e6a23c"><Money /></el-icon>
                  </template>
                  <p style="font-size: 14px;">已支付 ¥{{ order.price }}</p>
                  <p style="color: #909399; font-size: 12px;">{{ order.paidAt }}</p>
                </el-timeline-item>
                
                <el-timeline-item v-if="order.completedAt" timestamp="完成于" placement="top">
                  <template #dot>
                    <el-icon size="18" color="#67c23a"><CircleCheck /></el-icon>
                  </template>
                  <p style="font-size: 14px;">飞行任务完成</p>
                  <p style="color: #909399; font-size: 12px;">{{ order.completedAt }}</p>
                </el-timeline-item>
                
                <el-timeline-item v-if="order.evaluation" timestamp="评价于" placement="top">
                  <template #dot>
                    <el-icon size="18" color="#f56c6c"><Star /></el-icon>
                  </template>
                  <p style="font-size: 14px;">用户已评价</p>
                  <p style="color: #909399; font-size: 12px;">{{ order.evaluation.createdAt }}</p>
                </el-timeline-item>
              </el-timeline>
            </el-card>
            
            <el-card>
              <template #header>
                <span class="card-title">操作</span>
              </template>
              
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <el-button
                  v-if="userStore.isCustomer && order.status === 'accepted'"
                  type="primary"
                  size="large"
                  @click="handlePay"
                >
                  <el-icon><Money /></el-icon>
                  去支付
                </el-button>
                
                <el-button
                  v-if="userStore.isProvider && order.status === 'paid'"
                  type="primary"
                  size="large"
                  @click="handleStartFlight"
                >
                  <el-icon><Promotion /></el-icon>
                  开始执行
                </el-button>
                
                <el-button
                  v-if="userStore.isProvider && order.status === 'executing'"
                  type="success"
                  size="large"
                  @click="handleCompleteFlight"
                >
                  <el-icon><CircleCheck /></el-icon>
                  完成飞行
                </el-button>
                
                <el-button
                  v-if="userStore.isCustomer && order.status === 'completed' && !order.evaluation"
                  type="warning"
                  size="large"
                  @click="openEvaluateDialog"
                >
                  <el-icon><Star /></el-icon>
                  去评价
                </el-button>
                
                <el-button
                  v-if="['pending', 'accepted'].includes(order.status)"
                  size="large"
                  type="danger"
                  text
                >
                  <el-icon><Delete /></el-icon>
                  取消订单
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>
    </div>
    
    <div v-else class="empty-state" style="margin-top: 100px;">
      <el-icon><Document /></el-icon>
      <p>订单不存在</p>
      <el-button type="primary" @click="goBack" style="margin-top: 16px;">
        返回订单列表
      </el-button>
    </div>
    
    <el-dialog v-model="payDialogVisible" title="订单支付" width="500px">
      <el-steps :active="1" align-center class="payment-steps">
        <el-step title="待支付" />
        <el-step title="已支付" />
        <el-step title="已完成" />
      </el-steps>
      
      <div class="payment-amount">
        <div style="color: #909399; margin-bottom: 8px;">订单金额</div>
        <div class="amount">{{ order?.price }}</div>
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
    
    <el-dialog v-model="completeDialogVisible" title="完成飞行" width="500px">
      <el-form :model="completeForm" label-width="100px">
        <el-form-item label="飞行报告">
          <el-input
            v-model="completeForm.report"
            type="textarea"
            :rows="4"
            placeholder="请输入飞行任务报告..."
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="completeDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="completing" @click="confirmComplete">
          确认完成
        </el-button>
      </template>
    </el-dialog>
    
    <el-image-viewer
      v-if="previewVisible"
      :url-list="previewImageList"
      :initial-index="previewIndex"
      @close="previewVisible = false"
    />
  </Layout>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '../stores/order'
import { useUserStore } from '../stores/user'
import { mockOrderStatuses, mockUrgencyLevels } from '../mock'
import Layout from '../components/Layout.vue'
import MapPlanner from '../components/MapPlanner.vue'
import TrailMap from '../components/TrailMap.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()
const userStore = useUserStore()

const orderId = computed(() => route.params.id)
const order = computed(() => orderStore.getOrderById(orderId.value))

const payDialogVisible = ref(false)
const evaluateDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const paying = ref(false)
const evaluating = ref(false)
const completing = ref(false)

const previewVisible = ref(false)
const previewImageList = ref([])
const previewIndex = ref(0)

const evaluateForm = reactive({
  rating: 5,
  content: ''
})

const completeForm = reactive({
  report: '飞行任务已完成，数据采集正常，照片清晰可用。区域内无异常情况，所有预设飞行点均已覆盖。'
})

const getStatusType = (status) => mockOrderStatuses[status]?.color || 'info'
const getStatusLabel = (status) => mockOrderStatuses[status]?.label || '未知'

const getUrgencyType = (urgency) => {
  const level = mockUrgencyLevels.find(l => l.value === urgency)
  return level?.color || 'info'
}

const getUrgencyLabel = (urgency) => {
  const level = mockUrgencyLevels.find(l => l.value === urgency)
  return level?.label || '未知'
}

const getStepActive = () => {
  if (!order.value) return 0
  const statusMap = {
    'pending': 0,
    'accepted': 1,
    'paid': 2,
    'executing': 3,
    'completed': 4,
    'cancelled': 0
  }
  return statusMap[order.value.status] || 0
}

const calculateAvgSpeed = (trails) => {
  if (!trails || trails.length === 0) return 0
  const total = trails.reduce((sum, t) => sum + (t.speed || 0), 0)
  return Math.round(total / trails.length)
}

const calculateAvgAltitude = (trails) => {
  if (!trails || trails.length === 0) return 0
  const total = trails.reduce((sum, t) => sum + (t.altitude || 0), 0)
  return Math.round(total / trails.length)
}

const goBack = () => {
  router.push('/orders')
}

const handlePay = () => {
  payDialogVisible.value = true
}

const confirmPay = async () => {
  paying.value = true
  
  setTimeout(() => {
    paying.value = false
    orderStore.payOrder(orderId.value)
    payDialogVisible.value = false
    ElMessage.success('支付成功！服务商已收到通知，即将开始执行')
  }, 1500)
}

const handleStartFlight = async () => {
  try {
    await ElMessageBox.confirm('确定要开始执行此飞行任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    orderStore.startFlight(orderId.value)
    ElMessage.success('已开始执行飞行任务')
  } catch {
  }
}

const handleCompleteFlight = () => {
  completeDialogVisible.value = true
}

const confirmComplete = async () => {
  completing.value = true
  
  setTimeout(() => {
    completing.value = false
    orderStore.completeFlight(orderId.value, {
      report: completeForm.report
    })
    completeDialogVisible.value = false
    ElMessage.success('飞行任务已完成！结果已提交')
  }, 1000)
}

const openEvaluateDialog = () => {
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
    orderStore.evaluateOrder(orderId.value, {
      rating: evaluateForm.rating,
      content: evaluateForm.content
    })
    evaluateDialogVisible.value = false
    ElMessage.success('评价提交成功！')
  }, 500)
}

const previewPhoto = (photo) => {
  previewImageList.value = order.value?.flightResult?.photos || [photo]
  previewIndex.value = previewImageList.value.indexOf(photo)
  previewVisible.value = true
}
</script>
