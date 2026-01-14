<template>
  <view class="user-detail">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-left" @tap="onClickLeft">
        <text class="back-icon">‹</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">查看资料</text>
      <view class="nav-right"></view>
    </view>
    
    <view class="form-content">
      <!-- 头像 -->
      <view class="avatar-wrapper">
        <image
          class="user-avatar"
          :src="formData.avatarUrl || '/static/images/avatar/fzd.png'"
          mode="aspectFill"
        />
      </view>
      
      <!-- 基本信息 -->
      <view class="form-group">
        <view class="form-section">
          <text class="section-title">基本信息</text>
          <view class="form-item">
            <text class="item-label">姓名</text>
            <text class="item-value">{{ formData.nickname || '未设置' }}</text>
          </view>
          <view class="form-item">
            <text class="item-label">手机</text>
            <text class="item-value">{{ formData.phone || '未设置' }}</text>
          </view>
        </view>
        
        <!-- 球拍信息 -->
        <view class="form-section">
          <text class="section-title">球拍信息</text>
          <view class="form-item">
            <text class="item-label">握拍方式</text>
            <text class="item-value">{{ formData.gripStyle || '未设置' }}</text>
          </view>
          <view class="form-item">
            <text class="item-label">球拍配置</text>
            <text class="item-value">{{ formData.racketConfig || '未设置' }}</text>
          </view>
        </view>
      </view>

      <!-- 编辑按钮 -->
      <view class="button-group">
        <button class="edit-btn" type="primary" @tap="handleEdit">编辑资料</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onShow } from 'vue'

const formData = ref({
  avatarUrl: '',
  nickname: '',
  phone: '',
  gripStyle: '',
  racketConfig: ''
})

// 从本地存储获取用户信息
const loadUserInfo = () => {
  try {
    const userInfoStr = uni.getStorageSync('userInfo')
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr)
      formData.value = {
        ...formData.value,
        ...userInfo
      }
    }
  } catch (error) {
    console.error('加载用户信息失败:', error)
    uni.showToast({
      title: '加载信息失败',
      icon: 'none'
    })
  }
}

onMounted(() => {
  loadUserInfo()
})

onShow(() => {
  loadUserInfo()
})

const onClickLeft = () => {
  uni.navigateBack()
}

const handleEdit = () => {
  uni.navigateTo({
    url: '/pages/user/edit'
  })
}
</script>

<style scoped>
.user-detail {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding-bottom: 40rpx;
}

/* 导航栏 */
.custom-navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background-color: #ffffff;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #f0f0f0;
}

.nav-left {
  display: flex;
  align-items: center;
}

.back-icon {
  font-size: 48rpx;
  color: #323233;
  margin-right: 8rpx;
}

.back-text {
  font-size: 32rpx;
  color: #323233;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 500;
  color: #323233;
}

.nav-right {
  width: 120rpx;
}

/* 表单内容 */
.form-content {
  padding: 40rpx 32rpx;
}

/* 头像 */
.avatar-wrapper {
  text-align: center;
  margin-bottom: 60rpx;
}

.user-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid #ffffff;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.12);
}

/* 表单组 */
.form-group {
  background: white;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 60rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.form-section {
  padding: 40rpx 32rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.form-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 32rpx;
  font-weight: 500;
  display: block;
}

.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.item-label {
  font-size: 28rpx;
  color: #323233;
  font-weight: 500;
}

.item-value {
  font-size: 28rpx;
  color: #666;
  max-width: 400rpx;
  text-align: right;
}

/* 按钮组 */
.button-group {
  padding: 0 32rpx;
}

.edit-btn {
  width: 100%;
  height: 96rpx;
  background: #1989fa;
  color: white;
  border-radius: 48rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  box-shadow: 0 8rpx 32rpx rgba(25, 137, 250, 0.3);
}

.edit-btn:active {
  opacity: 0.8;
  transform: translateY(2rpx);
}
</style>