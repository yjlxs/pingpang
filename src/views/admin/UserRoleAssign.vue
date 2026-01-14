<template>
  <view class="user-role-assign">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <text class="navbar-icon">‹</text>
        <text class="navbar-text">返回</text>
      </view>
      <text class="navbar-title">用户角色分配</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-box">
        <input
          v-model="searchValue"
          class="search-input"
          placeholder="请输入用户昵称搜索"
          placeholder-class="search-placeholder"
          confirm-type="search"
          @confirm="onSearch"
        />
        <view v-if="searchValue" class="search-clear" @tap="clearSearch">
          <text>×</text>
        </view>
        <view class="search-btn" @tap="onSearch">
          <text>搜索</text>
        </view>
      </view>
    </view>

    <!-- 用户列表 -->
    <scroll-view class="user-list" scroll-y v-if="users.length > 0">
      <view class="user-item" v-for="user in users" :key="user.id">
        <view class="user-main">
          <view class="user-header">
            <text class="nickname">{{ user.nickname }}</text>
            <text class="phone">{{ user.phone }}</text>
          </view>
          
          <view class="user-details">
            <view class="current-roles">
              <text class="section-label">当前角色：</text>
              <view class="role-tags">
                <view 
                  v-for="role in user.roles" 
                  :key="role.id" 
                  :class="['role-tag', getRoleTagClass(role.code)]"
                >
                  <text>{{ role.name }}</text>
                </view>
              </view>
            </view>
            
            <view class="points-info">
              <text class="points-label">积分：</text>
              <text class="points-value">{{ user.points || 0 }}</text>
            </view>
          </view>
        </view>
        
        <view class="user-actions">
          <button class="action-btn role-btn" @tap="showRoleSelect(user)" size="mini">
            <text>角色设置</text>
          </button>
          <button class="action-btn points-btn" @tap="showPointsSelect(user)" size="mini">
            <text>积分设置</text>
          </button>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view v-if="users.length === 0 && hasSearched" class="empty-state">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">未找到相关用户</text>
      <button class="empty-btn" @tap="clearSearch">
        <text>重新搜索</text>
      </button>
    </view>

    <!-- 初始提示 -->
    <view v-if="!hasSearched" class="initial-hint">
      <text class="hint-icon">👤</text>
      <text class="hint-text">输入昵称搜索用户</text>
    </view>

    <!-- 角色选择弹窗 -->
    <view class="role-select-dialog" v-if="showRoleDialog">
      <view class="dialog-mask" @tap="closeRoleDialog"></view>
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">角色设置</text>
          <view class="dialog-close" @tap="closeRoleDialog">
            <text>×</text>
          </view>
        </view>
        
        <scroll-view class="dialog-list" scroll-y>
          <view class="role-option" v-for="role in allRoles" :key="role.id">
            <view 
              class="role-checkbox" 
              :class="{ checked: selectedRoles.includes(Number(role.id)) }"
              @tap="toggleRole(role.id)"
            >
              <text v-if="selectedRoles.includes(Number(role.id))" class="check-icon">✓</text>
            </view>
            
            <view class="role-info" @tap="toggleRole(role.id)">
              <text class="role-name">{{ role.name }}</text>
              <text class="role-code">{{ role.code }}</text>
              <text class="role-desc">{{ role.description }}</text>
            </view>
          </view>
          
          <view v-if="allRoles.length === 0" class="empty-roles">
            <text class="empty-icon">👑</text>
            <text class="empty-text">暂无角色</text>
          </view>
        </scroll-view>
        
        <view class="dialog-footer">
          <button class="dialog-btn save-btn" @tap="saveUserRoles">
            <text>保存角色</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 积分设置弹窗 -->
    <view class="points-select-dialog" v-if="showPointsDialog">
      <view class="dialog-mask" @tap="closePointsDialog"></view>
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">积分设置</text>
          <view class="dialog-close" @tap="closePointsDialog">
            <text>×</text>
          </view>
        </view>
        
        <view class="dialog-body">
          <view class="current-user">
            <text class="user-label">用户：</text>
            <text class="user-name">{{ currentUser && currentUser.nickname }}</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">当前积分：</text>
            <text class="current-points">{{ currentUser && currentUser.points || 0 }}</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">积分调整</text>
            <view class="points-adjust">
              <button class="adjust-btn minus" @tap="adjustPoints(-1)">-1</button>
              <input
                v-model="pointsInput"
                class="points-input"
                type="number"
                placeholder="输入调整值"
                placeholder-class="placeholder"
              />
              <button class="adjust-btn plus" @tap="adjustPoints(1)">+1</button>
            </view>
            <text class="form-hint">正数为增加，负数为减少</text>
          </view>
          
          <view class="form-item">
            <text class="form-label">变更原因</text>
            <textarea
              v-model="pointsReason"
              class="reason-textarea"
              placeholder="请输入积分变更原因"
              placeholder-class="placeholder"
              maxlength="200"
              auto-height
            />
          </view>
          
          <view class="result-preview" v-if="pointsInput">
            <text class="preview-label">调整后积分：</text>
            <text class="preview-value">{{ calculateNewPoints() }}</text>
          </view>
        </view>
        
        <view class="dialog-footer">
          <button 
            class="dialog-btn save-btn" 
            @tap="saveUserPoints"
            :disabled="!pointsInput || !pointsReason"
            :class="{ disabled: !pointsInput || !pointsReason }"
          >
            <text>保存积分</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 加载中 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">搜索中...</text>
      </view>
    </view>
  </view>
</template>

<script>
// 使用 Vue 2 Options API
export default {
  name: 'UserRoleAssign',
  data() {
    return {
      users: [],
      allRoles: [],
      searchValue: '',
      hasSearched: false,
      showRoleDialog: false,
      showPointsDialog: false,
      selectedRoles: [],
      currentUser: null,
      pointsInput: '',
      pointsReason: '',
      loading: false
    }
  },
  mounted() {
    this.loadRoles()
  },
  methods: {
    // 加载所有角色
    async loadRoles() {
      try {
        // 这里需要你真实的 API 调用
        // const res = await getRoles()
        // this.allRoles = res.data || []
        
        // 示例数据 - 开发时使用
        this.allRoles = [
          { id: 1, name: '管理员', code: 'ROLE_ADMIN', description: '系统管理员' },
          { id: 2, name: '裁判', code: 'ROLE_REFEREE', description: '比赛裁判' },
          { id: 3, name: '选手', code: 'ROLE_PLAYER', description: '参赛选手' }
        ]
      } catch (error) {
        uni.showToast({
          title: '获取角色列表失败',
          icon: 'none'
        })
      }
    },
    
    // 搜索用户
    async onSearch() {
      if (!this.searchValue.trim()) {
        uni.showToast({
          title: '请输入搜索内容',
          icon: 'none'
        })
        return
      }
      
      try {
        this.loading = true
        // 这里需要你真实的 API 调用
        // const res = await searchUsers(this.searchValue)
        // this.users = res.data || []
        
        // 示例数据
        this.users = [
          {
            id: 1,
            nickname: '张三',
            phone: '13800138000',
            points: 150,
            roles: [
              { id: 2, name: '裁判', code: 'ROLE_REFEREE' },
              { id: 3, name: '选手', code: 'ROLE_PLAYER' }
            ]
          },
          {
            id: 2,
            nickname: '李四',
            phone: '13900139000',
            points: 230,
            roles: [
              { id: 3, name: '选手', code: 'ROLE_PLAYER' }
            ]
          }
        ]
        
        this.hasSearched = true
        
        // 获取每个用户的角色（示例中已经包含）
        // 如果实际需要调用API，可以这样：
        // for (const user of this.users) {
        //   try {
        //     const rolesRes = await getUserRoles(user.id)
        //     user.roles = rolesRes.data || []
        //   } catch (error) {
        //     user.roles = []
        //   }
        // }
        
      } catch (error) {
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 清空搜索
    clearSearch() {
      this.searchValue = ''
      this.users = []
      this.hasSearched = false
    },
    
    // 显示角色选择
    async showRoleSelect(user) {
      this.currentUser = user
      this.selectedRoles = user.roles.map(role => Number(role.id))
      this.showRoleDialog = true
    },
    
    // 显示积分设置弹窗
    showPointsSelect(user) {
      this.currentUser = user
      this.pointsInput = ''
      this.pointsReason = ''
      this.showPointsDialog = true
    },
    
    // 调整积分输入
    adjustPoints(value) {
      let current = parseInt(this.pointsInput) || 0
      current += value
      this.pointsInput = current.toString()
    },
    
    // 计算新积分
    calculateNewPoints() {
      const current = parseInt(this.currentUser?.points) || 0
      const adjust = parseInt(this.pointsInput) || 0
      return current + adjust
    },
    
    // 保存用户积分
    async saveUserPoints() {
      if (!this.currentUser || !this.pointsInput || !this.pointsReason) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        })
        return
      }
      
      try {
        uni.showLoading({
          title: '保存中...'
        })
        
        // 这里需要你真实的 API 调用
        // await updateUserPoints({
        //   userId: this.currentUser.id,
        //   points: Number(this.pointsInput),
        //   reason: this.pointsReason
        // })
        
        uni.hideLoading()
        uni.showToast({
          title: '积分设置成功',
          icon: 'success'
        })
        
        // 更新本地数据
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id)
        if (userIndex > -1) {
          this.users[userIndex].points = this.calculateNewPoints()
        }
        
        this.closePointsDialog()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.response?.data?.message || '积分设置失败',
          icon: 'none'
        })
      }
    },
    
    // 切换角色选择
    toggleRole(roleId) {
      const numericRoleId = Number(roleId)
      const index = this.selectedRoles.indexOf(numericRoleId)
      if (index > -1) {
        this.selectedRoles.splice(index, 1)
      } else {
        this.selectedRoles.push(numericRoleId)
      }
    },
    
    // 保存用户角色
    async saveUserRoles() {
      try {
        uni.showLoading({
          title: '保存中...'
        })
        
        const roleIds = this.selectedRoles.map(Number)
        // 这里需要你真实的 API 调用
        // await assignUserRoles(this.currentUser.id, roleIds)
        
        uni.hideLoading()
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        // 更新本地数据
        const updatedRoles = this.allRoles.filter(role => 
          this.selectedRoles.includes(Number(role.id))
        )
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id)
        if (userIndex > -1) {
          this.users[userIndex].roles = updatedRoles
        }
        
        this.closeRoleDialog()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: error.response?.data?.message || '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 关闭角色对话框
    closeRoleDialog() {
      this.showRoleDialog = false
      this.currentUser = null
      this.selectedRoles = []
    },
    
    // 关闭积分对话框
    closePointsDialog() {
      this.showPointsDialog = false
      this.currentUser = null
      this.pointsInput = ''
      this.pointsReason = ''
    },
    
    // 返回
    goBack() {
      uni.navigateBack()
    },
    
    // 获取角色标签样式
    getRoleTagClass(roleCode) {
      const classMap = {
        'ROLE_ADMIN': 'role-admin',
        'ROLE_USER': 'role-user',
        'ROLE_REFEREE': 'role-referee',
        'ROLE_TOURNAMENT_MANAGER': 'role-manager'
      }
      return classMap[roleCode] || 'role-default'
    }
  }
}
</script>

<style scoped>
.user-role-assign {
  min-height: 100vh;
  background-color: #f7f8fa;
}

/* 导航栏 */
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

/* 搜索容器 */
.search-container {
  padding: 32rpx;
  background: white;
  border-bottom: 2rpx solid #f5f5f5;
}

.search-box {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 48rpx;
  padding: 0 24rpx;
  height: 80rpx;
  border: 2rpx solid #e9ecef;
}

.search-input {
  flex: 1;
  height: 100%;
  font-size: 32rpx;
  color: #333;
  padding-right: 16rpx;
}

.search-placeholder {
  color: #999;
  font-size: 32rpx;
}

.search-clear {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #666;
  margin-right: 16rpx;
}

.search-btn {
  background: #1989fa;
  color: white;
  padding: 12rpx 32rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}

/* 用户列表 */
.user-list {
  height: calc(100vh - 200rpx);
  padding: 24rpx;
}

.user-item {
  background: white;
  border-radius: 20rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.user-main {
  margin-bottom: 24rpx;
}

.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.phone {
  font-size: 28rpx;
  color: #666;
}

.user-details {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
}

.section-label {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: block;
}

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.role-tag {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.role-admin {
  background: #ee0a24;
  color: white;
}

.role-user {
  background: #1989fa;
  color: white;
}

.role-referee {
  background: #07c160;
  color: white;
}

.role-manager {
  background: #ff976a;
  color: white;
}

.role-default {
  background: #c8c9cc;
  color: #333;
}

.points-info {
  display: flex;
  align-items: center;
}

.points-label {
  font-size: 28rpx;
  color: #666;
}

.points-value {
  font-size: 32rpx;
  color: #ff6b00;
  font-weight: bold;
  margin-left: 12rpx;
}

.user-actions {
  display: flex;
  gap: 16rpx;
  justify-content: flex-end;
}

.action-btn {
  min-width: 140rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  border: none;
  font-size: 26rpx;
  font-weight: 500;
}

.role-btn {
  background: #1989fa;
  color: white;
}

.points-btn {
  background: #ff976a;
  color: white;
}

/* 空状态 */
.empty-state,
.initial-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 32rpx;
}

.empty-icon,
.hint-icon {
  font-size: 96rpx;
  margin-bottom: 32rpx;
}

.empty-text,
.hint-text {
  font-size: 32rpx;
  color: #999;
  text-align: center;
  margin-bottom: 48rpx;
}

.empty-btn {
  background: #1989fa;
  color: white;
  padding: 20rpx 48rpx;
  border-radius: 40rpx;
  border: none;
  font-size: 28rpx;
  font-weight: 500;
}

/* 对话框通用样式 */
.role-select-dialog,
.points-select-dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
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
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 40rpx 40rpx 0 0;
  max-height: 70vh;
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

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx 32rpx;
  border-bottom: 2rpx solid #f5f5f5;
}

.dialog-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.dialog-close {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #666;
}

/* 角色选择对话框 */
.dialog-list {
  max-height: 400rpx;
  padding: 24rpx 32rpx;
}

.role-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  margin-bottom: 16rpx;
}

.role-checkbox {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  border: 4rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
}

.role-checkbox.checked {
  background: #07c160;
  border-color: #07c160;
}

.check-icon {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.role-info {
  flex: 1;
}

.role-name {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 4rpx;
}

.role-code {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.role-desc {
  display: block;
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
}

.empty-roles {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
}

/* 积分设置对话框 */
.dialog-body {
  padding: 32rpx;
}

.current-user {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.user-label {
  font-size: 28rpx;
  color: #666;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-left: 12rpx;
}

.form-item {
  margin-bottom: 40rpx;
}

.form-label {
  display: block;
  font-size: 32rpx;
  color: #333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.current-points {
  font-size: 48rpx;
  color: #ff6b00;
  font-weight: bold;
}

.points-adjust {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 12rpx;
}

.adjust-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: none;
  font-size: 40rpx;
  font-weight: bold;
  flex-shrink: 0;
}

.minus {
  background: #ff976a;
  color: white;
}

.plus {
  background: #07c160;
  color: white;
}

.points-input {
  flex: 1;
  height: 80rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 36rpx;
  color: #333;
  text-align: center;
}

.form-hint {
  display: block;
  font-size: 24rpx;
  color: #999;
}

.reason-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

.result-preview {
  background: #e8f5e9;
  border-radius: 16rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.preview-label {
  font-size: 28rpx;
  color: #07c160;
  font-weight: 500;
}

.preview-value {
  font-size: 48rpx;
  color: #07c160;
  font-weight: bold;
}

/* 对话框底部 */
.dialog-footer {
  padding: 32rpx;
  border-top: 2rpx solid #f5f5f5;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: #1989fa;
  border-radius: 44rpx;
  border: none;
  color: white;
  font-size: 32rpx;
  font-weight: 500;
}

.save-btn.disabled {
  background: #c8c9cc;
  opacity: 0.6;
}

/* 加载中 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
}

.loading-icon {
  font-size: 64rpx;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 响应式调整 */
@media (max-width: 375px) {
  .search-container {
    padding: 24rpx;
  }
  
  .user-item {
    padding: 24rpx;
  }
  
  .action-btn {
    min-width: 120rpx;
    height: 56rpx;
    line-height: 56rpx;
    font-size: 24rpx;
  }
}
</style>