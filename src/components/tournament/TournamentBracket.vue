<template>
  <view class="tournament-bracket">
    <!-- 淘汰赛对阵图 -->
    <view class="bracket-container">
      <view v-for="(round, roundIndex) in rounds" :key="roundIndex" class="round">
        <view class="round-title">{{ getRoundTitle(roundIndex) }}</view>
        <view class="matches">
          <view v-for="(match, matchIndex) in round" :key="match.id" class="match-container">
            <view class="match">
              <view :id="roundIndex" class="match-wrapper" @click="handleMatchClick(match)">
                <view class="player" :class="{ 'winner': match.winner === 'PLAYER1' }">
                  <text class="player-name">{{ match.player1Name || '轮空' }}</text>
                  <text class="score">{{ match.player1Score || 0 }}</text>
                </view>
                <view class="player" :class="{ 'winner': match.winner === 'PLAYER2' }">
                  <text class="player-name">{{ match.player2Name || '轮空' }}</text>
                  <text class="score">{{ match.player2Score || 0 }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 比分设置弹窗 - 使用 UniApp 的 uni-popup -->
    <view v-if="showScoreDialog" class="popup-mask" @click="closeScoreDialog">
      <view class="popup-content" @click.stop>
        <view class="dialog-header">
          <text>设置比分</text>
          <text class="close-btn" @click="closeScoreDialog">×</text>
        </view>
        <view class="dialog-body">
          <view class="score-row">
            <text class="player-name">{{ currentMatch && currentMatch.player1Name }}</text>
            <view class="score-input-wrapper">
              <input
                v-model="player1Score"
                type="number"
                class="score-input"
                placeholder="比分"
              />
              <view class="score-buttons">
                <text class="score-btn up" @click="adjustScore(1, 1)">▲</text>
                <text class="score-btn down" @click="adjustScore(1, -1)">▼</text>
              </view>
            </view>
          </view>
          <view class="score-row">
            <text class="player-name">{{ currentMatch && currentMatch.player2Name }}</text>
            <view class="score-input-wrapper">
              <input
                v-model="player2Score"
                type="number"
                class="score-input"
                placeholder="比分"
              />
              <view class="score-buttons">
                <text class="score-btn up" @click="adjustScore(2, 1)">▲</text>
                <text class="score-btn down" @click="adjustScore(2, -1)">▼</text>
              </view>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="cancel-btn" @click="closeScoreDialog">取消</button>
          <button class="confirm-btn" @click="handleScoreSubmit">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 移除所有 Vant 和 Vue 3 导入
export default {
  name: 'TournamentBracket',
  props: {
    matches: {
      type: Array,
      default: () => []
    },
    tournamentId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      showScoreDialog: false,
      currentMatch: null,
      player1Score: '0',
      player2Score: '0'
    }
  },
  computed: {
    // 按轮次分组比赛
    rounds() {
      if (!this.matches) return []
      
      const roundsMap = {}
      this.matches.forEach(match => {
        const round = match.round || 1
        if (!roundsMap[round]) {
          roundsMap[round] = []
        }
        roundsMap[round].push(match)
      })
      return Object.values(roundsMap)
    }
  },
  methods: {
    getRoundTitle(index) {
      const totalRounds = this.rounds.length
      if (index === totalRounds - 1) {
        return '决赛'
      } else if (index === totalRounds - 2) {
        return '半决赛'
      } else if (index === totalRounds - 3) {
        return '四分之一决赛'
      } else {
        return `第${index + 1}轮`
      }
    },
    
    handleMatchClick(match) {
      if (match.status === 'FINISHED' || !match.player1Name || !match.player2Name) return
      this.currentMatch = match
      this.player1Score = String(match.player1Score || 0)
      this.player2Score = String(match.player2Score || 0)
      this.showScoreDialog = true
    },
    
    closeScoreDialog() {
      this.showScoreDialog = false
    },
    
    adjustScore(player, delta) {
      const scoreKey = player === 1 ? 'player1Score' : 'player2Score'
      const currentScore = parseInt(this[scoreKey]) || 0
      this[scoreKey] = String(Math.max(0, currentScore + delta))
    },
    
    async handleScoreSubmit() {
      try {
        const score1 = parseInt(this.player1Score) || 0
        const score2 = parseInt(this.player2Score) || 0
        
        if (score1 === score2) {
          uni.showToast({
            title: '比分不能相等',
            icon: 'none'
          })
          return
        }

        // 这里需要你真实的 API 调用
        // await updateMatchScore({
        //   tournamentId: this.tournamentId,
        //   matchId: this.currentMatch.id,
        //   player1Score: score1,
        //   player2Score: score2
        // })

        uni.showToast({
          title: '比分更新成功',
          icon: 'success'
        })
        
        this.closeScoreDialog()
        
        // 触发更新事件
        this.$emit('score-updated')
      } catch (error) {
        console.error('更新比分失败:', error)
        uni.showToast({
          title: '比分更新失败',
          icon: 'none'
        })
      }
    }
  }
}
</script>

<style scoped>
.tournament-bracket {
  padding: 40rpx;
  overflow-x: auto;
  width: 100%;
  background-color: #f5f5f5;
}

.bracket-container {
  display: flex;
  gap: 120rpx;
  min-width: fit-content;
  justify-content: center;
  padding: 80rpx 40rpx;
  position: relative;
}

.round {
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 400rpx;
}

.round-title {
  text-align: center;
  font-weight: bold;
  color: #666;
  padding: 16rpx 0;
  margin-bottom: 40rpx;
}

.matches {
  display: flex;
  flex-direction: column;
  position: relative;
}

.match-container {
  position: relative;
  margin-bottom: 120rpx;
}

.match-container:last-child {
  margin-bottom: 0;
}

.match {
  position: relative;
  height: 160rpx;
}

.match-wrapper {
  background: #fff;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  overflow: visible;
  width: 400rpx;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 2;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.match-wrapper:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
}

.player {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  border-bottom: 2rpx solid #f5f5f5;
  height: 80rpx;
}

.player:last-child {
  border-bottom: none;
}

.player.winner {
  background-color: #e8f5e9;
  font-weight: bold;
}

.player-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-right: 16rpx;
  font-size: 28rpx;
}

.score {
  font-weight: bold;
  min-width: 48rpx;
  text-align: right;
  font-size: 28rpx;
}

/* 弹窗样式 */
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.popup-content {
  background: white;
  border-radius: 24rpx;
  width: 600rpx;
  max-width: 90vw;
  padding: 40rpx;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
  font-size: 36rpx;
  font-weight: 500;
}

.close-btn {
  font-size: 32rpx;
  color: #999;
  padding: 10rpx 20rpx;
  line-height: 1;
  cursor: pointer;
}

.dialog-body {
  padding: 0 0 48rpx;
}

.score-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.score-row:last-child {
  margin-bottom: 0;
}

.score-input-wrapper {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.score-input {
  width: 200rpx;
  height: 72rpx;
  background: #f7f8fa;
  border: 2rpx solid #ebedf0;
  border-radius: 16rpx;
  text-align: center;
  font-size: 32rpx;
  color: #323233;
  padding: 0 20rpx;
}

.score-buttons {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.score-btn {
  width: 60rpx;
  height: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  color: white;
  border-radius: 4rpx;
  cursor: pointer;
}

.score-btn.up {
  background: #1989fa;
}

.score-btn.down {
  background: #ff976a;
}

.dialog-footer {
  display: flex;
  gap: 20rpx;
}

.cancel-btn, .confirm-btn {
  flex: 1;
  height: 88rpx;
  font-size: 28rpx;
  border-radius: 16rpx;
  border: none;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #1989fa;
  color: white;
}

/* 移除所有 SVG 和连接线相关样式 */
/* 移除所有复杂的轮次间距调整 */
</style>