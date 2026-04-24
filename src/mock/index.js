export const mockUsers = [
  {
    id: 1,
    username: 'customer1',
    password: '123456',
    role: 'customer',
    name: '张三',
    phone: '13800138001',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  },
  {
    id: 2,
    username: 'provider1',
    password: '123456',
    role: 'provider',
    name: '李四',
    phone: '13800138002',
    company: '蓝天无人机服务公司',
    avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
  }
]

export const mockOrders = [
  {
    id: 'ORD2024001',
    customerId: 1,
    providerId: 2,
    title: '工业园航拍需求',
    description: '需要对新建工业园进行高清航拍，用于宣传资料制作',
    status: 'pending',
    price: 0,
    area: {
      type: 'polygon',
      coordinates: [
        [116.397, 39.908],
        [116.407, 39.908],
        [116.407, 39.918],
        [116.397, 39.918]
      ],
      center: [116.402, 39.913],
      areaSize: 1.2
    },
    flightType: '航拍',
    urgency: 'normal',
    expectedDate: '2024-05-15',
    createdAt: '2024-04-20 10:30:00',
    acceptedAt: null,
    paidAt: null,
    completedAt: null,
    flightResult: null,
    evaluation: null
  }
]

export const generateOrderId = () => {
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD${year}${random}`
}

export const mockFlightTypes = [
  { value: '航拍', label: '航拍摄影' },
  { value: '巡检', label: '电力巡检' },
  { value: '测绘', label: '地形测绘' },
  { value: '监测', label: '环境监测' },
  { value: '植保', label: '农林植保' },
  { value: '搜救', label: '应急搜救' }
]

export const mockUrgencyLevels = [
  { value: 'low', label: '普通', color: 'success' },
  { value: 'normal', label: '一般', color: 'primary' },
  { value: 'high', label: '紧急', color: 'warning' },
  { value: 'urgent', label: '非常紧急', color: 'danger' }
]

export const mockOrderStatuses = {
  pending: { label: '待接单', color: 'info' },
  accepted: { label: '待支付', color: 'warning' },
  paid: { label: '待执行', color: 'primary' },
  executing: { label: '执行中', color: 'warning' },
  completed: { label: '已完成', color: 'success' },
  cancelled: { label: '已取消', color: 'danger' }
}

export const generateFlightTrail = (center, start, end) => {
  const trails = []
  const steps = 50
  const startTime = new Date(start).getTime()
  const endTime = new Date(end).getTime()
  const interval = (endTime - startTime) / steps

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps
    const offset = (Math.random() - 0.5) * 0.01
    trails.push({
      lat: center[1] + offset + Math.sin(progress * Math.PI * 4) * 0.005,
      lng: center[0] + offset + Math.cos(progress * Math.PI * 4) * 0.005,
      altitude: 100 + Math.sin(progress * Math.PI * 2) * 20,
      speed: 15 + Math.random() * 5,
      timestamp: new Date(startTime + interval * i).toISOString()
    })
  }
  return trails
}
