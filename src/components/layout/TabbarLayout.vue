<template>
  <view class="tabbar-layout">
    <!-- 内容区域 -->
    <view class="content" :style="{ paddingBottom: tabbarHeight + 'px' }">
      <slot></slot>
    </view>
    
    <!-- 自定义底部导航 -->
    <view class="custom-tabbar" :style="{ height: tabbarHeight + 'px' }">
      <view 
        class="tabbar-item" 
        :class="{ active: currentTab === 0 }"
        @tap="switchTab(0, '/pages/tournament/tournament')"
      >
        <image 
          class="tabbar-icon"
          :src="currentTab === 0 
            ? require('@/static/tabbar/flag.png')
            : require('@/static/tabbar/flag-o.png')" 
        />
        <text class="tabbar-text">赛事</text>
      </view>
      
      <view 
        class="tabbar-item" 
        :class="{ active: currentTab === 1 }"
        @tap="switchTab(1, '/pages/points/points')"
      >
        <image 
          class="tabbar-icon"
          :src="currentTab === 1 
            ? require('@/static/tabbar/search-active.png')
            : require('@/static/tabbar/search.png')" 
        />
        <text class="tabbar-text">查积分</text>
      </view>
      
      <view 
        class="tabbar-item" 
        :class="{ active: currentTab === 2 }"
        @tap="switchTab(2, '/pages/profile/profile')"
      >
        <image 
          class="tabbar-icon"
          :src="currentTab === 2 
            ? require('@/static/tabbar/user.png')
            : require('@/static/tabbar/user-o.png')" 
        />
        <text class="tabbar-text">我的</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const currentTab = ref(0)
const tabbarHeight = ref(50)

// 获取当前页面路径，设置激活状态
onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const route = currentPage.route
  
  // 根据路由设置当前 tab
  if (route.includes('tournament')) {
    currentTab.value = 0
  } else if (route.includes('points')) {
    currentTab.value = 1
  } else if (route.includes('profile')) {
    currentTab.value = 2
  }
})

const switchTab = (index, url) => {
  if (currentTab.value === index) {
    // 如果点击的是当前 tab，可以执行刷新操作
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage.route.includes(url.split('/')[2])) {
      // 可以触发刷新逻辑
      uni.startPullDownRefresh && uni.startPullDownRefresh()
    }
    return
  }
  
  currentTab.value = index
  uni.switchTab({ 
    url,
    success: () => {
      console.log(`切换到 ${url}`)
    },
    fail: (err) => {
      console.error('切换失败:', err)
    }
  })
}
</script>

<style scoped>
.tabbar-layout {
  min-height: 100vh;
  position: relative;
}

.content {
  min-height: calc(100vh - 50px);
  box-sizing: border-box;
}

.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  border-top: 1px solid #eeeeee;
  display: flex;
  z-index: 1000;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.06);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 0;
  transition: all 0.2s;
}

.tabbar-item.active {
  color: #1989fa;
}

.tabbar-item:active {
  opacity: 0.7;
  transform: scale(0.95);
}

.tabbar-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.tabbar-text {
  font-size: 10px;
  line-height: 14px;
  color: #666666;
  transition: color 0.2s;
}

.tabbar-item.active .tabbar-text {
  color: #1989fa;
  font-weight: 500;
}

/* 适配 iPhone X 等有安全区域的设备 */
@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3),
       only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3),
       only screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) {
  .custom-tabbar {
    padding-bottom: env(safe-area-inset-bottom);
    height: calc(50px + env(safe-area-inset-bottom));
  }
  
  .content {
    padding-bottom: calc(50px + env(safe-area-inset-bottom));
  }
}
</style>