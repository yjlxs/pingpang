<template>
  <view class="tournament-list">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <text class="navbar-title">赛事</text>
    </view>
    
    <!-- 搜索和筛选区 -->
    <view class="search-box">
      <view class="search-container">
        <input
          v-model="searchValue"
          type="text"
          placeholder="搜索赛事"
          class="search-input"
          @confirm="onSearch"
        />
        <view class="search-icon" @tap="onSearch">
          <text class="icon-search">🔍</text>
        </view>
      </view>
      
      <!-- 筛选按钮 -->
      <view class="filter-container">
        <view 
          class="filter-item" 
          :class="{ active: statusFilter !== 'all' }"
          @tap="showStatusFilterPopup"
        >
          <text>{{ getStatusFilterText() }}</text>
          <text class="filter-arrow">▼</text>
        </view>
        
        <view 
          class="filter-item" 
          :class="{ active: typeFilter !== 'all' }"
          @tap="showTypeFilterPopup"
        >
          <text>{{ getTypeFilterText() }}</text>
          <text class="filter-arrow">▼</text>
        </view>
      </view>
    </view>

    <!-- 赛事列表 -->
    <scroll-view 
      class="list-container" 
      scroll-y 
      refresher-enabled
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="onLoad"
    >
      <view v-if="tournaments.length === 0 && !loading && !refreshing" class="empty-state">
        <text class="empty-icon">🏓</text>
        <text class="empty-text">暂无赛事</text>
      </view>
      
      <view 
        v-for="tournament in tournaments" 
        :key="tournament.id" 
        class="tournament-card"
        @tap="viewDetail(tournament.id)"
      >
        <view class="card-header">
          <text class="title">{{ tournament.title }}</text>
          <view :class="['status-tag', getStatusClass(tournament.status)]">
            <text>{{ getStatusText(tournament.status) }}</text>
          </view>
        </view>
        
        <view class="info-list">
          <view class="info-item">
            <text class="icon">⏰</text>
            <text class="label">比赛时间：</text>
            <text class="value">{{ getDateRange(tournament.startTime, tournament.endTime) }}</text>
          </view>
          <view class="info-item">
            <text class="icon">📍</text>
            <text class="label">比赛地点：</text>
            <text class="value">{{ tournament.location }}</text>
          </view>
          <view class="info-item">
            <text class="icon">👥</text>
            <text class="label">参与人数：</text>
            <text class="value">{{ tournament.currentPlayers }}/{{ tournament.maxPlayers }}</text>
          </view>
          <view class="info-item">
            <text class="icon">🏅</text>
            <text class="label">比赛类型：</text>
            <text class="value">{{ getTypeText(tournament.type) }}</text>
          </view>
        </view>
      </view>
      
      <view v-if="loading" class="loading-state">
        <text class="loading-text">加载中...</text>
      </view>
      
      <view v-if="finished && tournaments.length > 0" class="finished-state">
        <text class="finished-text">没有更多了</text>
      </view>
    </scroll-view>

    <!-- 创建赛事按钮 -->
    <view 
      v-if="hasPermission('tournament:create')"
      class="create-button"
      @tap="createTournament"
    >
      <text class="plus-icon">+</text>
    </view>

    <!-- 状态筛选弹窗 -->
    <view class="filter-popup-overlay" v-if="showStatusFilter" @tap="closeStatusFilterPopup">
      <view class="filter-popup" @tap.stop>
        <view class="filter-header">
          <text class="filter-title">选择状态</text>
          <view class="close-btn" @tap="closeStatusFilterPopup">
            <text>×</text>
          </view>
        </view>
        <view class="filter-options">
          <view 
            v-for="option in statusOptions" 
            :key="option.value"
            class="filter-option"
            :class="{ selected: statusFilter === option.value }"
            @tap="selectStatus(option.value)"
          >
            <text>{{ option.text }}</text>
            <text v-if="statusFilter === option.value" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 类型筛选弹窗 -->
    <view class="filter-popup-overlay" v-if="showTypeFilter" @tap="closeTypeFilterPopup">
      <view class="filter-popup" @tap.stop>
        <view class="filter-header">
          <text class="filter-title">选择类型</text>
          <view class="close-btn" @tap="closeTypeFilterPopup">
            <text>×</text>
          </view>
        </view>
        <view class="filter-options">
          <view 
            v-for="option in typeOptions" 
            :key="option.value"
            class="filter-option"
            :class="{ selected: typeFilter === option.value }"
            @tap="selectType(option.value)"
          >
            <text>{{ option.text }}</text>
            <text v-if="typeFilter === option.value" class="check-icon">✓</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 使用 Vue 2 Options API
export default {
  name: 'TournamentList',
  data() {
    return {
      tournaments: [],
      loading: false,
      finished: false,
      refreshing: false,
      searchValue: '',
      statusFilter: 'all',
      typeFilter: 'all',
      showStatusFilter: false,
      showTypeFilter: false,
      page: 1,
      pageSize: 10,
      
      // 状态选项
      statusOptions: [
        { text: '全部状态', value: 'all' },
        { text: '草稿', value: 'DRAFT' },
        { text: '报名中', value: 'REGISTERING' },
        { text: '进行中', value: 'ONGOING' },
        { text: '已结束', value: 'FINISHED' }
      ],
      
      // 比赛类型选项
      typeOptions: [
        { text: '全部类型', value: 'all' },
        { text: '单打', value: 'SINGLES' },
        { text: '双打', value: 'DOUBLES' },
        { text: '团体', value: 'TEAM' }
      ]
    }
  },
  mounted() {
    this.loadTournaments()
  },
  methods: {
    // 获取状态样式类
    getStatusClass(status) {
      const classMap = {
        'DRAFT': 'status-draft',
        'REGISTERING': 'status-registering',
        'ONGOING': 'status-ongoing',
        'FINISHED': 'status-finished'
      }
      return classMap[status] || 'status-default'
    },
    
    // 获取状态文本
    getStatusText(status) {
      const textMap = {
        'DRAFT': '草稿',
        'REGISTERING': '报名中',
        'ONGOING': '进行中',
        'FINISHED': '已结束'
      }
      return textMap[status] || status
    },
    
    // 获取类型文本
    getTypeText(type) {
      const textMap = {
        'SINGLES': '单打',
        'DOUBLES': '双打',
        'TEAM': '团体'
      }
      return textMap[type] || type
    },
    
    // 获取状态筛选文本
    getStatusFilterText() {
      const option = this.statusOptions.find(opt => opt.value === this.statusFilter)
      return option ? option.text : '状态'
    },
    
    // 获取类型筛选文本
    getTypeFilterText() {
      const option = this.typeOptions.find(opt => opt.value === this.typeFilter)
      return option ? option.text : '类型'
    },
    
    // 格式化日期范围
    getDateRange(startTime, endTime) {
      if (!startTime || !endTime) return '时间待定'
      // 这里可以添加日期格式化逻辑
      return `${startTime} - ${endTime}`
    },
    
    // 权限检查
    hasPermission(permission) {
      // 这里需要你真实的权限检查逻辑
      // 暂时返回 true 用于测试
      return true
    },
    
    // 加载赛事列表
    async loadTournaments() {
      if (this.loading) return
      
      try {
        this.loading = true
        const params = {
          page: this.page,
          pageSize: this.pageSize,
          keyword: this.searchValue,
          status: this.statusFilter !== 'all' ? this.statusFilter : undefined,
          type: this.typeFilter !== 'all' ? this.typeFilter : undefined
        }
        
        // 这里需要你真实的 API 调用
        // const res = await getTournaments(params)
        // const { list, total } = res.data
        
        // 示例数据
        const list = [
          {
            id: 1,
            title: '春季乒乓球锦标赛',
            status: 'REGISTERING',
            startTime: '2024-03-01',
            endTime: '2024-03-03',
            location: '市体育馆',
            currentPlayers: 45,
            maxPlayers: 64,
            type: 'SINGLES'
          },
          {
            id: 2,
            title: '社区友谊赛',
            status: 'ONGOING',
            startTime: '2024-02-25',
            endTime: '2024-02-26',
            location: '社区活动中心',
            currentPlayers: 32,
            maxPlayers: 32,
            type: 'DOUBLES'
          }
        ]
        const total = 2
        
        if (this.refreshing) {
          this.tournaments = []
          this.refreshing = false
        }
        
        this.tournaments.push(...list)
        
        if (this.tournaments.length >= total) {
          this.finished = true
        } else {
          this.page++
        }
      } catch (error) {
        uni.showToast({
          title: '获取赛事列表失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 下拉刷新
    onRefresh() {
      this.finished = false
      this.page = 1
      this.refreshing = true
      this.loadTournaments()
    },
    
    // 上拉加载
    onLoad() {
      if (!this.loading && !this.finished) {
        this.loadTournaments()
      }
    },
    
    // 搜索
    onSearch() {
      this.tournaments = []
      this.finished = false
      this.page = 1
      this.loadTournaments()
    },
    
    // 显示状态筛选弹窗
    showStatusFilterPopup() {
      this.showStatusFilter = true
    },
    
    // 显示类型筛选弹窗
    showTypeFilterPopup() {
      this.showTypeFilter = true
    },
    
    // 关闭状态筛选弹窗
    closeStatusFilterPopup() {
      this.showStatusFilter = false
    },
    
    // 关闭类型筛选弹窗
    closeTypeFilterPopup() {
      this.showTypeFilter = false
    },
    
    // 选择状态
    selectStatus(value) {
      this.statusFilter = value
      this.closeStatusFilterPopup()
      this.tournaments = []
      this.finished = false
      this.page = 1
      this.loadTournaments()
    },
    
    // 选择类型
    selectType(value) {
      this.typeFilter = value
      this.closeTypeFilterPopup()
      this.tournaments = []
      this.finished = false
      this.page = 1
      this.loadTournaments()
    },
    
    // 查看赛事详情
    viewDetail(id) {
      uni.navigateTo({
        url: `/pages/tournament/detail?id=${id}`
      })
    },
    
    // 创建赛事
    createTournament() {
      uni.navigateTo({
        url: '/pages/tournament/create'
      })
    }
  }
}
</script>

<style scoped>
.tournament-list {
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
  padding: 0 32rpx;
  background-color: #ffffff;
  border-bottom: 2rpx solid #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

/* 搜索框样式 */
.search-box {
  background-color: #fff;
  padding: 20rpx 30rpx;
  position: sticky;
  top: 88rpx; /* 导航栏高度 */
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
  margin-bottom: 20rpx;
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

/* 筛选容器 */
.filter-container {
  display: flex;
  gap: 20rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 16rpx 30rpx;
  font-size: 26rpx;
  color: #666;
}

.filter-item.active {
  background-color: #e8f3ff;
  color: #1989fa;
}

.filter-arrow {
  margin-left: 10rpx;
  font-size: 20rpx;
}

/* 列表容器 */
.list-container {
  flex: 1;
  padding: 30rpx;
}

/* 赛事卡片 */
.tournament-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

/* 状态标签 */
.status-tag {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-draft {
  background-color: #f5f5f5;
  color: #666;
}

.status-registering {
  background-color: #e8f3ff;
  color: #1989fa;
}

.status-ongoing {
  background-color: #e8f8e8;
  color: #07c160;
}

.status-finished {
  background-color: #fff7e6;
  color: #ff976a;
}

/* 信息列表 */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 28rpx;
}

.info-item .icon {
  font-size: 30rpx;
}

.info-item .label {
  color: #999;
  min-width: 140rpx;
}

.info-item .value {
  flex: 1;
  color: #333;
}

/* 创建按钮 */
.create-button {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx; /* 避免和tabbar重叠 */
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #1989fa, #0081ff);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 30rpx rgba(25, 137, 250, 0.3);
  z-index: 999;
}

.plus-icon {
  font-size: 60rpx;
  color: #fff;
  font-weight: bold;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
}

/* 加载状态 */
.loading-state,
.finished-state {
  text-align: center;
  padding: 40rpx 0;
  color: #999;
  font-size: 28rpx;
}

/* 筛选弹窗 */
.filter-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.filter-popup {
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
  width: 100%;
  max-height: 70vh;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40rpx;
  border-bottom: 2rpx solid #eee;
}

.filter-title {
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

.filter-options {
  max-height: 50vh;
  overflow-y: auto;
}

.filter-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 32rpx;
  cursor: pointer;
}

.filter-option.selected {
  color: #1989fa;
  background-color: #f5f9ff;
}

.check-icon {
  color: #1989fa;
  font-weight: bold;
}
</style>