<template>
  <view class="tournament-schedule">
    <!-- 使用自定义 tabs -->
    <view class="custom-tabs">
      <view class="tabs-header">
        <view 
          v-for="tab in tabs" 
          :key="tab.name"
          class="tab-item"
          :class="{ 'active': activeTab === tab.name }"
          @tap="switchTab(tab.name)"
        >
          <text>{{ tab.title }}</text>
          <view class="tab-indicator" v-if="activeTab === tab.name"></view>
        </view>
      </view>
      
      <view class="tabs-content">
        <!-- 小组赛 Tab -->
        <view v-show="activeTab === 'group' && groupStage" class="tab-pane">
          <!-- 小组赛内部 tabs -->
          <view class="group-tabs">
            <view class="group-tabs-header">
              <view 
                v-for="(group, index) in groupMatches" 
                :key="group.name"
                class="group-tab-item"
                :class="{ 'active': activeGroup === index }"
                @tap="switchGroup(index)"
              >
                <text>{{ group.name }}</text>
                <view class="group-tab-indicator" v-if="activeGroup === index"></view>
              </view>
            </view>
            
            <view class="group-tabs-content">
              <view 
                v-for="(group, index) in groupMatches" 
                :key="group.name"
                v-show="activeGroup === index"
                class="group-tab-pane"
              >
                <tournament-group 
                  :matches="group.matches" 
                  :tournament-id="tournamentId" 
                  @score-updated="handleScoreUpdated" 
                />
              </view>
            </view>
          </view>
        </view>
        
        <!-- 淘汰赛 Tab -->
        <view v-show="activeTab === 'knockout' && knockoutStage" class="tab-pane">
          <view class="knockout-stage">
            <tournament-bracket 
              :matches="knockoutMatches" 
              :tournament-id="tournamentId" 
              @score-updated="handleScoreUpdated" 
            />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
// 使用 Vue 2 Options API
export default {
  name: 'TournamentSchedule',
  props: {
    tournamentId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      activeTab: 'group',
      activeGroup: 0,
      stagesData: []
    }
  },
  computed: {
    // 计算可用的 tabs
    tabs() {
      const availableTabs = []
      
      if (this.groupStage) {
        availableTabs.push({ name: 'group', title: '小组赛' })
      }
      
      if (this.knockoutStage) {
        availableTabs.push({ name: 'knockout', title: '淘汰赛' })
      }
      
      return availableTabs
    },
    
    // 获取小组赛阶段
    groupStage() {
      return this.stagesData.find(stage => stage.type === 'GROUP')
    },
    
    // 获取淘汰赛阶段
    knockoutStage() {
      return this.stagesData.find(stage => stage.type === 'KNOCKOUT')
    },
    
    // 淘汰赛比赛数据
    knockoutMatches() {
      return this.knockoutStage?.matches || []
    },
    
    // 按小组分组比赛
    groupMatches() {
      if (!this.groupStage?.matches) return []
      
      const groups = {}
      this.groupStage.matches.forEach(match => {
        const groupName = match.groupName || '默认小组'
        if (!groups[groupName]) {
          groups[groupName] = {
            name: groupName,
            matches: []
          }
        }
        groups[groupName].matches.push(match)
      })
      
      return Object.values(groups)
    }
  },
  methods: {
    // 切换主 tab
    switchTab(tabName) {
      this.activeTab = tabName
      if (tabName === 'group' && this.groupMatches.length > 0) {
        this.activeGroup = 0
      }
    },
    
    // 切换小组 tab
    switchGroup(index) {
      this.activeGroup = index
    },
    
    // 加载赛事数据
    async loadTournamentData() {
      try {
        // 这里需要你真实的 API 调用
        // const response = await getTournamentStages(this.tournamentId)
        // this.stagesData = response.data || []
        
        // 示例数据 - 开发时使用
        this.stagesData = [
          {
            type: 'GROUP',
            status: 'ONGOING',
            matches: [
              { id: 1, player1Name: '选手A', player2Name: '选手B', status: 'FINISHED', player1Score: 11, player2Score: 8, winner: 'PLAYER1' },
              { id: 2, player1Name: '选手C', player2Name: '选手D', status: 'ONGOING', player1Score: 5, player2Score: 7 }
            ]
          }
        ]
        
        // 自动切换到进行中的阶段
        const ongoingStage = this.stagesData.find(stage => stage.status === 'ONGOING')
        if (ongoingStage) {
          this.activeTab = ongoingStage.type.toLowerCase()
        }
        
        // 如果没有小组赛，自动切换到淘汰赛
        if (!this.groupStage && this.knockoutStage) {
          this.activeTab = 'knockout'
        }
      } catch (error) {
        console.error('加载赛事数据失败:', error)
        uni.showToast({
          title: '加载数据失败',
          icon: 'none'
        })
      }
    },
    
    // 处理比分更新
    async handleScoreUpdated() {
      await this.loadTournamentData()
    }
  },
  mounted() {
    this.loadTournamentData()
  }
}
</script>

<style scoped>
.tournament-schedule {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.custom-tabs {
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  margin: 32rpx;
}

.tabs-header {
  display: flex;
  background-color: #fff;
  border-bottom: 2rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  padding: 32rpx 0;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-item.active {
  color: #1989fa;
  font-weight: 500;
}

.tab-item:active {
  background-color: #f5f5f5;
}

.tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80rpx;
  height: 6rpx;
  background-color: #1989fa;
  border-radius: 3rpx;
}

.tabs-content {
  padding: 32rpx;
}

.tab-pane {
  min-height: 400rpx;
}

/* 小组赛内部 tabs */
.group-tabs {
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.group-tabs-header {
  display: flex;
  overflow-x: auto;
  background-color: #f9f9f9;
  border-bottom: 2rpx solid #f0f0f0;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.group-tab-item {
  padding: 24rpx 32rpx;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.group-tab-item.active {
  color: #1989fa;
  font-weight: 500;
}

.group-tab-item:active {
  background-color: #f0f0f0;
}

.group-tab-indicator {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background-color: #1989fa;
  border-radius: 3rpx;
}

.group-tabs-content {
  padding: 32rpx 0;
}

.group-tab-pane {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.knockout-stage {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 32rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .tournament-schedule {
    margin: 16rpx;
  }
  
  .custom-tabs {
    margin: 16rpx;
  }
  
  .tabs-content {
    padding: 24rpx;
  }
  
  .group-tab-item {
    padding: 20rpx 24rpx;
    font-size: 28rpx;
  }
}
</style>