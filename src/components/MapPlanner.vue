<template>
  <div ref="mapContainer" class="map-container" style="height: 500px; position: relative;">
    <div class="map-toolbar">
      <el-button-group>
        <el-button :type="toolMode === 'pan' ? 'primary' : 'default'" @click="setToolMode('pan')">
          <el-icon><Hand /></el-icon>
          浏览
        </el-button>
        <el-button :type="toolMode === 'polygon' ? 'primary' : 'default'" @click="setToolMode('polygon')">
          <el-icon><Share /></el-icon>
          画区域
        </el-button>
        <el-button :type="toolMode === 'circle' ? 'primary' : 'default'" @click="setToolMode('circle')">
          <el-icon><CircleCheck /></el-icon>
          画圆形
        </el-button>
      </el-button-group>
      <el-button @click="clearArea" type="danger" :disabled="!hasArea">
        <el-icon><Delete /></el-icon>
        清除
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import L from 'leaflet'

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  readOnly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const mapContainer = ref(null)
const map = ref(null)
const toolMode = ref('pan')
const drawingPolygon = ref(false)
const tempPoints = ref([])
const tempMarkers = ref([])
const tempPolygon = ref(null)
const currentLayer = ref(null)
const circleMarker = ref(null)
const hasArea = ref(false)

const calculateArea = (coordinates) => {
  if (!coordinates || coordinates.length < 3) return 0
  
  let area = 0
  const R = 6371
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const j = (i + 1) % coordinates.length
    const lat1 = coordinates[i][1] * Math.PI / 180
    const lat2 = coordinates[j][1] * Math.PI / 180
    const dLng = (coordinates[j][0] - coordinates[i][0]) * Math.PI / 180
    
    area += dLng * (2 + Math.sin(lat1) + Math.sin(lat2))
  }
  
  return Math.abs(area * R * R / 2)
}

const calculateCircleArea = (center, radius) => {
  const R = 6371
  const lat = center[1] * Math.PI / 180
  const dLat = radius / 1000 / R
  
  return Math.PI * (dLat * R * Math.cos(lat)) * (dLat * R)
}

const initMap = () => {
  if (!mapContainer.value) return
  
  map.value = L.map(mapContainer.value).setView([39.908, 116.397], 13)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)
  
  if (props.modelValue) {
    drawExistingArea(props.modelValue)
  }
  
  if (!props.readOnly) {
    map.value.on('click', handleMapClick)
  }
}

const handleMapClick = (e) => {
  if (toolMode.value === 'polygon' && drawingPolygon.value) {
    const point = [e.latlng.lng, e.latlng.lat]
    tempPoints.value.push(point)
    
    const marker = L.circleMarker(e.latlng, {
      radius: 6,
      fillColor: '#409eff',
      color: '#409eff',
      weight: 2,
      fillOpacity: 0.8
    }).addTo(map.value)
    
    tempMarkers.value.push(marker)
    
    if (tempPoints.value.length >= 3) {
      if (tempPolygon.value) {
        map.value.removeLayer(tempPolygon.value)
      }
      
      const latlngs = tempPoints.value.map(p => [p[1], p[0]])
      latlngs.push([tempPoints.value[0][1], tempPoints.value[0][0]])
      
      tempPolygon.value = L.polygon(latlngs, {
        color: '#409eff',
        weight: 3,
        fillColor: '#409eff',
        fillOpacity: 0.3
      }).addTo(map.value)
    }
  }
}

const setToolMode = (mode) => {
  toolMode.value = mode
  
  if (drawingPolygon.value) {
    finishPolygon()
  }
  
  if (mode === 'polygon') {
    if (!props.readOnly) {
      startDrawingPolygon()
    }
  } else if (mode === 'circle') {
    startDrawingCircle()
  }
}

const startDrawingPolygon = () => {
  drawingPolygon.value = true
  tempPoints.value = []
  tempMarkers.value.forEach(m => map.value.removeLayer(m))
  tempMarkers.value = []
  if (tempPolygon.value) {
    map.value.removeLayer(tempPolygon.value)
    tempPolygon.value = null
  }
  
  ElMessage.info('请在地图上点击选择多边形顶点，完成后双击地图或点击确认')
}

const startDrawingCircle = () => {
  ElMessage.info('请在地图上点击确定圆心，然后拖动设置半径')
  
  const handleCircleClick = (e) => {
    if (circleMarker.value) {
      map.value.removeLayer(circleMarker.value)
    }
    
    const center = [e.latlng.lng, e.latlng.lat]
    
    circleMarker.value = L.circle(e.latlng, {
      radius: 500,
      color: '#409eff',
      weight: 3,
      fillColor: '#409eff',
      fillOpacity: 0.3,
      editable: true
    }).addTo(map.value)
    
    const areaData = {
      type: 'circle',
      center: center,
      radius: 500,
      areaSize: calculateCircleArea(center, 500)
    }
    
    hasArea.value = true
    emit('update:modelValue', areaData)
    
    if (currentLayer.value) {
      map.value.removeLayer(currentLayer.value)
    }
    currentLayer.value = circleMarker.value
    
    map.value.off('click', handleCircleClick)
  }
  
  map.value.once('click', handleCircleClick)
}

const finishPolygon = () => {
  if (tempPoints.value.length >= 3) {
    const coordinates = [...tempPoints.value, tempPoints.value[0]]
    const areaSize = calculateArea(tempPoints.value)
    
    const areaData = {
      type: 'polygon',
      coordinates: coordinates,
      center: getCenter(tempPoints.value),
      areaSize: areaSize
    }
    
    const latlngs = tempPoints.value.map(p => [p[1], p[0]])
    if (currentLayer.value) {
      map.value.removeLayer(currentLayer.value)
    }
    
    currentLayer.value = L.polygon(latlngs, {
      color: '#67c23a',
      weight: 3,
      fillColor: '#67c23a',
      fillOpacity: 0.3
    }).addTo(map.value)
    
    hasArea.value = true
    emit('update:modelValue', areaData)
  }
  
  drawingPolygon.value = false
  tempPoints.value = []
  tempMarkers.value.forEach(m => map.value.removeLayer(m))
  tempMarkers.value = []
  if (tempPolygon.value) {
    map.value.removeLayer(tempPolygon.value)
    tempPolygon.value = null
  }
}

const getCenter = (coordinates) => {
  if (!coordinates || coordinates.length === 0) return [116.397, 39.908]
  
  let lng = 0, lat = 0
  coordinates.forEach(p => {
    lng += p[0]
    lat += p[1]
  })
  
  return [lng / coordinates.length, lat / coordinates.length]
}

const clearArea = () => {
  if (currentLayer.value) {
    map.value.removeLayer(currentLayer.value)
    currentLayer.value = null
  }
  if (circleMarker.value) {
    map.value.removeLayer(circleMarker.value)
    circleMarker.value = null
  }
  
  hasArea.value = false
  emit('update:modelValue', null)
}

const drawExistingArea = (areaData) => {
  if (!areaData || !map.value) return
  
  if (areaData.type === 'polygon' && areaData.coordinates) {
    const latlngs = areaData.coordinates.slice(0, -1).map(p => [p[1], p[0]])
    currentLayer.value = L.polygon(latlngs, {
      color: '#67c23a',
      weight: 3,
      fillColor: '#67c23a',
      fillOpacity: 0.3
    }).addTo(map.value)
    
    map.value.fitBounds(currentLayer.value.getBounds(), { padding: [50, 50] })
    hasArea.value = true
  } else if (areaData.type === 'circle' && areaData.center) {
    circleMarker.value = L.circle([areaData.center[1], areaData.center[0]], {
      radius: areaData.radius || 500,
      color: '#67c23a',
      weight: 3,
      fillColor: '#67c23a',
      fillOpacity: 0.3
    }).addTo(map.value)
    
    map.value.setView([areaData.center[1], areaData.center[0]], 14)
    hasArea.value = true
  }
}

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

watch(() => props.modelValue, (newVal) => {
  if (newVal && map.value) {
    drawExistingArea(newVal)
  }
})

import { ElMessage } from 'element-plus'
</script>
