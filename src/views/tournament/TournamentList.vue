<template>
  <view class="tournament-list">
    <!-- 导航栏 -->
    <uni-nav-bar title="赛事" fixed />
    
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
          @tap="showStatusFilter = !showStatusFilter"
        >
          <text>{{ getStatusFilterText() }}</text>
          <text class="filter-arrow">▼</text>
        </view>
        
        <view 
          class="filter-item" 
          :class="{ active: typeFilter !== 'all' }"
          @tap="showTypeFilter = !showTypeFilter"
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
    <uni-popup ref="statusFilterPopup" type="bottom" :mask-click="true">
      <view class="filter-popup">
        <view class="filter-header">
          <text class="filter-title">选择状态</text>
          <view class="close-btn" @tap="statusFilterPopup.close()">
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
    </uni-popup>

    <!-- 类型筛选弹窗 -->
    <uni-popup ref="typeFilterPopup" type="bottom" :mask-click="true">
      <view class="filter-popup">
        <view class="filter-header">
          <text class="filter-title">选择类型</text>
          <view class="close-btn" @tap="typeFilterPopup.close()">
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
    </uni-popup>
  </view>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { getTournaments } from '@/api/tournament'
import { hasPermission } from '@/utils/permission'
import { getDateRange } from '@/utils/date'
import uniPopup from '@dcloudio/uni-popup'

export default {
  setup() {
    const tournaments = ref([])
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const searchValue = ref('')
    const statusFilter = ref('all')
    const typeFilter = ref('all')
    const page = ref(1)
    const pageSize = 10
    const statusFilterPopup = ref(null)
    const typeFilterPopup = ref(null)

    // 状态选项
    const statusOptions = [
      { text: '全部状态', value: 'all' },
      { text: '草稿', value: 'DRAFT' },
      { text: '报名中', value: 'REGISTERING' },
      { text: '进行中', value: 'ONGOING' },
      { text: '已结束', value: 'FINISHED' }
    ]

    // 比赛类型选项
    const typeOptions = [
      { text: '全部类型', value: 'all' },
      { text: '单打', value: 'SINGLES' },
      { text: '双打', value: 'DOUBLES' },
      { text: '团体', value: 'TEAM' }
    ]

    // 获取状态样式类
    const getStatusClass = (status) => {
      const classMap = {
        'DRAFT': 'status-draft',
        'REGISTERING': 'status-registering',
        'ONGOING': 'status-ongoing',
        'FINISHED': 'status-finished'
      }
      return classMap[status] || 'status-default'
    }

    // 获取状态文本
    const getStatusText = (status) => {
      const textMap = {
        'DRAFT': '草稿',
        'REGISTERING': '报名中',
        'ONGOING': '进行中',
        'FINISHED': '已结束'
      }
      return textMap[status] || status
    }

    // 获取类型文本
    const getTypeText = (type) => {
      const textMap = {
        'SINGLES': '单打',
        'DOUBLES': '双打',
        'TEAM': '团体'
      }
      return textMap[type] || type
    }

    // 获取状态筛选文本
    const getStatusFilterText = () => {
      const option = statusOptions.find(opt => opt.value === statusFilter.value)
      return option ? option.text : '状态'
    }

    // 获取类型筛选文本
    const getTypeFilterText = () => {
      const option = typeOptions.find(opt => opt.value === typeFilter.value)
      return option ? option.text : '类型'
    }

    // 加载赛事列表
    const loadTournaments = async () => {
      if (loading.value) return
      
      try {
        loading.value = true
        const params = {
          page: page.value,
          pageSize,
          keyword: searchValue.value,
          status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
          type: typeFilter.value !== 'all' ? typeFilter.value : undefined
        }
        
        const res = await getTournaments(params)
        const { list, total } = res.data
        
        if (refreshing.value) {
          tournaments.value = []
          refreshing.value = false
        }
        
        tournaments.value.push(...list)
        
        if (tournaments.value.length >= total) {
          finished.value = true
        } else {
          page.value++
        }
      } catch (error) {
        uni.showToast({
          title: '获取赛事列表失败',
          icon: 'none'
        })
      } finally {
        loading.value = false
      }
    }

    // 下拉刷新
    const onRefresh = () => {
      finished.value = false
      page.value = 1
      refreshing.value = true
      loadTournaments()
    }

    // 上拉加载
    const onLoad = () => {
      if (!loading.value && !finished.value) {
        loadTournaments()
      }
    }

    // 搜索
    const onSearch = () => {
      tournaments.value = []
      finished.value = false
      page.value = 1
      loadTournaments()
    }

    // 选择状态
    const selectStatus = (value) => {
      statusFilter.value = value
      statusFilterPopup.value.close()
      tournaments.value = []
      finished.value = false
      page.value = 1
      loadTournaments()
    }

    // 选择类型
    const selectType = (value) => {
      typeFilter.value = value
      typeFilterPopup.value.close()
      tournaments.value = []
      finished.value = false
      page.value = 1
      loadTournaments()
    }

    // 查看赛事详情
    const viewDetail = (id) => {
      uni.navigateTo({
        url: `/pages/tournament/detail?id=${id}`
      })
    }

    // 创建赛事
    const createTournament = () => {
      uni.navigateTo({
        url: '/pages/tournament/create'
      })
    }

    onMounted(() => {
      loadTournaments()
    })

    return {
      tournaments,
      loading,
      finished,
      refreshing,
      searchValue,
      statusFilter,
      typeFilter,
      statusOptions,
      typeOptions,
      statusFilterPopup,
      typeFilterPopup,
      getStatusClass,
      getStatusText,
      getTypeText,
      getStatusFilterText,
      getTypeFilterText,
      getDateRange,
      hasPermission,
      onSearch,
      onRefresh,
      onLoad,
      selectStatus,
      selectType,
      viewDetail,
      createTournament
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
.filter-popup {
  background: #fff;
  border-radius: 40rpx 40rpx 0 0;
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