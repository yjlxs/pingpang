<template>
  <view class="profile">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <text class="nav-title">我的</text>
    </view>
    
    <view class="list-container">
      <!-- 用户信息卡片 -->
      <view class="user-card">
        <view class="user-info">
          <image
            class="user-avatar"
            :src="userInfo.avatarUrl || '/static/images/avatar/fzd.png'"
            mode="aspectFill"
          />
          <view class="user-detail">
            <text class="nickname">{{ userInfo.nickname || '未登录' }}</text>
            <view class="roles">
              <view 
                v-for="role in userInfo.roles" 
                :key="role.id"
                :class="['role-tag', role.code === 'ROLE_ADMIN' ? 'role-danger' : 'role-primary']"
              >
                <text class="role-text">{{ role.name }}</text>
              </view>
            </view>
            <view class="view-profile" @tap="goToUserDetail">
              <text>查看资料</text>
            </view>
          </view>
        </view>
        <view class="points-info">
          <text class="points-label">积分</text>
          <text class="points-value">{{ userInfo.points || 0 }} ({{ userInfo.level || 'Y5' }})</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="action-btn" @tap="goToMyEvents">
          <text class="btn-icon">🏆</text>
          <text class="btn-text">我参加的赛事</text>
        </button>

        <!-- 管理员控制台入口 -->
        <button 
          v-if="hasAdminRole" 
          class="action-btn admin-btn" 
          @tap="goToAdminHome"
        >
          <text class="btn-icon">⚙️</text>
          <text class="btn-text">管理员控制台</text>
        </button>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-wrapper">
      <button type="warn" class="logout-btn" @tap="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUserCompleteInfo } from '@/api/user-info'

const userInfo = ref({})
const hasAdminRole = ref(false)

// 检查是否有管理员角色
const checkAdminRole = (roles) => {
  return roles && roles.some(role => role.code === 'ROLE_ADMIN')
}

// 检查用户信息
const checkUserInfo = async () => {
  try {
    const storedUserInfo = uni.getStorageSync('userInfo')
    if (storedUserInfo) {
      const parsedUserInfo = JSON.parse(storedUserInfo)
      
      try {
        // 使用API获取完整的用户信息
        const response = await getUserCompleteInfo(parsedUserInfo.id)
        const completeInfo = response.data || response
        
        // 更新用户信息
        parsedUserInfo.roles = completeInfo.roles || []
        parsedUserInfo.points = completeInfo.points || 0
        parsedUserInfo.level = completeInfo.level || '暂无'
        
        // 更新本地存储
        uni.setStorageSync('userInfo', JSON.stringify(parsedUserInfo))
        if (completeInfo.permissions) {
          uni.setStorageSync('userPermissions', JSON.stringify(completeInfo.permissions))
        }
        
        // 更新页面显示
        userInfo.value = parsedUserInfo
        hasAdminRole.value = checkAdminRole(parsedUserInfo.roles)
      } catch (error) {
        console.error('获取用户信息失败:', error)
        uni.showToast({
          title: '获取用户信息失败',
          icon: 'none'
        })
      }
    } else {
      // 未登录，跳转到登录页
      uni.redirectTo({
        url: '/pages/login/login'
      })
    }
  } catch (error) {
    console.error('检查用户信息失败:', error)
  }
}

// 页面加载时检查
onMounted(() => {
  checkUserInfo()
})

// 页面显示时检查
onShow(() => {
  checkUserInfo()
})

const goToUserDetail = () => {
  uni.navigateTo({
    url: '/pages/user/detail'
  })
}

const goToMyEvents = () => {
  uni.navigateTo({
    url: '/pages/match/history'
  })
}

const goToAdminHome = () => {
  uni.switchTab({
    url: '/pages/admin/index'
  })
}

const handleLogout = () => {
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        // 清除存储
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('token')
        uni.removeStorageSync('userPermissions')
        
        uni.showToast({
          title: '退出成功',
          icon: 'success'
        })
        
        // 跳转到登录页
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }
    }
  })
}
</script>

<style scoped>
.profile {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

/* 自定义导航栏 */
.custom-navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #f0f0f0;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #323233;
}

/* 内容容器 */
.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 32rpx;
  padding-bottom: 200rpx;
  -webkit-overflow-scrolling: touch;
}

/* 用户卡片 */
.user-card {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid #f0f0f0;
}

.user-detail {
  margin-left: 32rpx;
  flex: 1;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #323233;
  margin-bottom: 16rpx;
  display: block;
}

.roles {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.role-tag {
  padding: 8rpx 16rpx;
  border-radius: 24rpx;
  font-size: 20rpx;
  display: inline-flex;
  align-items: center;
}

.role-primary {
  background-color: #1989fa;
  color: white;
}

.role-danger {
  background-color: #ee0a24;
  color: white;
}

.role-text {
  font-size: 20rpx;
  font-weight: 500;
}

.view-profile {
  color: #1989fa;
  font-size: 28rpx;
  font-weight: 500;
}

.view-profile text {
  padding: 8rpx 0;
}

.points-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 32rpx;
  border-top: 2rpx solid #f0f0f0;
}

.points-label {
  color: #666;
  font-size: 28rpx;
}

.points-value {
  color: #ff6b01;
  font-weight: bold;
  font-size: 32rpx;
}

/* 操作按钮 */
.action-buttons {
  background: white;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.action-btn {
  width: 100%;
  height: 96rpx;
  background: #f5f5f5;
  border: none;
  color: #333;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.action-btn:last-child {
  margin-bottom: 0;
}

.action-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.btn-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.btn-text {
  font-size: 28rpx;
}

.admin-btn {
  background: #1989fa !important;
  color: white !important;
}

/* 退出登录按钮 */
.logout-wrapper {
  position: fixed;
  bottom: 160rpx;  /* 留出底部安全区域 */
  left: 32rpx;
  right: 32rpx;
  z-index: 10;
}

.logout-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #ff6b6b, #ee0a24);
  color: white;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  box-shadow: 0 8rpx 32rpx rgba(238, 10, 36, 0.3);
}

.logout-btn:active {
  opacity: 0.8;
  transform: translateY(2rpx);
}

/* 适配安全区域 */
@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3),
       only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3),
       only screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) {
  .logout-wrapper {
    bottom: calc(160rpx + env(safe-area-inset-bottom));
  }
}
</style>