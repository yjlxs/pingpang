<template>
  <view class="match-history">
    <!-- 赛事列表 -->
    <view v-if="!selectedTournament" class="tournament-list">
      <uni-nav-bar 
        title="我参加的赛事" 
        left-icon="arrow-left" 
        @click-left="goBack"
        fixed
      />
      
      <scroll-view 
        class="list-container" 
        scroll-y 
        @scrolltolower="loadMore"
        :refresher-triggered="refreshing"
        @refresherrefresh="onRefresh"
      >
        <view v-if="tournaments.length === 0 && !loading && !refreshing" class="empty-state">
          <text class="empty-icon">📋</text>
          <text class="empty-text">暂无参加的赛事</text>
        </view>
        
        <view 
          v-for="tournament in tournaments" 
          :key="tournament.id" 
          class="tournament-item"
          @tap="selectTournament(tournament)"
        >
          <text class="tournament-title">{{ tournament.title }}</text>
          <view class="tournament-info">
            <view class="info-tag">
              <text>{{ tournament.type === 'SINGLES' ? '单打' : '双打' }}</text>
            </view>
            <view class="info-tag">
              <text>{{ formatDate(tournament.startTime) }}</text>
            </view>
            <view :class="['status-tag', getStatusClass(tournament.status)]">
              <text>{{ getStatusText(tournament.status) }}</text>
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
    </view>

    <!-- 比赛历史详情 -->
    <view v-else class="match-detail">
      <uni-nav-bar 
        :title="selectedTournament.title" 
        left-icon="arrow-left" 
        @click-left="backToList"
        fixed
      />
      
      <!-- 统计数据卡片 -->
      <view class="stats-card">
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-value">{{ stats.totalMatches || 0 }}</text>
            <text class="stat-label">总场次</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.wins || 0 }}</text>
            <text class="stat-label">胜场</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ (stats.winRate || 0).toFixed(1) }}%</text>
            <text class="stat-label">胜率</text>
          </view>
        </view>
        
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-value">{{ (stats.avgScore || 0).toFixed(1) }}</text>
            <text class="stat-label">场均得分</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ (stats.avgLost || 0).toFixed(1) }}</text>
            <text class="stat-label">场均失分</text>
          </view>
        </view>
      </view>

      <!-- 比赛记录 -->
      <view class="match-tabs">
        <view class="tabs-header">
          <view 
            v-for="tab in tabs" 
            :key="tab.id"
            class="tab-item"
            :class="{ active: activeTab === tab.id }"
            @tap="switchTab(tab.id)"
          >
            <text>{{ tab.title }}</text>
          </view>
        </view>
        
        <view class="tabs-content">
          <!-- 小组赛 -->
          <view v-show="activeTab === 'group'" class="tab-pane">
            <view v-if="groupMatches.length === 0" class="empty-matches">
              <text class="empty-icon">📄</text>
              <text class="empty-text">暂无小组赛记录</text>
            </view>
            
            <view 
              v-for="match in groupMatches" 
              :key="match.id"
              class="match-card"
            >
              <view class="match-header">
                <text class="match-time">{{ formatTime(match.createdAt) }}</text>
                <view :class="['match-result', getResultClass(match)]">
                  <text>{{ getResultText(match) }}</text>
                </view>
              </view>
              
              <view class="match-content">
                <view class="match-opponent">
                  <text class="label">对手</text>
                  <text class="value">{{ match.opponentName }}</text>
                </view>
                
                <view class="match-score">
                  <text class="label">比分</text>
                  <text class="value">{{ match.player1Score || 0 }} : {{ match.player2Score || 0 }}</text>
                </view>
                
                <view class="match-points">
                  <text class="label">积分变更</text>
                  <view :class="['points-change', getPointsClass(match)]">
                    <text class="points-icon">{{ getPointsIcon(match) }}</text>
                    <text class="points-text">{{ getPointsText(match) }}</text>
                  </view>
                </view>
              </view>
              
              <view v-if="match.groupName" class="match-footer">
                <text class="group-info">小组：{{ match.groupName }}</text>
              </view>
            </view>
          </view>
          
          <!-- 淘汰赛 -->
          <view v-show="activeTab === 'knockout'" class="tab-pane">
            <view v-if="knockoutMatches.length === 0" class="empty-matches">
              <text class="empty-icon">🏆</text>
              <text class="empty-text">暂无淘汰赛记录</text>
            </view>
            
            <view 
              v-for="match in knockoutMatches" 
              :key="match.id"
              class="match-card"
            >
              <view class="match-header">
                <text class="match-time">{{ formatTime(match.createdAt) }}</text>
                <view :class="['match-result', getResultClass(match)]">
                  <text>{{ getResultText(match) }}</text>
                </view>
              </view>
              
              <view class="match-content">
                <view class="match-opponent">
                  <text class="label">对手</text>
                  <text class="value">{{ match.opponentName }}</text>
                </view>
                
                <view class="match-score">
                  <text class="label">比分</text>
                  <text class="value">{{ match.player1Score || 0 }} : {{ match.player2Score || 0 }}</text>
                </view>
                
                <view class="match-points">
                  <text class="label">积分变更</text>
                  <view :class="['points-change', getPointsClass(match)]">
                    <text class="points-icon">{{ getPointsIcon(match) }}</text>
                    <text class="points-text">{{ getPointsText(match) }}</text>
                  </view>
                </view>
              </view>
              
              <view v-if="match.round" class="match-footer">
                <text class="round-info">第{{ match.round }}轮</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, onMounted } from 'vue'
import { getUserMatchHistory, getUserMatchStats } from '@/api/match'
import { getUserTournaments } from '@/api/tournament'

export default {
  setup() {
    const loading = ref(false)
    const finished = ref(false)
    const refreshing = ref(false)
    const pageNum = ref(1)
    const pageSize = 10
    const tournaments = ref([])
    const selectedTournament = ref(null)
    const stats = ref({})
    const activeTab = ref('group')
    const groupMatches = ref([])
    const knockoutMatches = ref([])
    
    // 选项卡配置
    const tabs = [
      { id: 'group', title: '小组赛' },
      { id: 'knockout', title: '淘汰赛' }
    ]

    // 格式化日期
    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      try {
        const date = new Date(dateStr)
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${month}-${day}`
      } catch (error) {
        return dateStr.substring(0, 10)
      }
    }

    // 格式化时间
    const formatTime = (dateStr) => {
      if (!dateStr) return ''
      try {
        const date = new Date(dateStr)
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      } catch (error) {
        return dateStr.substring(11, 16)
      }
    }

    // 加载赛事列表
    const loadTournaments = async () => {
      if (loading.value || finished.value) return
      
      try {
        loading.value = true
        const res = await getUserTournaments({
          pageNum: pageNum.value,
          pageSize
        })
        
        if (res.data && res.data.list) {
          tournaments.value.push(...res.data.list)
          
          if (res.data.list.length < pageSize) {
            finished.value = true
          } else {
            pageNum.value++
          }
        } else {
          finished.value = true
        }
      } catch (error) {
        console.error('加载赛事列表失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
        finished.value = true
      } finally {
        loading.value = false
        refreshing.value = false
      }
    }

    // 下拉刷新
    const onRefresh = () => {
      tournaments.value = []
      pageNum.value = 1
      finished.value = false
      refreshing.value = true
      loadTournaments()
    }

    // 加载更多
    const loadMore = () => {
      loadTournaments()
    }

    // 选择赛事
    const selectTournament = async (tournament) => {
      selectedTournament.value = tournament
      await loadMatchHistory(tournament.id)
    }

    // 返回列表
    const backToList = () => {
      selectedTournament.value = null
    }

    // 返回上一页
    const goBack = () => {
      if (selectedTournament.value) {
        backToList()
      } else {
        uni.navigateBack()
      }
    }

    // 切换选项卡
    const switchTab = (tabId) => {
      activeTab.value = tabId
    }

    // 加载比赛历史
    const loadMatchHistory = async (tournamentId) => {
      try {
        loading.value = true
        
        const [historyRes, statsRes] = await Promise.all([
          getUserMatchHistory({
            tournamentId,
            pageNum: 1,
            pageSize: 100
          }),
          getUserMatchStats(tournamentId)
        ])
        
        // 分离小组赛和淘汰赛数据
        let matches = []
        if (historyRes.data && historyRes.data.list) {
          matches = historyRes.data.list
        }
        
        // 获取当前用户ID（根据你的实际实现调整）
        const currentUserId = uni.getStorageSync('userId') || 'current-user'
        
        // 为每场比赛添加对手名称
        matches.forEach(match => {
          if (match.player1Id === currentUserId) {
            match.opponentName = match.player2Name
          } else if (match.player2Id === currentUserId) {
            match.opponentName = match.player1Name
          } else {
            match.opponentName = '未知对手'
          }
        })
        
        groupMatches.value = matches.filter(m => m.groupName)
        knockoutMatches.value = matches.filter(m => !m.groupName)
        
        stats.value = statsRes.data || {}
      } catch (error) {
        console.error('加载比赛历史失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        loading.value = false
      }
    }

    // 获取比赛结果文本
    const getResultText = (match) => {
      // 获取当前用户ID（根据你的实际实现调整）
      const currentUserId = uni.getStorageSync('userId') || 'current-user'
      if (match.winnerId === currentUserId) {
        return '胜'
      } else if (match.winnerId) {
        return '负'
      } else {
        return '平'
      }
    }

    // 获取比赛结果样式类
    const getResultClass = (match) => {
      const currentUserId = uni.getStorageSync('userId') || 'current-user'
      if (match.winnerId === currentUserId) {
        return 'result-win'
      } else if (match.winnerId) {
        return 'result-lose'
      } else {
        return 'result-draw'
      }
    }

    // 获取积分变更样式
    const getPointsClass = (match) => {
      if (match.pointsChange > 0) {
        return 'points-increase'
      } else if (match.pointsChange < 0) {
        return 'points-decrease'
      } else {
        return 'points-neutral'
      }
    }

    // 获取积分图标
    const getPointsIcon = (match) => {
      if (match.pointsChange > 0) {
        return '↑'
      } else if (match.pointsChange < 0) {
        return '↓'
      } else {
        return '→'
      }
    }

    // 获取积分变更文本
    const getPointsText = (match) => {
      const change = match.pointsChange > 0 ? `+${match.pointsChange}` : match.pointsChange
      return `积分${change || 0}`
    }

    // 获取赛事状态样式
    const getStatusClass = (status) => {
      const classMap = {
        'DRAFT': 'status-draft',
        'REGISTERING': 'status-registering',
        'ONGOING': 'status-ongoing',
        'FINISHED': 'status-finished'
      }
      return classMap[status] || 'status-default'
    }

    // 获取赛事状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'DRAFT': '草稿',
        'REGISTERING': '报名中',
        'ONGOING': '进行中',
        'FINISHED': '已结束'
      }
      return statusMap[status] || status
    }

    onMounted(() => {
      // 检查URL参数中是否有赛事ID
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      const tournamentId = currentPage.options.tournamentId
      
      if (tournamentId) {
        // 如果URL中包含赛事ID，直接加载该赛事的比赛历史
        selectTournament({ id: tournamentId })
      } else {
        // 否则加载赛事列表
        loadTournaments()
      }
    })

    return {
      loading,
      finished,
      refreshing,
      tournaments,
      selectedTournament,
      stats,
      activeTab,
      groupMatches,
      knockoutMatches,
      tabs,
      formatDate,
      formatTime,
      onRefresh,
      loadMore,
      selectTournament,
      backToList,
      goBack,
      switchTab,
      getResultText,
      getResultClass,
      getPointsClass,
      getPointsIcon,
      getPointsText,
      getStatusClass,
      getStatusText
    }
  }
}
</script>

<style scoped>
.match-history {
  min-height: 100vh;
  background-color: #f7f8fa;
  display: flex;
  flex-direction: column;
}

/* 赛事列表样式 */
.tournament-list {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.list-container {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.tournament-item {
  background: #fff;
  margin-bottom: 20rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tournament-item:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.tournament-title {
  font-size: 34rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
  color: #333;
  display: block;
}

.tournament-info {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.info-tag,
.status-tag {
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
}

.info-tag {
  background-color: #f5f5f5;
  color: #666;
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
  opacity: 0.3;
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

/* 比赛详情样式 */
.match-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 统计数据卡片 */
.stats-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.stats-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.stats-row:last-child {
  margin-bottom: 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 44rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.stat-label {
  font-size: 26rpx;
  color: #666;
}

/* 比赛记录选项卡 */
.match-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  margin: 0 30rpx 30rpx;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.tabs-header {
  display: flex;
  background-color: #f8f9fa;
  border-bottom: 2rpx solid #eee;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 30rpx 0;
  font-size: 30rpx;
  color: #666;
  position: relative;
}

.tab-item.active {
  color: #1989fa;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 4rpx;
  background-color: #1989fa;
  border-radius: 2rpx;
}

.tabs-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.tab-pane {
  padding: 30rpx;
  min-height: 200rpx;
}

/* 比赛卡片 */
.match-card {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.match-time {
  font-size: 26rpx;
  color: #999;
}

.match-result {
  padding: 6rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.result-win {
  background-color: #e8f8e8;
  color: #07c160;
}

.result-lose {
  background-color: #ffeaea;
  color: #ee0a24;
}

.result-draw {
  background-color: #f5f5f5;
  color: #666;
}

.match-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.match-opponent,
.match-score,
.match-points {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.match-opponent .label,
.match-score .label,
.match-points .label {
  font-size: 28rpx;
  color: #666;
  min-width: 120rpx;
}

.match-opponent .value,
.match-score .value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.points-change {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.points-increase {
  color: #07c160;
}

.points-decrease {
  color: #ee0a24;
}

.points-neutral {
  color: #666;
}

.points-icon {
  font-size: 24rpx;
}

.match-footer {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.group-info,
.round-info {
  font-size: 26rpx;
  color: #999;
}

/* 比赛为空状态 */
.empty-matches {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.empty-matches .empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
  opacity: 0.3;
}

.empty-matches .empty-text {
  font-size: 30rpx;
  color: #999;
}
</style>