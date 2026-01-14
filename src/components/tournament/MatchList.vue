<template>
  <view class="match-list">
    <view v-for="(match, index) in matches" :key="match.id" class="match-item">
      <view class="match-players">
        <view class="player">
          <text class="player-number">#{{ index + 1 }}</text>
          <text class="player-name">{{ match.player1Name }}</text>
        </view>
        <view class="score-section" @click="showScoreDialog(match)">
          <view :class="['score-tag', getScoreTagClass(match.player1Score, match.player2Score)]">
            <text>{{ match.player1Score || 0 }}</text>
          </view>
          <text class="score-separator">:</text>
          <view :class="['score-tag', getScoreTagClass(match.player2Score, match.player1Score)]">
            <text>{{ match.player2Score || 0 }}</text>
          </view>
        </view>
        <view class="player player-right">
          <text class="player-name">{{ match.player2Name }}</text>
          <text class="player-number">#{{ index + 2 }}</text>
        </view>
      </view>
      <view class="match-footer">
        <view :class="['status-tag', getStatusTagClass(match.status)]">
          <text>{{ getStatusText(match.status) }}</text>
        </view>
        <button 
          v-if="match.status !== 'FINISHED'"
          type="primary" 
          size="small"
          @click="showScoreDialog(match)"
        >
          设置比分
        </button>
      </view>
    </view>

    <!-- 比分设置面板 -->
    <view class="score-panel" :class="{ 'score-panel-show': dialogVisible }">
      <view class="score-panel-mask" @click="dialogVisible = false"></view>
      <view class="score-panel-content">
        <view class="score-panel-header">
          <text>设置比分</text>
          <text class="close-btn" @click="dialogVisible = false">×</text>
        </view>
        <view class="score-panel-body">
          <!-- 修复可选链操作符 -->
          <view class="score-row">
            <text class="player-name">{{ currentMatch && currentMatch.player1Name }}</text>
            <input
              v-model="player1Score"
              type="tel"
              class="score-input"
              placeholder="比分"
            />
          </view>
          <view class="score-row">
            <text class="player-name">{{ currentMatch && currentMatch.player2Name }}</text>
            <input
              v-model="player2Score"
              type="tel"
              class="score-input"
              placeholder="比分"
            />
          </view>
        </view>
        <view class="score-panel-footer">
          <button plain block @click="dialogVisible = false">取消</button>
          <button type="primary" block @click="handleScoreConfirm">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// UniApp 使用 Vue 2 的 Options API
export default {
  name: 'MatchList',
  props: {
    matches: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      dialogVisible: false,
      currentMatch: null,
      player1Score: '',
      player2Score: ''
    }
  },
  methods: {
    getScoreTagClass(score1, score2) {
      if (!score1 || !score2) return 'score-default'
      return parseInt(score1) > parseInt(score2) ? 'score-win' : 'score-lose'
    },
    
    getStatusTagClass(status) {
      switch (status) {
        case 'FINISHED':
          return 'status-finished'
        case 'ONGOING':
          return 'status-ongoing'
        default:
          return 'status-default'
      }
    },
    
    getStatusText(status) {
      switch (status) {
        case 'PENDING':
          return '未开始'
        case 'ONGOING':
          return '进行中'
        case 'FINISHED':
          return '已结束'
        default:
          return '未知'
      }
    },
    
    showScoreDialog(match) {
      this.currentMatch = match
      this.player1Score = match.player1Score || ''
      this.player2Score = match.player2Score || ''
      this.dialogVisible = true
    },
    
    handleScoreConfirm() {
      const score1 = parseInt(this.player1Score)
      const score2 = parseInt(this.player2Score)

      if (isNaN(score1) || isNaN(score2)) {
        // 使用 UniApp 的提示
        uni.showToast({
          title: '请输入有效的比分',
          icon: 'none'
        })
        return
      }

      if (score1 < 0 || score2 < 0) {
        uni.showToast({
          title: '比分不能为负数',
          icon: 'none'
        })
        return
      }

      if (score1 === score2) {
        uni.showToast({
          title: '比分不能相等',
          icon: 'none'
        })
        return
      }

      this.$emit('score-update', this.currentMatch.id, score1, score2)
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.close-btn {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx 20rpx;
  line-height: 1;
  cursor: pointer;
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.match-item {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.match-players {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.player {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.player-right {
  justify-content: flex-end;
}

.player-name {
  font-size: 14px;
  color: #323233;
}

.player-number {
  font-size: 12px;
  color: #969799;
  background-color: #f7f8fa;
  padding: 2px 6px;
  border-radius: 10px;
}

.score-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
}

.score-tag {
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-weight: bold;
}

.score-win {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.score-lose {
  background-color: #ffebee;
  color: #c62828;
}

.score-default {
  background-color: #f5f5f5;
  color: #757575;
}

.score-separator {
  font-size: 16px;
  font-weight: bold;
  color: #323233;
}

.match-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.status-tag {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.status-finished {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-ongoing {
  background-color: #e3f2fd;
  color: #1565c0;
}

.status-default {
  background-color: #f5f5f5;
  color: #757575;
}

.score-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  visibility: hidden;
  transform: translateY(100%);
  transition: transform 0.3s, visibility 0.3s;
}

.score-panel-show {
  visibility: visible;
  transform: translateY(0);
}

.score-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
}

.score-panel-content {
  position: relative;
  background: white;
  border-radius: 16px 16px 0 0;
  overflow: hidden;
  z-index: 9999;
}

.score-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #ebedf0;
  font-size: 16px;
  font-weight: 500;
}

.score-panel-body {
  padding: 20px 16px;
}

.score-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.score-row:last-child {
  margin-bottom: 0;
}

.player-name {
  flex: 1;
  font-size: 16px;
  color: #323233;
  margin-right: 16px;
}

.score-input {
  width: 100px;
  height: 44px;
  background: #f7f8fa;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  text-align: center;
  font-size: 16px;
  color: #323233;
}

.score-panel-footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #ebedf0;
}
</style>