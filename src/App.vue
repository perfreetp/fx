<template>
  <router-view />
</template>

<script setup>
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  width: 100%;
}

.layout-container {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;
}

.page-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
}

.map-container {
  height: 100%;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.flex-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.text-center {
  text-align: center;
}

.mt-20 {
  margin-top: 20px;
}

.mb-20 {
  margin-bottom: 20px;
}

.p-20 {
  padding: 20px;
}

.leaflet-container {
  height: 100%;
  width: 100%;
  font-family: inherit;
}

.leaflet-popup-content-wrapper {
  border-radius: 8px;
}

.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 420px;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #303133;
  margin-bottom: 8px;
}

.login-header p {
  color: #909399;
  font-size: 14px;
}

.order-card {
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.photo-item {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.photo-item:hover {
  transform: scale(1.02);
}

.photo-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.trail-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.trail-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.evaluation-stars {
  display: flex;
  gap: 4px;
}

.evaluation-stars .el-icon {
  font-size: 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.header-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
}

.header-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state .el-icon {
  font-size: 64px;
  margin-bottom: 16px;
  color: #c0c4cc;
}

.map-toolbar {
  position: absolute;
  top: 10px;
  left: 50px;
  z-index: 1000;
  background: white;
  padding: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.map-toolbar .el-button {
  margin-right: 8px;
  margin-bottom: 8px;
}

.payment-steps {
  margin-bottom: 30px;
}

.payment-amount {
  text-align: center;
  padding: 40px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 30px;
}

.payment-amount .amount {
  font-size: 48px;
  font-weight: 700;
  color: #409eff;
}

.payment-amount .amount::before {
  content: '¥';
  font-size: 24px;
  margin-right: 4px;
}
</style>
