<template>
  <div ref="mapContainer" class="map-container" style="height: 400px;"></div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import L from 'leaflet'

const props = defineProps({
  trails: {
    type: Array,
    default: () => []
  },
  area: {
    type: Object,
    default: null
  }
})

const mapContainer = ref(null)
const map = ref(null)
const trailLayer = ref(null)
const markers = ref([])
const areaLayer = ref(null)

const initMap = () => {
  if (!mapContainer.value) return
  
  map.value = L.map(mapContainer.value).setView([39.908, 116.397], 13)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map.value)
  
  if (props.area) {
    drawArea(props.area)
  }
  
  if (props.trails && props.trails.length > 0) {
    drawTrails(props.trails)
  }
}

const drawArea = (areaData) => {
  if (!areaData || !map.value) return
  
  if (areaLayer.value) {
    map.value.removeLayer(areaLayer.value)
  }
  
  if (areaData.type === 'polygon' && areaData.coordinates) {
    const latlngs = areaData.coordinates.slice(0, -1).map(p => [p[1], p[0]])
    areaLayer.value = L.polygon(latlngs, {
      color: '#67c23a',
      weight: 3,
      fillColor: '#67c23a',
      fillOpacity: 0.2
    }).addTo(map.value)
    
    map.value.fitBounds(areaLayer.value.getBounds(), { padding: [50, 50] })
  } else if (areaData.type === 'circle' && areaData.center) {
    areaLayer.value = L.circle([areaData.center[1], areaData.center[0]], {
      radius: areaData.radius || 500,
      color: '#67c23a',
      weight: 3,
      fillColor: '#67c23a',
      fillOpacity: 0.2
    }).addTo(map.value)
    
    map.value.setView([areaData.center[1], areaData.center[0]], 14)
  }
}

const drawTrails = (trailData) => {
  if (!trailData || trailData.length === 0 || !map.value) return
  
  if (trailLayer.value) {
    map.value.removeLayer(trailLayer.value)
  }
  
  markers.value.forEach(m => map.value.removeLayer(m))
  markers.value = []
  
  const latlngs = trailData.map(t => [t.lat, t.lng])
  
  trailLayer.value = L.polyline(latlngs, {
    color: '#409eff',
    weight: 4,
    opacity: 0.8
  }).addTo(map.value)
  
  const startMarker = L.circleMarker(latlngs[0], {
    radius: 8,
    fillColor: '#67c23a',
    color: '#67c23a',
    weight: 2,
    fillOpacity: 1
  }).addTo(map.value).bindPopup('起点')
  markers.value.push(startMarker)
  
  const endMarker = L.circleMarker(latlngs[latlngs.length - 1], {
    radius: 8,
    fillColor: '#f56c6c',
    color: '#f56c6c',
    weight: 2,
    fillOpacity: 1
  }).addTo(map.value).bindPopup('终点')
  markers.value.push(endMarker)
  
  map.value.fitBounds(trailLayer.value.getBounds(), { padding: [50, 50] })
}

onMounted(() => {
  nextTick(() => {
    initMap()
  })
})

watch(() => props.trails, (newVal) => {
  if (newVal && map.value) {
    drawTrails(newVal)
  }
}, { deep: true })

watch(() => props.area, (newVal) => {
  if (newVal && map.value) {
    drawArea(newVal)
  }
}, { deep: true })
</script>
