<template>
  <view class="tournament-group">
    <!-- 小组赛积分表 -->
    <view class="group-container">
      <view class="group-header">
        <view class="header-cell">排名</view>
        <view class="header-cell player">选手</view>
        <view class="header-cell">胜</view>
        <view class="header-cell">负</view>
        <view class="header-cell">积分</view>
        <view class="header-cell">得分</view>
        <view class="header-cell">失分</view>
        <view class="header-cell">净胜分</view>
      </view>
      <view v-for="(player, index) in groupStandings" :key="player.id" class="group-row">
        <view class="cell rank">{{ index + 1 }}</view>
        <view class="cell player">{{ player.name }}</view>
        <view class="cell">{{ player.wins || 0 }}</view>
        <view class="cell">{{ player.losses || 0 }}</view>
        <view class="cell points">{{ player.points || 0 }}</view>
        <view class="cell">{{ player.totalScore || 0 }}</view>
        <view class="cell">{{ player.totalLost || 0 }}</view>
        <view class="cell" :class="{'positive': player.scoreDiff > 0, 'negative': player.scoreDiff < 0}">
          {{ player.scoreDiff > 0 ? '+' : '' }}{{ player.scoreDiff || 0 }}
        </view>
      </view>
    </view>

    <!-- 小组赛对阵表 -->
    <view class="matches-container">
      <view class="matches-header">对阵表</view>
      <view class="matches-grid">
        <view v-for="match in matches" :key="match.id" class="match-item" @tap="handleMatchClick(match)">
          <view class="match-info">
            <view class="match-players">
              <view class="player" :class="{ 'winner': match.winner === 'PLAYER1' }">
                {{ match.player1Name }}
              </view>
              <text class="vs">vs</text>
              <view class="player" :class="{ 'winner': match.winner === 'PLAYER2' }">
                {{ match.player2Name }}
              </view>
            </view>
            <view class="match-score" v-if="match.status === 'FINISHED'">
              {{ match.player1Score }} : {{ match.player2Score }}
            </view>
            <text class="match-status" v-else>
              {{ match.status === 'PENDING' ? '未开始' : '进行中' }}
            </text>
          </view>
        </view>
      </view>
    </view>

    <!-- 比分设置弹窗 - 使用原生弹窗 -->
    <view v-if="showScoreDialog" class="popup-mask" @tap="closeScoreDialog">
      <view class="popup-content" @tap.stop>
        <view class="dialog-header">
          <text>设置比分</text>
          <text class="close-btn" @tap="closeScoreDialog">×</text>
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
                <text class="score-btn up" @tap="adjustScore(1, 1)">▲</text>
                <text class="score-btn down" @tap="adjustScore(1, -1)">▼</text>
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
                <text class="score-btn up" @tap="adjustScore(2, 1)">▲</text>
                <text class="score-btn down" @tap="adjustScore(2, -1)">▼</text>
              </view>
            </view>
          </view>
        </view>
        <view class="dialog-footer">
          <button class="cancel-btn" @tap="closeScoreDialog">取消</button>
          <button class="confirm-btn" @tap="handleScoreSubmit">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 使用 Vue 2 Options API
export default {
  name: 'TournamentGroup',
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
    // 计算小组积分榜
    groupStandings() {
      const players = new Map()
      
      // 初始化所有选手数据
      this.matches.forEach(match => {
        if (!players.has(match.player1Id)) {
          players.set(match.player1Id, {
            id: match.player1Id,
            name: match.player1Name,
            wins: 0,
            losses: 0,
            points: 0,
            totalScore: 0,
            totalLost: 0,
            scoreDiff: 0
          })
        }
        if (!players.has(match.player2Id)) {
          players.set(match.player2Id, {
            id: match.player2Id,
            name: match.player2Name,
            wins: 0,
            losses: 0,
            points: 0,
            totalScore: 0,
            totalLost: 0,
            scoreDiff: 0
          })
        }
      })

      // 统计比赛结果
      this.matches.forEach(match => {
        if (match.status === 'FINISHED') {
          const player1 = players.get(match.player1Id)
          const player2 = players.get(match.player2Id)
          
          // 累加得分
          player1.totalScore += parseInt(match.player1Score) || 0
          player2.totalScore += parseInt(match.player2Score) || 0
          
          // 累加失分
          player1.totalLost += parseInt(match.player2Score) || 0
          player2.totalLost += parseInt(match.player1Score) || 0
          
          // 计算净胜分
          player1.scoreDiff = player1.totalScore - player1.totalLost
          player2.scoreDiff = player2.totalScore - player2.totalLost
          
          if (match.winner === 'PLAYER1') {
            player1.wins++
            player1.points += 2
            player2.losses++
          } else if (match.winner === 'PLAYER2') {
            player2.wins++
            player2.points += 2
            player1.losses++
          }
        }
      })

      // 转换为数组并排序
      return Array.from(players.values()).sort((a, b) => {
        if (b.points !== a.points) {
          return b.points - a.points
        }
        if (b.wins !== a.wins) {
          return b.wins - a.wins
        }
        if (b.scoreDiff !== a.scoreDiff) {
          return b.scoreDiff - a.scoreDiff
        }
        return b.totalScore - a.totalScore
      })
    }
  },
  methods: {
    handleMatchClick(match) {
      if (match.status === 'FINISHED') return
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
.tournament-group {
  padding: 32rpx;
}

.group-container {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  margin-bottom: 48rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.group-header {
  display: flex;
  background-color: #f5f5f5;
  font-weight: bold;
  border-bottom: 2rpx solid #e5e5e5;
}

.header-cell {
  padding: 24rpx 16rpx;
  flex: 1;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

.header-cell.player {
  flex: 2;
  text-align: left;
}

.group-row {
  display: flex;
  border-bottom: 2rpx solid #f5f5f5;
}

.group-row:last-child {
  border-bottom: none;
}

.cell {
  padding: 24rpx 16rpx;
  flex: 1;
  text-align: center;
  font-size: 28rpx;
}

.cell.player {
  flex: 2;
  text-align: left;
}

.cell.rank {
  color: #666;
  font-weight: bold;
}

.points {
  font-weight: bold;
  color: #1989fa;
}

.positive {
  color: #07c160;
  font-weight: bold;
}

.negative {
  color: #ee0a24;
  font-weight: bold;
}

.matches-container {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.matches-header {
  padding: 24rpx 32rpx;
  font-weight: bold;
  background-color: #f5f5f5;
  border-bottom: 2rpx solid #e5e5e5;
  font-size: 32rpx;
  color: #333;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(560rpx, 1fr));
  gap: 32rpx;
  padding: 32rpx;
}

.match-item {
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  padding: 24rpx;
  cursor: pointer;
  transition: all 0.3s;
  background: #fff;
}

.match-item:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.match-item:active {
  transform: translateY(0);
}

.match-info {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.match-players {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.player {
  flex: 1;
  padding: 8rpx 16rpx;
  font-size: 28rpx;
}

.player.winner {
  font-weight: bold;
  color: #4caf50;
  background-color: #e8f5e9;
  border-radius: 8rpx;
}

.vs {
  color: #999;
  font-size: 24rpx;
}

.match-score {
  text-align: center;
  font-weight: bold;
  color: #333;
  font-size: 32rpx;
}

.match-status {
  text-align: center;
  color: #999;
  font-size: 24rpx;
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
</style>