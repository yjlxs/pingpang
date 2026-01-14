<template>
  <view class="user-edit">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-left" @tap="onClickLeft">
        <text class="back-icon">‹</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">编辑资料</text>
      <view class="nav-right" @tap="handleSave">
        <text class="save-text">保存</text>
      </view>
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
        <text class="section-title">握拍方式</text>
        <view class="radio-group">
          <view 
            v-for="option in gripOptions" 
            :key="option.value"
            class="radio-item"
            @tap="formData.gripStyle = option.value"
          >
            <view class="radio-circle" :class="{ 'radio-selected': formData.gripStyle === option.value }">
              <view v-if="formData.gripStyle === option.value" class="radio-inner"></view>
            </view>
            <text class="radio-label">{{ option.label }}</text>
          </view>
        </view>

        <text class="section-title">球拍配置</text>
        <view class="radio-group">
          <view 
            v-for="option in racketOptions" 
            :key="option.value"
            class="radio-item"
            @tap="formData.racketConfig = option.value"
          >
            <view class="radio-circle" :class="{ 'radio-selected': formData.racketConfig === option.value }">
              <view v-if="formData.racketConfig === option.value" class="radio-inner"></view>
            </view>
            <text class="radio-label">{{ option.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { updateUser } from '@/api/user'

// 握拍方式选项
const gripOptions = [
  { value: '右手直拍', label: '右手直拍' },
  { value: '右手横拍', label: '右手横拍' },
  { value: '左手直拍', label: '左手直拍' },
  { value: '左手横拍', label: '左手横拍' }
]

// 球拍配置选项
const racketOptions = [
  { value: '双面反胶', label: '双面反胶' },
  { value: '双面颗粒胶', label: '双面颗粒胶' },
  { value: '一面反胶一面颗粒胶', label: '一面反胶一面颗粒胶' },
  { value: '直拍单面反胶', label: '直拍单面反胶' },
  { value: '直拍单面颗粒胶', label: '直拍单面颗粒胶' }
]

const formData = ref({
  avatarUrl: '',
  nickname: '',
  phone: '',
  gripStyle: '',
  racketConfig: ''
})

// 加载用户信息
onMounted(() => {
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
})

const onClickLeft = () => {
  uni.navigateBack()
}

const handleSave = async () => {
  try {
    // 验证必填字段
    if (!formData.value.gripStyle) {
      uni.showToast({
        title: '请选择握拍方式',
        icon: 'none'
      })
      return
    }
    
    if (!formData.value.racketConfig) {
      uni.showToast({
        title: '请选择球拍配置',
        icon: 'none'
      })
      return
    }

    const res = await updateUser(formData.value)
    
    // 更新本地存储的用户信息
    const currentUserInfo = JSON.parse(uni.getStorageSync('userInfo') || '{}')
    const updatedUserInfo = {
      ...currentUserInfo,
      gripStyle: formData.value.gripStyle,
      racketConfig: formData.value.racketConfig
    }
    uni.setStorageSync('userInfo', JSON.stringify(updatedUserInfo))
    
    uni.showToast({
      title: '保存成功',
      icon: 'success'
    })
    
    // 延迟返回，让用户看到成功提示
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
  } catch (error) {
    console.error('保存失败:', error)
    uni.showToast({
      title: error.response?.data?.message || '保存失败',
      icon: 'none'
    })
  }
}
</script>

<style scoped>
.user-edit {
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
  display: flex;
  justify-content: flex-end;
}

.save-text {
  font-size: 32rpx;
  color: #1989fa;
  font-weight: 500;
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

/* 表单部分 */
.form-section {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 32rpx;
  color: #323233;
  margin-bottom: 32rpx;
  font-weight: 500;
  display: block;
}

/* 基本信息 */
.form-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
  padding: 24rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.form-item:last-child {
  border-bottom: none;
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
}

/* 单选框组 */
.radio-group {
  margin-bottom: 48rpx;
}

.radio-group:last-child {
  margin-bottom: 0;
}

.radio-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 2rpx solid #f5f5f5;
}

.radio-item:last-child {
  border-bottom: none;
}

.radio-circle {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  border: 4rpx solid #c8c9cc;
  margin-right: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.radio-selected {
  border-color: #1989fa;
  background-color: #1989fa;
}

.radio-inner {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
  background-color: white;
}

.radio-label {
  font-size: 28rpx;
  color: #323233;
  flex: 1;
}
</style>