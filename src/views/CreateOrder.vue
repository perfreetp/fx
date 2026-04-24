<template>
  <Layout>
    <div>
      <el-card>
        <template #header>
          <span class="card-title">发布飞行需求</span>
        </template>
        
        <el-form
          :model="orderForm"
          :rules="rules"
          ref="orderFormRef"
          label-width="120px"
          style="max-width: 900px;"
        >
          <el-form-item label="需求标题" prop="title">
            <el-input
              v-model="orderForm.title"
              placeholder="请输入需求标题，如：工业园航拍需求"
              maxlength="100"
              show-word-limit
            />
          </el-form-item>
          
          <el-form-item label="需求描述" prop="description">
            <el-input
              v-model="orderForm.description"
              type="textarea"
              :rows="4"
              placeholder="请详细描述您的飞行需求..."
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="飞行类型" prop="flightType">
                <el-select v-model="orderForm.flightType" placeholder="请选择飞行类型" style="width: 100%;">
                  <el-option
                    v-for="type in mockFlightTypes"
                    :key="type.value"
                    :label="type.label"
                    :value="type.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="紧急程度" prop="urgency">
                <el-select v-model="orderForm.urgency" placeholder="请选择紧急程度" style="width: 100%;">
                  <el-option
                    v-for="level in mockUrgencyLevels"
                    :key="level.value"
                    :label="level.label"
                    :value="level.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="期望日期" prop="expectedDate">
            <el-date-picker
              v-model="orderForm.expectedDate"
              type="date"
              placeholder="选择期望执行日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              :disabled-date="disabledDate"
              style="width: 100%;"
            />
          </el-form-item>
        </el-form>
        
        <div style="margin-top: 20px;">
          <div style="display: flex; align-items: center; margin-bottom: 12px;">
            <span style="width: 120px; font-weight: 500; color: #606266;">
              <span style="color: #f56c6c; margin-right: 4px;">*</span>
              飞行区域
            </span>
          </div>
          <MapPlanner v-model="orderForm.area" />
          <div
            v-if="orderForm.area"
            style="
              margin-top: 12px;
              padding: 12px;
              background: #f5f7fa;
              border-radius: 8px;
              display: flex;
              gap: 24px;
            "
          >
            <span>
              <el-icon color="#409eff"><Location /></el-icon>
              区域类型：{{ orderForm.area.type === 'polygon' ? '多边形' : '圆形' }}
            </span>
            <span>
              <el-icon color="#409eff"><DataLine /></el-icon>
              区域面积：{{ orderForm.area.areaSize?.toFixed(2) || 0 }} km²
            </span>
          </div>
        </div>
        
        <el-form style="margin-top: 20px;">
          
          <el-form-item>
            <el-button type="primary" :loading="submitting" size="large" @click="handleSubmit">
              <el-icon><Check /></el-icon>
              发布需求
            </el-button>
            <el-button size="large" @click="resetForm">
              重置
            </el-button>
            <el-button size="large" @click="goBack">
              取消
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </Layout>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useOrderStore } from '../stores/order'
import { mockFlightTypes, mockUrgencyLevels } from '../mock'
import Layout from '../components/Layout.vue'
import MapPlanner from '../components/MapPlanner.vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

const orderFormRef = ref(null)
const submitting = ref(false)

const orderForm = reactive({
  title: '',
  description: '',
  flightType: '',
  urgency: 'normal',
  expectedDate: '',
  area: null
})

const rules = {
  title: [
    { required: true, message: '请输入需求标题', trigger: 'blur' },
    { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入需求描述', trigger: 'blur' }
  ],
  flightType: [
    { required: true, message: '请选择飞行类型', trigger: 'change' }
  ],
  expectedDate: [
    { required: true, message: '请选择期望日期', trigger: 'change' }
  ]
}

const disabledDate = (time) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return time.getTime() < today.getTime() - 86400000
}

const handleSubmit = async () => {
  if (!orderFormRef.value) return
  
  await orderFormRef.value.validate(async (valid) => {
    if (valid) {
      if (!orderForm.area) {
        ElMessage.warning('请在地图上规划飞行区域')
        return
      }
      
      try {
        await ElMessageBox.confirm('确认发布此飞行需求吗？', '确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        })
        
        submitting.value = true
        
        setTimeout(() => {
          const result = orderStore.createOrder(orderForm, userStore.currentUser.id)
          submitting.value = false
          
          if (result.success) {
            ElMessage.success('需求发布成功！等待服务商接单')
            router.push('/orders')
          } else {
            ElMessage.error('发布失败，请重试')
          }
        }, 1000)
      } catch {
      }
    }
  })
}

const resetForm = () => {
  orderFormRef.value?.resetFields()
  orderForm.area = null
}

const goBack = () => {
  router.push('/orders')
}
</script>
