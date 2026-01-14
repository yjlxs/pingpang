<template>
  <view class="register">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-left" @tap="onClickLeft">
        <text class="back-icon">‹</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">用户注册</text>
      <view class="nav-right"></view>
    </view>
    
    <view class="form-container">
      <view class="form-group">
        <text class="form-label">昵称</text>
        <input
          v-model="formData.nickname"
          class="form-input"
          placeholder="请输入昵称"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-group">
        <text class="form-label">密码</text>
        <input
          v-model="formData.password"
          type="password"
          class="form-input"
          placeholder="请输入密码"
          placeholder-class="placeholder"
        />
      </view>
      
      <view class="form-group">
        <text class="form-label">手机号</text>
        <input
          v-model="formData.phone"
          class="form-input"
          placeholder="请输入手机号"
          placeholder-class="placeholder"
          type="number"
          maxlength="11"
        />
      </view>
      
      <button 
        class="submit-btn" 
        type="primary" 
        @tap="onSubmit"
      >
        注册
      </button>
    </view>

    <view class="login-link" @tap="goToLogin">
      <text>已有账号？去登录</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { register } from '@/api/user'

const formData = ref({
  nickname: '',
  password: '',
  phone: ''
})

const validateForm = () => {
  if (!formData.value.nickname.trim()) {
    uni.showToast({
      title: '请填写昵称',
      icon: 'none'
    })
    return false
  }
  
  if (!formData.value.password.trim()) {
    uni.showToast({
      title: '请填写密码',
      icon: 'none'
    })
    return false
  }
  
  if (!formData.value.phone.trim()) {
    uni.showToast({
      title: '请填写手机号',
      icon: 'none'
    })
    return false
  }
  
  // 手机号验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(formData.value.phone)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    })
    return false
  }
  
  return true
}

const onSubmit = async () => {
  if (!validateForm()) {
    return
  }

  try {
    const res = await register({
      ...formData.value,
      avatarUrl: '/static/images/avatar/fzd.png'  // 设置默认头像
    })
    
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })
    
    uni.navigateTo({
      url: '/pages/login/login'
    })
  } catch (error) {
    console.error('注册失败:', error)
    uni.showToast({
      title: error.response?.data?.message || '注册失败',
      icon: 'none'
    })
  }
}

const onClickLeft = () => {
  uni.navigateBack()
}

const goToLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login'
  })
}
</script>

<style scoped>
.register {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 0 32rpx;
}

/* 导航栏样式（复用 Login.vue 的样式） */
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

/* 表单容器 */
.form-container {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  margin-top: 40rpx;
}

.form-group {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #323233;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 96rpx;
  background: #f7f8fa;
  border: 2rpx solid #ebedf0;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
  color: #323233;
  box-sizing: border-box;
}

.placeholder {
  color: #969799;
  font-size: 28rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: #1989fa;
  color: white;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  margin-top: 20rpx;
}

.submit-btn:active {
  opacity: 0.8;
}

/* 登录链接 */
.login-link {
  text-align: center;
  margin-top: 40rpx;
  padding: 24rpx;
}

.login-link text {
  color: #1989fa;
  font-size: 28rpx;
  font-weight: 500;
}
</style>