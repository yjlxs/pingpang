<template>
  <view class="admin-home">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <text class="navbar-icon">‹</text>
        <text class="navbar-text">返回</text>
      </view>
      <text class="navbar-title">管理员控制台</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 菜单列表 -->
    <scroll-view class="menu-container" scroll-y>
      <view class="menu-section">
        <text class="section-title">系统管理</text>
        <view class="menu-items">
          <view class="menu-item" @tap="navigateTo('/pages/admin/roles')">
            <view class="menu-icon">
              <text>👑</text>
            </view>
            <view class="menu-info">
              <text class="menu-name">角色管理</text>
              <text class="menu-desc">管理系统角色和权限</text>
            </view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
          
          <view class="menu-item" @tap="navigateTo('/pages/admin/user-roles')">
            <view class="menu-icon">
              <text>👥</text>
            </view>
            <view class="menu-info">
              <text class="menu-name">用户角色分配</text>
              <text class="menu-desc">为用户分配系统角色</text>
            </view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
          
          <view class="menu-item" @tap="navigateTo('/pages/admin/settings')">
            <view class="menu-icon">
              <text>⚙️</text>
            </view>
            <view class="menu-info">
              <text class="menu-name">系统设置</text>
              <text class="menu-desc">管理系统基本设置</text>
            </view>
            <view class="menu-arrow">
              <text>›</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 管理员信息 -->
      <view class="admin-section">
        <text class="section-title">管理员信息</text>
        <view class="admin-card">
          <view class="admin-header">
            <view class="admin-avatar">
              <text>👤</text>
            </view>
            <view class="admin-name-info">
              <text class="admin-name">{{ adminInfo.nickname || '管理员' }}</text>
              <text class="admin-role">系统管理员</text>
            </view>
          </view>
          
          <view class="admin-details">
            <view class="detail-item">
              <text class="detail-label">联系电话</text>
              <text class="detail-value">{{ adminInfo.phone || '未设置' }}</text>
            </view>
            
            <view class="detail-item">
              <text class="detail-label">最后登录</text>
              <text class="detail-value">{{ formatLastLogin() }}</text>
            </view>
            
            <view class="detail-item">
              <text class="detail-label">账户状态</text>
              <view class="status-badge active">
                <text>正常</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 快捷操作 -->
      <view class="quick-actions">
        <text class="section-title">快捷操作</text>
        <view class="action-grid">
          <view class="action-item" @tap="handleRefresh">
            <view class="action-icon refresh">
              <text>🔄</text>
            </view>
            <text class="action-text">刷新数据</text>
          </view>
          
          <view class="action-item" @tap="handleClearCache">
            <view class="action-icon clear">
              <text>🧹</text>
            </view>
            <text class="action-text">清理缓存</text>
          </view>
          
          <view class="action-item" @tap="handleViewLogs">
            <view class="action-icon logs">
              <text>📋</text>
            </view>
            <text class="action-text">查看日志</text>
          </view>
          
          <view class="action-item" @tap="handleSystemInfo">
            <view class="action-icon info">
              <text>ℹ️</text>
            </view>
            <text class="action-text">系统信息</text>
          </view>
        </view>
      </view>
    </scroll-view>
    
    <!-- 底部操作按钮 -->
    <view class="action-buttons">
      <button class="action-btn logout-btn" @tap="handleLogout">
        <text class="btn-icon">🚪</text>
        <text class="btn-text">退出登录</text>
      </button>
    </view>
    
    <!-- 系统信息弹窗 -->
    <view class="system-info-dialog" v-if="showSystemInfo">
      <view class="dialog-mask" @tap="closeSystemInfo"></view>
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">系统信息</text>
          <view class="dialog-close" @tap="closeSystemInfo">
            <text>×</text>
          </view>
        </view>
        
        <view class="dialog-body">
          <view class="info-item">
            <text class="info-label">应用版本</text>
            <text class="info-value">v1.0.0</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">构建时间</text>
            <text class="info-value">{{ buildTime }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">用户数量</text>
            <text class="info-value">{{ userCount }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">角色数量</text>
            <text class="info-value">{{ roleCount }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">赛事数量</text>
            <text class="info-value">{{ tournamentCount }}</text>
          </view>
          
          <view class="info-item">
            <text class="info-label">系统状态</text>
            <view class="status-badge running">
              <text>运行中</text>
            </view>
          </view>
        </view>
        
        <view class="dialog-footer">
          <button class="dialog-btn close-btn" @tap="closeSystemInfo">
            <text>关闭</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const adminInfo = ref({})
const showSystemInfo = ref(false)
const buildTime = ref('2024-01-12')
const userCount = ref('--')
const roleCount = ref('--')
const tournamentCount = ref('--')

onMounted(() => {
  // 从uni-app存储获取管理员信息
  try {
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      adminInfo.value = JSON.parse(userInfo)
    }
  } catch (error) {
    console.error('读取用户信息失败:', error)
  }
  
  // 加载统计数据
  loadStatistics()
})

// 加载统计数据
const loadStatistics = async () => {
  // 这里可以调用API获取统计数据
  // 暂时使用模拟数据
  userCount.value = '150'
  roleCount.value = '4'
  tournamentCount.value = '25'
}

// 格式化最后登录时间
const formatLastLogin = () => {
  const now = new Date()
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
}

// 导航到页面
const navigateTo = (url) => {
  uni.navigateTo({ url })
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 退出登录
const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除存储
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('token')
        
        uni.showToast({
          title: '退出成功',
          icon: 'success'
        })
        
        // 跳转到登录页
        setTimeout(() => {
          uni.redirectTo({
            url: '/pages/login/login'
          })
        }, 1500)
      }
    }
  })
}

// 刷新数据
const handleRefresh = () => {
  uni.showLoading({
    title: '刷新中...'
  })
  
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '数据已刷新',
      icon: 'success'
    })
  }, 1000)
}

// 清理缓存
const handleClearCache = () => {
  uni.showModal({
    title: '清理缓存',
    content: '确定要清理系统缓存吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showLoading({
          title: '清理中...'
        })
        
        setTimeout(() => {
          uni.hideLoading()
          uni.showToast({
            title: '缓存已清理',
            icon: 'success'
          })
        }, 1000)
      }
    }
  })
}

// 查看日志
const handleViewLogs = () => {
  uni.showToast({
    title: '日志功能开发中',
    icon: 'none'
  })
}

// 显示系统信息
const handleSystemInfo = () => {
  showSystemInfo.value = true
}

// 关闭系统信息
const closeSystemInfo = () => {
  showSystemInfo.value = false
}
</script>

<style scoped>
.admin-home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

/* 导航栏 */
.custom-navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.navbar-icon {
  font-size: 48rpx;
  color: #333;
}

.navbar-text {
  font-size: 32rpx;
  color: #333;
}

.navbar-title {
  flex: 2;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.navbar-right {
  flex: 1;
}

/* 菜单容器 */
.menu-container {
  height: calc(100vh - 88rpx - 120rpx);
  padding: 32rpx;
}

/* 菜单部分 */
.menu-section {
  margin-bottom: 48rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24rpx;
  font-weight: 500;
}

.menu-items {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-bottom: 2rpx solid #f5f5f5;
  transition: all 0.3s;
}

.menu-item:active {
  background: #f8f9fa;
  transform: scale(0.98);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.menu-icon text {
  font-size: 40rpx;
}

.menu-info {
  flex: 1;
}

.menu-name {
  display: block;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.menu-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.menu-arrow {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16rpx;
}

.menu-arrow text {
  font-size: 32rpx;
  color: #999;
}

/* 管理员信息 */
.admin-section {
  margin-bottom: 48rpx;
}

.admin-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.admin-header {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.admin-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
}

.admin-avatar text {
  font-size: 60rpx;
}

.admin-name-info {
  flex: 1;
}

.admin-name {
  display: block;
  font-size: 40rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.admin-role {
  display: block;
  font-size: 26rpx;
  color: #666;
  background: #f5f5f5;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  align-self: flex-start;
}

.admin-details {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #e9ecef;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 28rpx;
  color: #666;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.status-badge {
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e9;
  color: #07c160;
}

.status-badge.running {
  background: #e3f2fd;
  color: #1976d2;
}

/* 快捷操作 */
.quick-actions {
  margin-bottom: 32rpx;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24rpx;
}

.action-item {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.action-item:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.action-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.action-icon.refresh {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.action-icon.clear {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.action-icon.logs {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.action-icon.info {
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
}

.action-icon text {
  font-size: 40rpx;
}

.action-text {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  text-align: center;
}

/* 底部按钮 */
.action-buttons {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10rpx);
  border-top: 2rpx solid #f5f5f5;
  z-index: 100;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  border-radius: 44rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(238, 90, 82, 0.3);
  transition: all 0.3s;
}

.logout-btn:active {
  transform: scale(0.98);
  box-shadow: 0 2rpx 10rpx rgba(238, 90, 82, 0.3);
}

.btn-icon {
  font-size: 36rpx;
}

.btn-text {
  font-size: 32rpx;
  color: white;
  font-weight: 600;
}

/* 系统信息弹窗 */
.system-info-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.dialog-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 85%;
  max-width: 600rpx;
  background: white;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.2);
  animation: dialogShow 0.3s ease;
}

@keyframes dialogShow {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dialog-title {
  font-size: 36rpx;
  font-weight: 600;
  color: white;
}

.dialog-close {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: white;
}

.dialog-body {
  padding: 32rpx;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #666;
}

.info-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.dialog-footer {
  padding: 32rpx;
  border-top: 2rpx solid #f5f5f5;
}

.close-btn {
  width: 100%;
  height: 80rpx;
  background: #1989fa;
  border-radius: 40rpx;
  border: none;
  color: white;
  font-size: 30rpx;
  font-weight: 500;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .menu-container {
    padding: 24rpx;
  }
  
  .menu-item {
    padding: 24rpx;
  }
  
  .action-grid {
    gap: 16rpx;
  }
  
  .action-item {
    padding: 24rpx;
  }
}
</style>