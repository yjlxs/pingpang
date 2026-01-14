<template>
  <view class="role-list">
    <!-- 自定义导航栏 -->
    <view class="custom-navbar">
      <view class="navbar-left" @tap="goBack">
        <text class="navbar-icon">‹</text>
        <text class="navbar-text">返回</text>
      </view>
      <text class="navbar-title">角色管理</text>
      <view class="navbar-right"></view>
    </view>
    
    <!-- 角色列表 -->
    <scroll-view class="role-items" scroll-y>
      <view class="role-item" v-for="role in roles" :key="role.id">
        <view class="role-info">
          <text class="role-name">{{ role.name }}</text>
          <text class="role-desc">{{ role.description }}</text>
          <text class="role-code">{{ role.code }}</text>
        </view>
        
        <view class="action-buttons">
          <button class="action-btn edit-btn" @tap="editRole(role)" size="mini">
            <text>编辑</text>
          </button>
          <button class="action-btn perm-btn" @tap="managePermissions(role)" size="mini">
            <text>权限</text>
          </button>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view v-if="roles.length === 0" class="empty-state">
        <text class="empty-icon">👑</text>
        <text class="empty-text">暂无角色</text>
      </view>
    </scroll-view>

    <!-- 编辑角色弹窗 -->
    <view class="edit-dialog" v-if="showAddDialog">
      <view class="dialog-mask" @tap="closeEditDialog"></view>
      <view class="dialog-content">
        <view class="dialog-header">
          <text class="dialog-title">编辑角色</text>
          <view class="dialog-close" @tap="closeEditDialog">
            <text>×</text>
          </view>
        </view>
        
        <view class="dialog-body">
          <view class="form-item">
            <text class="form-label">角色名称</text>
            <input
              v-model="roleForm.name"
              class="form-input"
              placeholder="请输入角色名称"
              placeholder-class="placeholder"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">角色代码</text>
            <input
              v-model="roleForm.code"
              class="form-input"
              placeholder="请输入角色代码，如：ROLE_REFEREE"
              placeholder-class="placeholder"
            />
          </view>
          
          <view class="form-item">
            <text class="form-label">角色描述</text>
            <textarea
              v-model="roleForm.description"
              class="form-textarea"
              placeholder="请输入角色描述"
              placeholder-class="placeholder"
              maxlength="200"
              auto-height
            />
          </view>
        </view>
        
        <view class="dialog-footer">
          <button class="dialog-btn cancel-btn" @tap="closeEditDialog">
            <text>取消</text>
          </button>
          <button class="dialog-btn confirm-btn" @tap="handleSubmit">
            <text>保存</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 权限管理弹窗 -->
    <view class="permission-dialog" v-if="showPermissionDialog">
      <view class="dialog-mask" @tap="closePermissionDialog"></view>
      <view class="dialog-content permission-content">
        <view class="dialog-header">
          <view class="permission-header-left">
            <text class="navbar-icon" @tap="closePermissionDialog">‹</text>
            <text class="dialog-title">{{ currentRole && currentRole.name }} - 权限管理</text>
          </view>
        </view>
        
        <scroll-view class="permission-list" scroll-y>
          <view 
            class="permission-item" 
            v-for="permission in permissions" 
            :key="permission.id"
            @tap="togglePermission(permission.id)"
          >
            <view class="permission-info">
              <text class="permission-name">{{ permission.name }}</text>
              <text class="permission-desc">{{ permission.description }}</text>
            </view>
            
            <view class="permission-checkbox" :class="{ checked: selectedPermissions.includes(permission.id) }">
              <text v-if="selectedPermissions.includes(permission.id)" class="check-icon">✓</text>
            </view>
          </view>
          
          <view v-if="permissions.length === 0" class="empty-permissions">
            <text class="empty-icon">🔒</text>
            <text class="empty-text">暂无权限</text>
          </view>
        </scroll-view>
        
        <view class="permission-footer">
          <button class="save-permissions-btn" @tap="savePermissions">
            <text>保存权限</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 加载中 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">加载中...</text>
      </view>
    </view>
  </view>
</template>

<script>
// 使用 Vue 2 Options API
export default {
  name: 'RoleList',
  data() {
    return {
      roles: [],
      showAddDialog: false,
      showPermissionDialog: false,
      editingRole: null,
      currentRole: null,
      permissions: [],
      selectedPermissions: [],
      loading: false,
      roleForm: {
        name: '',
        code: '',
        description: ''
      }
    }
  },
  mounted() {
    this.loadRoles()
    this.loadPermissions()
  },
  methods: {
    // 获取角色列表
    async loadRoles() {
      try {
        this.loading = true
        // 这里需要你真实的 API 调用
        // const res = await getRoles()
        // this.roles = res.data || []
        
        // 示例数据 - 开发时使用
        this.roles = [
          { id: 1, name: '管理员', code: 'ROLE_ADMIN', description: '系统管理员' },
          { id: 2, name: '裁判', code: 'ROLE_REFEREE', description: '比赛裁判' },
          { id: 3, name: '选手', code: 'ROLE_PLAYER', description: '参赛选手' }
        ]
      } catch (error) {
        uni.showToast({
          title: '获取角色列表失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 获取权限列表
    async loadPermissions() {
      try {
        // 这里需要你真实的 API 调用
        // const res = await getPermissions()
        // this.permissions = res.data || []
        
        // 示例数据
        this.permissions = [
          { id: 1, name: '赛事管理', description: '创建、编辑和删除赛事' },
          { id: 2, name: '用户管理', description: '管理用户信息' },
          { id: 3, name: '角色管理', description: '分配和管理角色' }
        ]
      } catch (error) {
        uni.showToast({
          title: '获取权限列表失败',
          icon: 'none'
        })
      }
    },
    
    // 加载角色的权限
    async loadRolePermissions(roleId) {
      try {
        // const res = await getRolePermissions(roleId)
        // const permissions = Array.isArray(res.data) ? res.data : []
        // this.selectedPermissions = permissions.map(p => p.id)
        
        // 示例数据
        this.selectedPermissions = roleId === 1 ? [1, 2, 3] : roleId === 2 ? [1] : []
      } catch (error) {
        console.error('获取角色权限失败:', error)
        uni.showToast({
          title: '获取角色权限失败',
          icon: 'none'
        })
      }
    },
    
    // 处理表单提交
    async handleSubmit() {
      try {
        if (!this.roleForm.name.trim()) {
          uni.showToast({
            title: '请填写角色名称',
            icon: 'none'
          })
          return
        }
        
        if (!this.roleForm.code.trim()) {
          uni.showToast({
            title: '请填写角色代码',
            icon: 'none'
          })
          return
        }

        const formData = {
          name: this.roleForm.name,
          code: this.roleForm.code,
          description: this.roleForm.description || ''
        }

        // 这里需要你真实的 API 调用
        // await updateRole(this.editingRole.id, formData)

        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })

        this.loadRoles()
        this.closeEditDialog()
      } catch (error) {
        console.error('保存角色失败:', error)
        uni.showToast({
          title: error.response?.data?.message || '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 编辑角色
    editRole(role) {
      this.editingRole = role
      this.roleForm = {
        name: role.name,
        code: role.code,
        description: role.description || ''
      }
      this.showAddDialog = true
    },
    
    // 管理权限
    async managePermissions(role) {
      this.currentRole = role
      await this.loadPermissions()
      await this.loadRolePermissions(role.id)
      this.showPermissionDialog = true
    },
    
    // 保存权限
    async savePermissions() {
      try {
        const permissionIds = this.selectedPermissions.map(Number)
        // 这里需要你真实的 API 调用
        // await updateRolePermissions(this.currentRole.id, permissionIds)
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        this.closePermissionDialog()
      } catch (error) {
        console.error('保存权限失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 切换权限选择
    togglePermission(permissionId) {
      const index = this.selectedPermissions.indexOf(permissionId)
      if (index > -1) {
        this.selectedPermissions.splice(index, 1)
      } else {
        this.selectedPermissions.push(permissionId)
      }
    },
    
    // 关闭编辑对话框
    closeEditDialog() {
      this.showAddDialog = false
      this.editingRole = null
      this.roleForm = {
        name: '',
        code: '',
        description: ''
      }
    },
    
    // 关闭权限对话框
    closePermissionDialog() {
      this.showPermissionDialog = false
      this.currentRole = null
      this.selectedPermissions = []
    },
    
    // 返回
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.role-list {
  min-height: 100vh;
  background-color: #f7f8fa;
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

/* 角色列表 */
.role-items {
  height: calc(100vh - 88rpx);
  padding: 24rpx;
}

.role-item {
  background: #ffffff;
  border-radius: 16rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.role-info {
  flex: 1;
}

.role-name {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 8rpx;
}

.role-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  margin-bottom: 4rpx;
  line-height: 1.4;
}

.role-code {
  display: block;
  font-size: 24rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  align-self: flex-start;
}

.action-buttons {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  min-width: 120rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
  border: none;
  font-size: 26rpx;
  font-weight: 500;
}

.edit-btn {
  background: #1989fa;
  color: white;
}

.perm-btn {
  background: #07c160;
  color: white;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 96rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
}

/* 编辑对话框 */
.edit-dialog,
.permission-dialog {
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
  background: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
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

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
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

.dialog-body {
  padding: 32rpx;
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

.form-input {
  width: 100%;
  height: 88rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  color: #333;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #1989fa;
}

.form-textarea {
  width: 100%;
  min-height: 160rpx;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 32rpx;
  color: #333;
  line-height: 1.5;
  box-sizing: border-box;
}

.form-textarea:focus {
  border-color: #1989fa;
}

.placeholder {
  color: #999;
  font-size: 32rpx;
}

.dialog-footer {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  border-top: 2rpx solid #f5f5f5;
}

.dialog-btn {
  flex: 1;
  height: 88rpx;
  border-radius: 44rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 500;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #1989fa;
  color: white;
}

/* 权限对话框 */
.permission-content {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.permission-header-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.permission-list {
  flex: 1;
  padding: 24rpx;
}

.permission-item {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.permission-info {
  flex: 1;
}

.permission-name {
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.permission-desc {
  display: block;
  font-size: 26rpx;
  color: #666;
  line-height: 1.4;
}

.permission-checkbox {
  width: 48rpx;
  height: 48rpx;
  border-radius: 12rpx;
  border: 4rpx solid #ddd;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 24rpx;
}

.permission-checkbox.checked {
  background: #07c160;
  border-color: #07c160;
}

.check-icon {
  color: white;
  font-size: 32rpx;
  font-weight: bold;
}

.empty-permissions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.permission-footer {
  padding: 32rpx;
  border-top: 2rpx solid #f5f5f5;
}

.save-permissions-btn {
  width: 100%;
  height: 88rpx;
  background: #1989fa;
  border-radius: 44rpx;
  border: none;
  color: white;
  font-size: 32rpx;
  font-weight: 500;
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
  .role-items {
    padding: 16rpx;
  }
  
  .role-item {
    padding: 24rpx;
  }
  
  .action-btn {
    min-width: 100rpx;
    height: 56rpx;
    line-height: 56rpx;
    font-size: 24rpx;
  }
}
</style>