import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { mockOrders, generateOrderId, generateFlightTrail } from '../mock'

export const useOrderStore = defineStore('order', () => {
  const orders = ref([...mockOrders])

  const allOrders = computed(() => orders.value)

  const getOrdersByCustomerId = (customerId) => {
    return orders.value.filter(o => o.customerId === customerId)
  }

  const getPendingOrders = () => {
    return orders.value.filter(o => o.status === 'pending')
  }

  const getOrdersByProviderId = (providerId) => {
    return orders.value.filter(o => o.providerId === providerId)
  }

  const getOrderById = (orderId) => {
    return orders.value.find(o => o.id === orderId)
  }

  const createOrder = (orderData, customerId) => {
    const newOrder = {
      id: generateOrderId(),
      customerId,
      providerId: null,
      ...orderData,
      status: 'pending',
      price: 0,
      createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      acceptedAt: null,
      paidAt: null,
      completedAt: null,
      flightResult: null,
      evaluation: null
    }
    orders.value.unshift(newOrder)
    return { success: true, order: newOrder }
  }

  const acceptOrder = (orderId, providerId, price) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === 'pending') {
      order.providerId = providerId
      order.price = price
      order.status = 'accepted'
      order.acceptedAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
      return { success: true, order }
    }
    return { success: false, message: '订单状态错误' }
  }

  const payOrder = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === 'accepted') {
      order.status = 'paid'
      order.paidAt = new Date().toISOString().slice(0, 19).replace('T', ' ')
      return { success: true, order }
    }
    return { success: false, message: '订单状态错误' }
  }

  const startFlight = (orderId) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === 'paid') {
      order.status = 'executing'
      return { success: true, order }
    }
    return { success: false, message: '订单状态错误' }
  }

  const completeFlight = (orderId, resultData) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === 'executing') {
      const now = new Date()
      const startTime = new Date(now.getTime() - 3600000)
      
      order.status = 'completed'
      order.completedAt = now.toISOString().slice(0, 19).replace('T', ' ')
      order.flightResult = {
        ...resultData,
        trails: generateFlightTrail(order.area.center, startTime, now),
        photos: [
          'https://picsum.photos/400/300?random=1',
          'https://picsum.photos/400/300?random=2',
          'https://picsum.photos/400/300?random=3'
        ],
        report: resultData.report || '飞行任务已完成，数据已采集完毕。'
      }
      return { success: true, order }
    }
    return { success: false, message: '订单状态错误' }
  }

  const evaluateOrder = (orderId, evaluationData) => {
    const order = orders.value.find(o => o.id === orderId)
    if (order && order.status === 'completed' && !order.evaluation) {
      order.evaluation = {
        ...evaluationData,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
      }
      return { success: true, order }
    }
    return { success: false, message: '无法评价此订单' }
  }

  return {
    orders,
    allOrders,
    getOrdersByCustomerId,
    getPendingOrders,
    getOrdersByProviderId,
    getOrderById,
    createOrder,
    acceptOrder,
    payOrder,
    startFlight,
    completeFlight,
    evaluateOrder
  }
})
