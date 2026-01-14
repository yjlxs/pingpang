<template>
  <view class="tournament-detail">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <text class="navbar-icon">‹</text>
        <text class="navbar-text">返回</text>
      </view>
      <text class="navbar-title">赛事详情</text>
      <view class="navbar-right"></view>
    </view>

    <!-- 选项卡导航 -->
    <view class="tabs-container">
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

      <!-- 详情选项卡 -->
      <view v-show="activeTab === 'details'" class="tab-content">
        <scroll-view class="content-scroll" scroll-y>
          <!-- 基本信息卡片 -->
          <view class="info-card">
            <view class="card-header">
              <text class="tournament-title">{{ tournament.title }}</text>
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
              <view class="info-item">
                <text class="icon">📊</text>
                <text class="label">积分上限：</text>
                <text class="value">{{ tournament.level === '0' ? '无限制' : tournament.level }}</text>
              </view>
              <view class="info-item">
                <text class="icon">💰</text>
                <text class="label">报名费用：</text>
                <text class="value">{{ tournament.entryFee }}元</text>
              </view>
            </view>
          </view>

          <!-- 赛事说明卡片 -->
          <view class="description-card">
            <text class="section-title">赛事说明</text>
            <view class="description-content">
              <text>{{ tournament.description }}</text>
            </view>
          </view>

          <!-- 操作按钮区域 -->
          <view class="action-space">
            <!-- 空白的间距区域 -->
          </view>
        </scroll-view>

        <!-- 操作按钮栏（固定在底部） -->
        <view class="action-bar">
          <!-- 状态操作按钮 -->
          <template v-if="hasPermission('tournament:edit')">
            <button 
              v-if="tournament.status === 'DRAFT'"
              type="primary" 
              class="action-btn"
              @tap="updateStatus('REGISTERING')"
            >
              开始报名
            </button>
            <button 
              v-if="tournament.status === 'REGISTERING'"
              type="primary" 
              class="action-btn"
              @tap="handleStartTournament"
            >
              开始比赛
            </button>
            <button 
              v-if="tournament.status === 'ONGOING'"
              type="warn" 
              class="action-btn"
              @tap="updateStatus('FINISHED')"
            >
              结束比赛
            </button>
          </template>

          <!-- 编辑按钮 -->
          <template v-if="hasPermission('tournament:edit') && tournament.status === 'DRAFT'">
            <button 
              type="default" 
              class="action-btn"
              @tap="editTournament"
            >
              编辑赛事
            </button>
          </template>

          <!-- 删除按钮 -->
          <template v-if="hasPermission('tournament:delete') && tournament.status === 'DRAFT'">
            <button 
              type="warn" 
              class="action-btn delete-btn"
              @tap="deleteTournament"
            >
              删除赛事
            </button>
          </template>

          <!-- 报名按钮 -->
          <button 
            v-if="tournament.status === 'REGISTERING' && !isRegistered"
            type="primary" 
            class="action-btn"
            @tap="register"
          >
            立即报名
          </button>

          <!-- 取消报名按钮 -->
          <button 
            v-if="tournament.status === 'REGISTERING' && isRegistered"
            type="warn" 
            class="action-btn"
            @tap="cancelRegistration"
          >
            取消报名
          </button>
        </view>
      </view>

      <!-- 参赛名单选项卡 -->
      <view v-show="activeTab === 'registrations'" class="tab-content">
        <scroll-view class="content-scroll" scroll-y>
          <view class="registrations-card">
            <view v-if="sortedRegistrations.length > 0" class="registration-list">
              <view 
                v-for="(registration, index) in sortedRegistrations" 
                :key="registration.id" 
                class="registration-item"
              >
                <view class="user-info" @tap="showUserDetail(registration.user)">
                  <view class="index-circle">{{ index + 1 }}</view>
                  <text class="name">{{ registration.user && registration.user.nickname }}</text>
                </view>
                <view class="tags-container">
                  <view class="points-tag">
                    <text>{{ registration.user && registration.user.points || 0 }}分</text>
                  </view>
                  <view :class="['status-tag', getRegistrationStatusClass(registration.status)]">
                    <text>{{ getRegistrationStatusText(registration.status) }}</text>
                  </view>
                </view>
              </view>
            </view>
            <view v-else class="empty-state">
              <text class="empty-icon">📋</text>
              <text class="empty-text">暂无报名信息</text>
            </view>
          </view>
        </scroll-view>
      </view>

      <!-- 赛程选项卡 -->
      <view v-show="activeTab === 'schedule'" class="tab-content">
        <scroll-view class="content-scroll" scroll-y>
          <view class="schedule-card">
            <!-- 这里可以放置 TournamentSchedule 组件 -->
            <view class="schedule-placeholder">
              <text class="placeholder-text">赛程安排将在这里显示</text>
              <text class="placeholder-subtext">小组赛和淘汰赛的详细赛程</text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 用户详情弹窗 -->
    <view class="detail-popup" v-if="showUserDetailPopup">
      <view class="popup-mask" @tap="closeUserDetailPopup"></view>
      <view class="popup-content">
        <view class="popup-header">
          <text class="header-title">用户详情</text>
          <view class="close-btn" @tap="closeUserDetailPopup">
            <text>×</text>
          </view>
        </view>
        <scroll-view class="user-info-scroll" scroll-y>
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

    <!-- 报名确认弹窗 -->
    <view class="register-dialog" v-if="showRegisterPopup">
      <view class="dialog-mask" @tap="cancelRegister"></view>
      <view class="dialog-content">
        <text class="dialog-title">报名确认</text>
        <view class="dialog-body">
          <text class="dialog-message">
            {{ tournament.currentPlayers >= tournament.maxPlayers 
              ? '当前报名人数已满，您将进入候补名单，是否继续？' 
              : '确认报名参加该赛事吗？' }}
          </text>
          <text v-if="tournament.entryFee > 0" class="fee-info">
            需支付报名费：{{ tournament.entryFee }}元
          </text>
        </view>
        <view class="dialog-actions">
          <button class="dialog-btn cancel-btn" @tap="cancelRegister">取消</button>
          <button class="dialog-btn confirm-btn" @tap="confirmRegister">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 使用 Vue 2 Options API
export default {
  name: 'TournamentDetail',
  data() {
    return {
      tournament: {},
      registrations: [],
      isRegistered: false,
      myRegistration: null,
      selectedUser: null,
      activeTab: 'details',
      groupingStrategy: null,
      showUserDetailPopup: false,
      showRegisterPopup: false,
      tabs: [
        { id: 'details', title: '详情' },
        { id: 'registrations', title: '参赛名单' },
        { id: 'schedule', title: '赛程' }
      ]
    }
  },
  computed: {
    // 按积分降序排序的报名列表
    sortedRegistrations() {
      return [...this.registrations].sort((a, b) => {
        return (b.user?.points || 0) - (a.user?.points || 0)
      })
    }
  },
  mounted() {
    this.loadTournament()
  },
  methods: {
    // 获取当前用户ID
    getCurrentUserId() {
      return uni.getStorageSync('userId') || null
    },
    
    // 获取日期范围
    getDateRange(startTime, endTime) {
      if (!startTime || !endTime) return '待定'
      const start = new Date(startTime).toLocaleDateString()
      const end = new Date(endTime).toLocaleDateString()
      return start === end ? start : `${start} - ${end}`
    },
    
    // 权限检查
    hasPermission(permission) {
      // 这里需要你真实的权限检查逻辑
      // 临时返回 true 用于测试
      return true
    },
    
    // 获取赛事详情
    async loadTournament() {
      try {
        // 从页面参数获取赛事ID
        const pages = getCurrentPages()
        const currentPage = pages[pages.length - 1]
        const tournamentId = currentPage.options.id || currentPage.options.tournamentId
        
        if (!tournamentId) {
          uni.showToast({
            title: '赛事ID不存在',
            icon: 'none'
          })
          this.goBack()
          return
        }

        // 这里需要你真实的 API 调用
        // const res = await getTournamentById(tournamentId)
        // this.tournament = res.data || {}
        
        // 示例数据
        this.tournament = {
          id: 1,
          title: '春季乒乓球锦标赛',
          status: 'REGISTERING',
          startTime: '2024-03-15',
          endTime: '2024-03-17',
          location: '市体育馆',
          currentPlayers: 24,
          maxPlayers: 32,
          type: 'SINGLES',
          level: '2000',
          entryFee: 50,
          description: '一年一度的春季乒乓球锦标赛，欢迎各位选手参加！'
        }
        
        await this.loadRegistrations()
        
        if (this.tournament?.status === 'REGISTERING') {
          this.loadGroupingStrategy()
        }
      } catch (error) {
        console.error('获取赛事信息失败:', error)
        uni.showToast({
          title: '获取赛事信息失败',
          icon: 'none'
        })
        this.goBack()
      }
    },
    
    // 获取报名列表
    async loadRegistrations() {
      try {
        const tournamentId = this.tournament.id
        if (!tournamentId) return
        
        // 这里需要你真实的 API 调用
        // const res = await getRegistrations(tournamentId)
        // this.registrations = res.data || []
        
        // 示例数据
        this.registrations = [
          {
            id: 1,
            userId: 101,
            status: 'APPROVED',
            user: {
              id: 101,
              nickname: '张三',
              points: 2450,
              gripStyle: '横拍',
              racketConfig: '蝴蝶王+狂飙3',
              level: '大师',
              matchCount: 120,
              totalRank: 1,
              winRate: 85,
              highestPoints: 2500,
              yearlyAveragePoints: 2400
            }
          },
          {
            id: 2,
            userId: 102,
            status: 'APPROVED',
            user: {
              id: 102,
              nickname: '李四',
              points: 2350,
              gripStyle: '直拍',
              racketConfig: '斯蒂卡+多尼克',
              level: '专业',
              matchCount: 98,
              totalRank: 2,
              winRate: 78,
              highestPoints: 2400,
              yearlyAveragePoints: 2300
            }
          }
        ]
        
        const userId = this.getCurrentUserId()
        if (userId) {
          this.myRegistration = this.registrations.find(r => r.userId === userId)
          this.isRegistered = !!this.myRegistration
        }
      } catch (error) {
        console.error('获取参赛名单失败:', error)
        uni.showToast({
          title: '获取参赛名单失败',
          icon: 'none'
        })
      }
    },
    
    // 获取分组策略
    async loadGroupingStrategy() {
      try {
        // 这里需要你真实的 API 调用
        // const res = await getGroupingStrategy(this.tournament.id)
        // this.groupingStrategy = res.data
        this.groupingStrategy = { type: 'RANDOM', groupCount: 4 }
      } catch (error) {
        console.error('获取分组策略失败:', error)
      }
    },
    
    // 返回上一页
    goBack() {
      uni.navigateBack()
    },
    
    // 切换选项卡
    switchTab(tabId) {
      this.activeTab = tabId
    },
    
    // 更新赛事状态
    async updateStatus(status) {
      try {
        const statusTextMap = {
          'REGISTERING': '开始报名',
          'ONGOING': '开始比赛',
          'FINISHED': '结束比赛'
        }
        
        uni.showModal({
          title: '确认操作',
          content: `确定要${statusTextMap[status]}吗？`,
          success: async (res) => {
            if (res.confirm) {
              // 这里需要你真实的 API 调用
              // await updateTournamentStatus(this.tournament.id, status)
              uni.showToast({
                title: '状态更新成功',
                icon: 'success'
              })
              await this.loadTournament()
            }
          }
        })
      } catch (error) {
        uni.showToast({
          title: '状态更新失败',
          icon: 'none'
        })
      }
    },
    
    // 开始比赛
    async handleStartTournament() {
      try {
        uni.showModal({
          title: '确认开始比赛',
          content: '确定要开始比赛吗？开始后将自动生成对阵表。',
          success: async (res) => {
            if (res.confirm) {
              // 这里需要你真实的 API 调用
              // await startTournament(this.tournament.id)
              uni.showToast({
                title: '比赛已开始',
                icon: 'success'
              })
              await this.loadTournament()
            }
          }
        })
      } catch (error) {
        uni.showToast({
          title: '开始比赛失败',
          icon: 'none'
        })
      }
    },
    
    // 报名
    register() {
      if (this.tournament.entryFee > 0) {
        this.showRegisterPopup = true
      } else {
        uni.showModal({
          title: '报名确认',
          content: this.tournament.currentPlayers >= this.tournament.maxPlayers
            ? '当前报名人数已满，您将进入候补名单，是否继续？'
            : '确认报名参加该赛事吗？',
          success: async (res) => {
            if (res.confirm) {
              await this.confirmRegister()
            }
          }
        })
      }
    },
    
    // 确认报名
    async confirmRegister() {
      try {
        // 这里需要你真实的 API 调用
        // await registerApi(this.tournament.id)
        uni.showToast({
          title: '报名成功',
          icon: 'success'
        })
        this.showRegisterPopup = false
        await this.loadRegistrations()
      } catch (error) {
        uni.showToast({
          title: '报名失败',
          icon: 'none'
        })
      }
    },
    
    // 取消报名弹窗
    cancelRegister() {
      this.showRegisterPopup = false
    },
    
    // 取消报名（已报名状态）
    async cancelRegistration() {
      try {
        uni.showModal({
          title: '确认取消',
          content: '确定要取消报名吗？取消后如需参加需要重新报名。',
          success: async (res) => {
            if (res.confirm) {
              // 这里需要你真实的 API 调用
              // await cancelRegistrationApi(this.tournament.id)
              uni.showToast({
                title: '取消报名成功',
                icon: 'success'
              })
              await this.loadRegistrations()
            }
          }
        })
      } catch (error) {
        uni.showToast({
          title: '取消报名失败',
          icon: 'none'
        })
      }
    },
    
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
    
    // 获取报名状态文本
    getRegistrationStatusText(status) {
      const textMap = {
        'PENDING': '已报名',
        'APPROVED': '已报名',
        'REJECTED': '已拒绝',
        'WAITLIST': '候补中'
      }
      return textMap[status] || status
    },
    
    // 获取报名状态样式类
    getRegistrationStatusClass(status) {
      const classMap = {
        'PENDING': 'registration-pending',
        'APPROVED': 'registration-approved',
        'REJECTED': 'registration-rejected',
        'WAITLIST': 'registration-waitlist'
      }
      return classMap[status] || 'registration-default'
    },
    
    // 编辑赛事
    editTournament() {
      uni.showModal({
        title: '确认编辑',
        content: '确定要编辑该赛事吗？',
        success: (res) => {
          if (res.confirm) {
            uni.navigateTo({
              url: `/pages/tournament/edit?id=${this.tournament.id}`
            })
          }
        }
      })
    },
    
    // 删除赛事
    async deleteTournament() {
      try {
        uni.showModal({
          title: '确认删除',
          content: `确定要删除赛事"${this.tournament.title}"吗？删除后无法恢复。`,
          success: async (res) => {
            if (res.confirm) {
              // 这里需要你真实的 API 调用
              // await deleteTournamentApi(this.tournament.id)
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
              this.goBack()
            }
          }
        })
      } catch (error) {
        uni.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
    },
    
    // 显示用户详情
    showUserDetail(user) {
      this.selectedUser = user
      this.showUserDetailPopup = true
    },
    
    // 关闭用户详情弹窗
    closeUserDetailPopup() {
      this.showUserDetailPopup = false
    }
  }
}
</script>

<style scoped>
.tournament-detail {
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

/* 选项卡容器 */
.tabs-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tabs-header {
  display: flex;
  background-color: #fff;
  border-bottom: 2rpx solid #eee;
  position: sticky;
  top: 88rpx;
  z-index: 10;
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

.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.content-scroll {
  flex: 1;
}

/* 基本信息卡片 */
.info-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30rpx;
}

.tournament-title {
  font-size: 38rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
  line-height: 1.4;
}

.status-tag {
  padding: 8rpx 24rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
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
  opacity: 0.7;
}

.info-item .label {
  color: #999;
  min-width: 160rpx;
}

.info-item .value {
  flex: 1;
  color: #333;
}

/* 赛事说明卡片 */
.description-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 0 30rpx 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
}

.description-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* 操作按钮栏 */
.action-space {
  height: 160rpx; /* 为底部操作栏预留空间 */
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 30rpx;
  padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  z-index: 100;
}

.action-btn {
  height: 88rpx;
  border-radius: 44rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background-color: #1989fa;
  color: #fff;
}

.action-btn[type="default"] {
  background-color: #f5f5f5;
  color: #333;
  border: 2rpx solid #eee;
}

.action-btn[type="warn"] {
  background-color: #ff4444;
  color: #fff;
}

.delete-btn {
  background-color: #ff4444;
  color: #fff;
}

/* 参赛名单卡片 */
.registrations-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 30rpx;
  min-height: 200rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.registration-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.registration-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  background-color: #f8f9fa;
  border-radius: 16rpx;
}

.registration-item .user-info {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.registration-item .index-circle {
  width: 48rpx;
  height: 48rpx;
  background-color: #f2f3f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
  color: #666;
  font-weight: 500;
}

.registration-item .name {
  font-size: 30rpx;
  font-weight: 500;
  color: #323233;
}

.tags-container {
  display: flex;
  gap: 16rpx;
  align-items: center;
}

.points-tag {
  padding: 6rpx 16rpx;
  background-color: #e8f3ff;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #1989fa;
}

.registration-pending,
.registration-approved {
  background-color: #e8f8e8;
  color: #07c160;
}

.registration-rejected {
  background-color: #ffeaea;
  color: #ee0a24;
}

.registration-waitlist {
  background-color: #fff7e6;
  color: #ff976a;
}

.registration-default {
  background-color: #f5f5f5;
  color: #666;
}

/* 赛程卡片 */
.schedule-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin: 30rpx;
  min-height: 200rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.schedule-placeholder {
  text-align: center;
}

.placeholder-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 16rpx;
}

.placeholder-subtext {
  font-size: 26rpx;
  color: #999;
  display: block;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
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

/* 用户详情弹窗 */
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
  background: #fff;
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

.user-info-scroll {
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

/* 报名确认弹窗 */
.register-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
}

.dialog-content {
  position: relative;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  width: 600rpx;
  max-width: 90vw;
  z-index: 1002;
}

.dialog-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 30rpx;
  display: block;
}

.dialog-body {
  margin-bottom: 40rpx;
}

.dialog-message {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  display: block;
  margin-bottom: 20rpx;
}

.fee-info {
  font-size: 28rpx;
  color: #ff4444;
  display: block;
}

.dialog-actions {
  display: flex;
  gap: 20rpx;
}

.dialog-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background-color: #1989fa;
  color: #fff;
}

/* 安全区域适配 */
@media only screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3),
       only screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3),
       only screen and (device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) {
  .action-bar {
    padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
  }
}
</style>