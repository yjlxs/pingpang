<template>
  <view class="home">
    <!-- 自定义导航栏（替代 van-nav-bar） -->
    <view class="custom-navbar">
      <text class="navbar-title">首页</text>
    </view>
    
    <!-- 内容区域 -->
    <view class="content">
      <text class="welcome-title">欢迎使用球赛小程序</text>
      
      <!-- 按钮区域 -->
      <view class="auth-buttons">
        <button 
          class="auth-button login-button" 
          type="primary" 
          @tap="goToLogin"
        >
          登录
        </button>
        
        <button 
          class="auth-button register-button" 
          plain 
          type="primary" 
          @tap="goToRegister"
        >
          注册
        </button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Home',
  // Composition API 写法（Vue 3）
  // 如果使用 Options API，保持原有 methods
  methods: {
    goToLogin() {
      // uni-app 路由跳转
      uni.navigateTo({
        url: '/pages/login/login',
        animationType: 'pop-in',
        animationDuration: 300,
        success: () => {
          console.log('跳转到登录页面')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    },
    
    goToRegister() {
      // uni-app 路由跳转
      uni.navigateTo({
        url: '/pages/register/register',
        animationType: 'pop-in',
        animationDuration: 300,
        success: () => {
          console.log('跳转到注册页面')
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
    }
  },
  
  // Vue 3 Composition API 写法（可选）
  // setup() {
  //   const goToLogin = () => {
  //     uni.navigateTo({
  //       url: '/pages/login/login'
  //     })
  //   }
  //   
  //   const goToRegister = () => {
  //     uni.navigateTo({
  //       url: '/pages/register/register'
  //     })
  //   }
  //   
  //   return {
  //     goToLogin,
  //     goToRegister
  //   }
  // }
}
</script>

<style scoped>
/* 全局样式 */
.home {
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
}

/* 自定义导航栏样式 */
.custom-navbar {
  height: 88rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 1rpx solid #e5e5e5;
  box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.05);
}

.navbar-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
  text-align: center;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* 欢迎标题 */
.welcome-title {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 80rpx;
  line-height: 1.4;
  text-align: center;
}

/* 按钮容器 */
.auth-buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 32rpx;
  width: 100%;
  max-width: 600rpx;
}

/* 按钮通用样式 */
.auth-button {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

/* 登录按钮 */
.login-button {
  background: linear-gradient(135deg, #1989fa, #32aaff);
  color: #ffffff;
  box-shadow: 0 8rpx 16rpx rgba(25, 137, 250, 0.3);
}

.login-button:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 8rpx rgba(25, 137, 250, 0.3);
  opacity: 0.9;
}

/* 注册按钮 */
.register-button {
  background-color: transparent;
  color: #1989fa;
  border: 2rpx solid #1989fa;
}

.register-button:active {
  background-color: rgba(25, 137, 250, 0.1);
  transform: translateY(2rpx);
}

/* 按钮禁用状态 */
.auth-button[disabled] {
  opacity: 0.5;
  transform: none !important;
  box-shadow: none !important;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .welcome-title {
    font-size: 36rpx;
    margin-bottom: 60rpx;
  }
  
  .auth-buttons {
    flex-direction: column;
    gap: 24rpx;
  }
  
  .auth-button {
    width: 100%;
    height: 80rpx;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .home {
    background-color: #1a1a1a;
  }
  
  .custom-navbar {
    background-color: #2c2c2c;
    border-bottom-color: #404040;
  }
  
  .navbar-title {
    color: #ffffff;
  }
  
  .welcome-title {
    color: #ffffff;
  }
  
  .register-button {
    color: #64b5f6;
    border-color: #64b5f6;
  }
  
  .register-button:active {
    background-color: rgba(100, 181, 246, 0.1);
  }
}

/* 修复 uni-app 中 button 的默认样式 */
button::after {
  border: none;
}

button {
  margin: 0;
  padding: 0;
  background: none;
  position: relative;
  display: flex;
  align-items: inherit;
  justify-content: inherit;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

/* 移除 button 的默认边框（小程序平台） */
button[type="primary"],
button[plain] {
  border: none;
}

/* 确保文字居中 */
.auth-button text {
  display: block;
  width: 100%;
  text-align: center;
}
</style>

<!-- 如果你需要使用 uni-ui 的组件，这里是另一种实现方式 -->
<!-- 
<template>
  <view class="home">
    <uni-nav-bar title="首页" />
    
    <view class="content">
      <text class="welcome-title">欢迎使用球赛小程序</text>
      
      <view class="auth-buttons">
        <uni-button type="primary" @click="goToLogin">登录</uni-button>
        <uni-button plain type="primary" @click="goToRegister">注册</uni-button>
      </view>
    </view>
  </view>
</template>

<script>
// 需要先安装 uni-ui: npm install @dcloudio/uni-ui
import uniNavBar from '@dcloudio/uni-ui/lib/uni-nav-bar/uni-nav-bar.vue'
import uniButton from '@dcloudio/uni-ui/lib/uni-button/uni-button.vue'

export default {
  components: {
    uniNavBar,
    uniButton
  },
  methods: {
    goToLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },
    goToRegister() {
      uni.navigateTo({ url: '/pages/register/register' })
    }
  }
}
</script>
-->