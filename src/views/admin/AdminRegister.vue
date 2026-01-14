<template>
  <view class="admin-register">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <text class="navbar-icon">‹</text>
        <text class="navbar-text">返回</text>
      </view>
      <text class="navbar-title">管理员注册</text>
      <view class="navbar-right"></view>
    </view>
    
    <view class="form-container">
      <view class="form-group">
        <!-- 昵称 -->
        <view class="form-item">
          <text class="form-label">昵称</text>
          <input
            v-model="formData.nickname"
            class="form-input"
            placeholder="请输入昵称"
            placeholder-class="placeholder"
            :maxlength="20"
          />
          <text v-if="!formData.nickname" class="form-error">请填写昵称</text>
        </view>
        
        <!-- 手机号 -->
        <view class="form-item">
          <text class="form-label">手机号</text>
          <input
            v-model="formData.phone"
            class="form-input"
            type="number"
            placeholder="请输入手机号"
            placeholder-class="placeholder"
            :maxlength="11"
          />
          <text v-if="formData.phone && !phoneValid" class="form-error">手机号格式错误</text>
        </view>
        
        <!-- 密码 -->
        <view class="form-item">
          <text class="form-label">密码</text>
          <input
            v-model="formData.password"
            class="form-input"
            :password="!showPassword"
            placeholder="请输入密码"
            placeholder-class="placeholder"
          />
          <text v-if="formData.password && formData.password.length < 6" class="form-error">密码至少6位</text>
        </view>
        
        <!-- 确认密码 -->
        <view class="form-item">
          <text class="form-label">确认密码</text>
          <input
            v-model="formData.confirmPassword"
            class="form-input"
            :password="!showConfirmPassword"
            placeholder="请再次输入密码"
            placeholder-class="placeholder"
          />
          <text v-if="formData.confirmPassword && !passwordMatch" class="form-error">两次密码不一致</text>
        </view>
        
        <!-- 管理员码 -->
        <view class="form-item">
          <text class="form-label">管理员码</text>
          <input
            v-model="formData.adminCode"
            class="form-input"
            placeholder="请输入管理员注册码"
            placeholder-class="placeholder"
          />
          <text v-if="!formData.adminCode" class="form-error">请填写管理员注册码</text>
        </view>
      </view>
      
      <button 
        class="submit-btn" 
        :disabled="!formValid"
        :class="{ disabled: !formValid }"
        @tap="onSubmit"
      >
        <text>注册</text>
      </button>
    </view>
    
    <!-- 密码显示/隐藏图标 -->
    <view class="password-toggle" @tap="togglePasswordVisibility">
      <text v-if="showPassword" class="toggle-icon">👁️</text>
      <text v-else class="toggle-icon">👁️‍🗨️</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { registerAdmin } from '@/api/user'

// 表单数据
const formData = ref({
  nickname: '',
  phone: '',
  password: '',
  confirmPassword: '',
  adminCode: ''
})

// 显示密码
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// 表单验证
const phoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(formData.value.phone)
})

const passwordMatch = computed(() => {
  return formData.value.password === formData.value.confirmPassword
})

const formValid = computed(() => {
  return (
    formData.value.nickname.trim() &&
    formData.value.phone.trim() &&
    phoneValid.value &&
    formData.value.password.length >= 6 &&
    passwordMatch.value &&
    formData.value.adminCode.trim()
  )
})

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  showConfirmPassword.value = showPassword.value
}

// 返回
const goBack = () => {
  uni.navigateBack()
}

// 提交表单
const onSubmit = async () => {
  if (!formValid.value) {
    uni.showToast({
      title: '请填写完整信息',
      icon: 'none'
    })
    return
  }

  try {
    uni.showLoading({
      title: '注册中...'
    })

    await registerAdmin({
      nickname: formData.value.nickname,
      phone: formData.value.phone,
      password: formData.value.password,
      adminCode: formData.value.adminCode
    })

    uni.hideLoading()
    uni.showToast({
      title: '注册成功',
      icon: 'success'
    })

    // 跳转到登录页面
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/login'
      })
    }, 1500)

  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: error.response?.data?.message || '注册失败',
      icon: 'none'
    })
  }
}

// 监听表单变化
watch(
  () => formData.value,
  () => {
    // 可以在这里添加实时验证逻辑
  },
  { deep: true }
)
</script>

<style scoped>
.admin-register {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 自定义导航栏 */
.custom-navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  background-color: #ffffff;
  border-bottom: 2rpx solid #f5f5f5;
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
  text-align: right;
}

/* 表单容器 */
.form-container {
  padding: 32rpx;
}

.form-group {
  background: #ffffff;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 48rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 40rpx;
  position: relative;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-input {
  width: 100%;
  height: 96rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 0 32rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #1989fa;
  background: #fff;
}

.placeholder {
  color: #999;
  font-size: 32rpx;
}

.form-error {
  display: block;
  font-size: 24rpx;
  color: #ee0a24;
  margin-top: 8rpx;
  height: 36rpx;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #1989fa, #0081ff);
  border-radius: 48rpx;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(25, 137, 250, 0.3);
  transition: all 0.3s;
}

.submit-btn:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 16rpx rgba(25, 137, 250, 0.3);
}

.submit-btn.disabled {
  background: #c8c9cc;
  box-shadow: none;
  opacity: 0.6;
}

/* 密码切换按钮 */
.password-toggle {
  position: fixed;
  right: 64rpx;
  bottom: 240rpx;
  width: 80rpx;
  height: 80rpx;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.toggle-icon {
  font-size: 40rpx;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .form-container {
    padding: 24rpx;
  }
  
  .form-group {
    padding: 24rpx;
  }
  
  .form-input {
    height: 88rpx;
  }
  
  .submit-btn {
    height: 88rpx;
  }
}
</style>