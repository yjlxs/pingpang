<template>
  <view class="points-search">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <text class="navbar-icon">‹</text>
        <text class="navbar-text">返回</text>
      </view>
      <text class="navbar-title">查积分</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-box">
      <view class="search-container">
        <input
          v-model="searchValue"
          type="text"
          placeholder="搜索用户"
          class="search-input"
          @confirm="onSearch"
        />
        <view class="search-icon" @tap="onSearch">
          <text class="icon-search">🔍</text>
        </view>
      </view>
    </view>

    <!-- 搜索结果列表 -->
    <view class="list-container">
      <view class="search-results" v-if="searchResults.length > 0">
        <view 
          class="result-item" 
          v-for="item in searchResults" 
          :key="item.id" 
          @tap="showDetail(item)"
        >
          <view class="item-header">
            <text class="rank-number">{{ item.rank }}</text>
            <text class="player-name">{{ item.nickname }}</text>
            <text class="player-gender">{{ item.gender }}</text>
          </view>
          <view class="item-body">
            <view class="points-info">
              <text class="points">{{ item.points }}</text>
              <text class="level">{{ item.level }}</text>
            </view>
            <view class="rank-info">
              <text class="total-rank">总排名: {{ item.totalRank }}</text>
              <text class="match-count">场次: {{ item.matchCount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 无搜索结果提示 -->
      <view class="no-result" v-else-if="hasSearched">
        <view class="empty-state">
          <text class="empty-icon">😔</text>
          <text class="empty-text">未找到相关用户</text>
        </view>
      </view>
    </view>

    <!-- 用户详情弹窗 -->
    <view class="detail-popup" v-if="showDetailPopup">
      <view class="popup-mask" @tap="closeDetailPopup"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text class="header-title">详细信息</text>
          <view class="close-btn" @tap="closeDetailPopup">
            <text>×</text>
          </view>
        </view>
        <scroll-view class="user-info" scroll-y>
          <view class="info-row">
            <text class="label">ID</text>
            <text class="value">{{ selectedUser && selectedUser.id }}</text>
          </view>
          <view class="info-row">
            <text class="label">昵称</text>
            <text class="value">{{ selectedUser && selectedUser.nickname }}</text>
          </view>
          <view class="info-row">
            <text class="label">握拍方式</text>
            <text class="value">{{ selectedUser && selectedUser.gripStyle || '未设置' }}</text>
          </view>
          <view class="info-row">
            <text class="label">球拍配置</text>
            <text class="value">{{ selectedUser && selectedUser.racketConfig || '未设置' }}</text>
          </view>
          <view class="info-row">
            <text class="label">当前积分</text>
            <text class="value">{{ selectedUser && selectedUser.points || 0 }}</text>
          </view>
          <view class="info-row">
            <text class="label">水平级别</text>
            <text class="value">{{ selectedUser && selectedUser.level || 'BEGINNER' }}</text>
          </view>
          <view class="info-row">
            <text class="label">参赛场次</text>
            <text class="value">{{ selectedUser && selectedUser.matchCount || 0 }}</text>
          </view>
          <view class="info-row">
            <text class="label">全网排名</text>
            <text class="value">{{ selectedUser && selectedUser.totalRank || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">胜率</text>
            <text class="value">{{ selectedUser && selectedUser.winRate ? selectedUser.winRate + '%' : '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">历史最高积分</text>
            <text class="value">{{ selectedUser && selectedUser.highestPoints || '-' }}</text>
          </view>
          <view class="info-row">
            <text class="label">年度平均积分</text>
            <text class="value">{{ selectedUser && selectedUser.yearlyAveragePoints || '-' }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
// 使用 Vue 2 Options API
export default {
  name: 'PointsSearch',
  data() {
    return {
      searchValue: '',
      searchResults: [],
      hasSearched: false,
      selectedUser: null,
      showDetailPopup: false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    async onSearch() {
      if (!this.searchValue.trim()) {
        uni.showToast({
          title: '请输入搜索内容',
          icon: 'none'
        })
        return
      }

      try {
        // 这里需要你真实的 API 调用
        // const res = await searchUserPoints(this.searchValue)
        // this.searchResults = res.data
        
        // 示例数据 - 开发时使用
        this.searchResults = [
          {
            id: 1,
            rank: 1,
            nickname: '张三',
            gender: '男',
            points: 2450,
            level: '大师',
            totalRank: 1,
            matchCount: 120,
            gripStyle: '横拍',
            racketConfig: '蝴蝶王+狂飙3',
            winRate: 85,
            highestPoints: 2500,
            yearlyAveragePoints: 2400
          },
          {
            id: 2,
            rank: 2,
            nickname: '李四',
            gender: '女',
            points: 2350,
            level: '专业',
            totalRank: 2,
            matchCount: 98,
            gripStyle: '直拍',
            racketConfig: '斯蒂卡+多尼克',
            winRate: 78,
            highestPoints: 2400,
            yearlyAveragePoints: 2300
          }
        ]
        
        this.hasSearched = true
      } catch (error) {
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        })
      }
    },
    
    showDetail(user) {
      this.selectedUser = user
      this.showDetailPopup = true
    },
    
    closeDetailPopup() {
      this.showDetailPopup = false
      this.selectedUser = null
    }
  }
}
</script>

<style scoped>
.points-search {
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
}

/* 搜索框样式 */
.search-box {
  background-color: #fff;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 88rpx;
  z-index: 98;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-container {
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 50rpx;
  padding: 0 30rpx;
  height: 80rpx;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 28rpx;
  background: transparent;
  border: none;
  outline: none;
}

.search-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 20rpx;
  cursor: pointer;
}

.icon-search {
  font-size: 32rpx;
  color: #666;
}

/* 列表容器 */
.list-container {
  flex: 1;
  overflow-y: auto;
  padding: 30rpx;
  -webkit-overflow-scrolling: touch;
}

/* 结果项 */
.result-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.rank-number {
  font-size: 32rpx;
  font-weight: bold;
  margin-right: 20rpx;
  color: #ff6b01;
}

.player-name {
  font-size: 32rpx;
  font-weight: bold;
  flex: 1;
  color: #333;
}

.player-gender {
  color: #666;
  margin-left: 20rpx;
  font-size: 26rpx;
}

.item-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.points-info {
  display: flex;
  align-items: center;
}

.points {
  font-size: 36rpx;
  color: #ff6b01;
  font-weight: bold;
  margin-right: 20rpx;
}

.level {
  color: #666;
  font-size: 26rpx;
}

.rank-info {
  color: #666;
  font-size: 26rpx;
}

.total-rank {
  margin-right: 30rpx;
}

/* 无结果状态 */
.no-result {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400rpx;
}

.empty-state {
  text-align: center;
}

.empty-icon {
  font-size: 100rpx;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}

/* 弹窗样式 */
.detail-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.popup-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 40rpx 40rpx 0 0;
  max-height: 80vh;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  border-bottom: 2rpx solid #eee;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #999;
  cursor: pointer;
}

.user-info {
  padding: 40rpx;
  max-height: 60vh;
}

.info-row {
  display: flex;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-row .label {
  width: 200rpx;
  color: #666;
  font-size: 28rpx;
}

.info-row .value {
  flex: 1;
  color: #333;
  font-size: 28rpx;
  word-break: break-all;
}
</style>