<template>
  <view class="login">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="nav-left" @tap="onClickLeft">
        <text class="back-icon">‹</text>
        <text class="back-text">返回</text>
      </view>
      <text class="nav-title">用户登录</text>
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
      
      <button 
        class="submit-btn" 
        type="primary" 
        @tap="onSubmit"
      >
        登录
      </button>
    </view>

    <view class="register-link" @tap="goToRegister">
      <text>还没有账号？去注册</text>
    </view>

    <view class="form-footer">
      <text class="footer-link" @tap="goToRegister">普通用户注册</text>
      <text class="footer-link admin-register" @tap="goToAdminRegister">管理员注册</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { login } from '@/api/user'
import { getUserPermissions } from '@/api/permission'

const formData = ref({
  nickname: '',
  password: ''
})

const onSubmit = async () => {
  // 表单验证
  if (!formData.value.nickname.trim()) {
    uni.showToast({
      title: '请填写昵称',
      icon: 'none'
    })
    return
  }
  
  if (!formData.value.password.trim()) {
    uni.showToast({
      title: '请填写密码',
      icon: 'none'
    })
    return
  }

  try {
    const res = await login(formData.value)
    
    // 存储用户信息和token
    uni.setStorageSync('userInfo', JSON.stringify(res.data.user))
    uni.setStorageSync('token', res.data.token)
    
    // 获取用户权限
    const permissionsRes = await getUserPermissions(res.data.user.id)
    uni.setStorageSync('userPermissions', JSON.stringify(permissionsRes.data))
    
    uni.showToast({
      title: '登录成功',
      icon: 'success'
    })
    
    // 根据用户角色决定跳转页面
    const userRoles = res.data.user.roles || []
    const isAdmin = userRoles.some(role => role.code === 'ROLE_ADMIN')
    
    if (isAdmin) {
      uni.switchTab({
        url: '/pages/admin/index'
      })
    } else {
      uni.switchTab({
        url: '/pages/profile/profile'
      })
    }
  } catch (error) {
    console.error('登录失败:', error)
    uni.showToast({
      title: error.response?.data?.message || '登录失败',
      icon: 'none'
    })
  }
}

const onClickLeft = () => {
  uni.navigateBack()
}

const goToRegister = () => {
  uni.navigateTo({
    url: '/pages/register/register'
  })
}

const goToAdminRegister = () => {
  uni.navigateTo({
    url: '/pages/admin/register'
  })
}
</script>

<style scoped>
.login {
  min-height: 100vh;
  background-color: #f7f8fa;
  padding: 0 32rpx;
}

/* 自定义导航栏 */
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

/* 表单样式 */
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

/* 链接样式 */
.register-link {
  text-align: center;
  margin-top: 40rpx;
  padding: 24rpx;
}

.register-link text {
  color: #1989fa;
  font-size: 28rpx;
  font-weight: 500;
}

.form-footer {
  display: flex;
  justify-content: center;
  margin-top: 32rpx;
  padding: 24rpx;
}

.footer-link {
  color: #1989fa;
  font-size: 24rpx;
  margin: 0 20rpx;
  padding: 8rpx 16rpx;
}

.admin-register {
  color: #1989fa;
}
</style>