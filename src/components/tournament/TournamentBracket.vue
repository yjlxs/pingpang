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

                <!-- 连接点 -->
                <template v-if="roundIndex >= 0">
                  <view class="connector-point right" v-if="roundIndex < rounds.length - 1" :data-match-id="match.id"></view>
                  <view class="connector-point left" v-if="roundIndex > 0" :data-match-id="match.id"></view>
                </template>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- SVG 容器用于绘制连接线 -->
    <svg class="connections-svg" ref="svgContainer">
      <path
        v-for="(path, index) in connectionPaths"
        :key="index"
        :d="path"
        class="connector-path"
      />
    </svg>

    <!-- 比分设置弹窗 -->
    <van-popup 
      v-model:show="showScoreDialog" 
      round 
      position="center"
      close-on-click-overlay
      teleport="body"
      :style="{ width: '90%', maxWidth: '320px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }"
      :overlay-style="{ background: 'rgba(0, 0, 0, 0.7)' }"
    >
      <view class="score-dialog">
        <view class="dialog-header">
          <text>设置比分</text>
          <van-icon name="cross" @click="showScoreDialog = false" />
        </view>
        <view class="dialog-content">
          <view class="score-row">
            <text class="player-name">{{ currentMatch?.player1Name }}</text>
            <van-field
              v-model="player1Score"
              type="number"
              input-align="center"
              :placeholder="'请输入比分'"
              class="score-input"
            >
              <template #button>
                <view class="score-buttons">
                  <van-icon name="arrow-up" @click="adjustScore(1, 1)" />
                  <van-icon name="arrow-down" @click="adjustScore(1, -1)" />
                </view>
              </template>
            </van-field>
          </view>
          <view class="score-row">
            <text class="player-name">{{ currentMatch?.player2Name }}</text>
            <van-field
              v-model="player2Score"
              type="number"
              input-align="center"
              :placeholder="'请输入比分'"
              class="score-input"
            >
              <template #button>
                <view class="score-buttons">
                  <van-icon name="arrow-up" @click="adjustScore(2, 1)" />
                  <van-icon name="arrow-down" @click="adjustScore(2, -1)" />
                </view>
              </template>
            </van-field>
          </view>
        </view>
        <view class="dialog-footer">
          <van-button plain block @click="showScoreDialog = false" style="margin-bottom: 12px">取消</van-button>
          <van-button type="primary" block @click="handleScoreSubmit">确认</van-button>
        </view>
      </view>
    </van-popup>
  </view>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onUnmounted } from 'vue'
import uniPopup from '@dcloudio/uni-popup'
import { updateMatchScore } from '@/api/match'

const props = defineProps({
  matches: {
    type: Array,
    default: () => []
  },
  tournamentId: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['score-updated'])

const scorePopup = ref(null)
const currentMatch = ref(null)
const player1Score = ref('0')
const player2Score = ref('0')

const handleMatchClick = (match) => {
  if (match.status === 'FINISHED' || !match.player1Name || !match.player2Name) return
  currentMatch.value = match
  player1Score.value = String(match.player1Score || 0)
  player2Score.value = String(match.player2Score || 0)
  scorePopup.value.open()
}

const closeScoreDialog = () => {
  scorePopup.value.close()
}

const adjustScore = (player, delta) => {
  const scoreRef = player === 1 ? player1Score : player2Score
  const currentScore = parseInt(scoreRef.value) || 0
  scoreRef.value = String(Math.max(0, currentScore + delta))
}

const handleScoreSubmit = async () => {
  try {
    const score1 = parseInt(player1Score.value) || 0
    const score2 = parseInt(player2Score.value) || 0
    
    if (score1 === score2) {
      uni.showToast({
        title: '比分不能相等',
        icon: 'none'
      })
      return
    }

    await updateMatchScore({
      tournamentId: props.tournamentId,
      matchId: currentMatch.value.id,
      player1Score: score1,
      player2Score: score2
    })

    uni.showToast({
      title: '比分更新成功',
      icon: 'success'
    })
    
    closeScoreDialog()
    
    // 触发更新事件
    emit('score-updated')
  } catch (error) {
    console.error('更新比分失败:', error)
    uni.showToast({
      title: '比分更新失败',
      icon: 'error'
    })
  }
}

// 按轮次分组比赛
const rounds = computed(() => {
  if (!props.matches) return []
  
  const roundsMap = {}
  props.matches.forEach(match => {
    const round = match.round || 1
    if (!roundsMap[round]) {
      roundsMap[round] = []
    }
    roundsMap[round].push(match)
  })
  return Object.values(roundsMap)
})

// 获取轮次标题
const getRoundTitle = (index) => {
  const totalRounds = rounds.value.length
  if (index === totalRounds - 1) {
    return '决赛'
  } else if (index === totalRounds - 2) {
    return '半决赛'
  } else if (index === totalRounds - 3) {
    return '四分之一决赛'
  } else {
    return `第${index + 1}轮`
  }
}

// SVG 容器引用
const svgContainer = ref(null)

// 连接线路径数组
const connectionPaths = ref([])

// 更新连接线
const updateConnections = async () => {
  await nextTick()
  connectionPaths.value = []
  
  if (!svgContainer.value) return
  
  rounds.value.forEach((round, roundIndex) => {
    if (roundIndex < rounds.value.length - 1) {
      const currentRoundMatches = document.querySelectorAll(`.match-wrapper[id="${roundIndex}"]`)
      const nextRoundMatches = document.querySelectorAll(`.match-wrapper[id="${roundIndex + 1}"]`)
      
      currentRoundMatches.forEach((currentMatch, matchIndex) => {
        const nextMatchIndex = Math.floor(matchIndex / 2)
        if (nextMatchIndex < nextRoundMatches.length) {
          const startPoint = currentMatch.querySelector('.connector-point.right')
          const endPoint = nextRoundMatches[nextMatchIndex].querySelector('.connector-point.left')
          
          if (startPoint && endPoint) {
            const startRect = startPoint.getBoundingClientRect()
            const endRect = endPoint.getBoundingClientRect()
            const svgRect = svgContainer.value.getBoundingClientRect()
            
            const start = {
              x: startRect.left - svgRect.left + startRect.width,
              y: startRect.top - svgRect.top + startRect.height / 2
            }
            
            const end = {
              x: endRect.left - svgRect.left,
              y: endRect.top - svgRect.top + endRect.height / 2
            }
            
            const controlPoint = {
              x: start.x + (end.x - start.x) / 2,
              y: start.y
            }
            
            const path = `M ${start.x} ${start.y} C ${controlPoint.x} ${start.y}, ${controlPoint.x} ${end.y}, ${end.x} ${end.y}`
            connectionPaths.value.push(path)
          }
        }
      })
    }
  })
}

// 监听窗口大小变化
const handleResize = () => {
  updateConnections()
}

// 组件挂载后更新连接线
onMounted(() => {
  updateConnections()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时移除监听器
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 监听比赛数据变化
watch(() => props.matches, () => {
  nextTick(() => {
    updateConnections()
  })
}, { deep: true })
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

/* 第一轮特殊处理 */
.round:nth-child(1) .match-container {
  margin-bottom: 120rpx;
}

/* 第二轮特殊处理 */
.round:nth-child(2) .match-container {
  margin-bottom: 240rpx;
}

.round:nth-child(2) .matches {
  padding-top: 180rpx;
}

/* 第三轮特殊处理 */
.round:nth-child(3) .match-container {
  margin-bottom: 480rpx;
}

.round:nth-child(3) .matches {
  padding-top: 360rpx;
}

/* 第四轮特殊处理 */
.round:nth-child(4) .matches {
  padding-top: 600rpx;
}

/* 最后一个比赛不需要底部间距 */
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

.match-wrapper:active {
  transform: translateY(0);
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

/* 连接点样式 */
.connector-point {
  position: absolute;
  width: 12rpx;
  height: 12rpx;
  background-color: #1e88e5;
  border-radius: 50%;
  z-index: 2;
}

.connector-point.right {
  right: -6rpx;
  top: 50%;
  transform: translate(0, -50%);
}

.connector-point.left {
  left: -6rpx;
  top: 50%;
  transform: translate(0, -50%);
}

/* SVG 容器样式 */
.connections-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connector-path {
  fill: none;
  stroke: #1e88e5;
  stroke-width: 4rpx;
}

/* 确保决赛垂直居中 */
.round:last-child {
  justify-content: center;
  align-self: center;
}

/* 弹窗样式 */
.score-dialog {
  padding: 40rpx;
  background: white;
  border-radius: 24rpx;
  width: 600rpx;
  max-width: 90vw;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
  font-size: 36rpx;
  font-weight: 500;
}

.close-icon {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  color: #999;
}

.dialog-content {
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

.player-name {
  flex: 1;
  margin-right: 32rpx;
  font-size: 32rpx;
}

.dialog-footer {
  padding-top: 0;
}

.score-input {
  width: 240rpx;
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
  padding-left: 16rpx;
}

.score-btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 8rpx;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  color: #666;
}

.score-btn.up {
  background: #1989fa;
  color: white;
}

.score-btn.down {
  background: #ff976a;
  color: white;
}

.cancel-btn, .confirm-btn {
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

/* 媒体查询，适配移动设备 */
@media screen and (max-width: 768px) {
  .bracket-container {
    gap: 60rpx;
  }
  
  .match-wrapper {
    width: 320rpx;
  }
}
</style>