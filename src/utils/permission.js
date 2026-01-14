/**
 * 检查用户是否有指定权限
 * @param {string} permissionCode - 权限代码
 * @returns {boolean} - 是否有权限
 */
export function hasPermission(permissionCode) {
    if (!permissionCode) {
        console.warn('Permission code is required')
        return false
    }

    try {
        // 使用 uni.getStorageSync 替代 localStorage
        const permissionsStr = uni.getStorageSync('userPermissions')

        // 如果没有存储权限信息，返回 false
        if (!permissionsStr) {
            console.warn('No permissions found in storage')
            return false
        }

        let permissions = []

        // 尝试解析权限数据
        if (typeof permissionsStr === 'string') {
            permissions = JSON.parse(permissionsStr)
        } else if (Array.isArray(permissionsStr)) {
            permissions = permissionsStr
        }

        // 检查权限
        if (!Array.isArray(permissions)) {
            console.error('Permissions data is not an array:', permissions)
            return false
        }

        // 支持两种权限格式：字符串数组 或 对象数组（包含 code 属性）
        const hasPerm = permissions.some(permission => {
            if (typeof permission === 'string') {
                return permission === permissionCode
            } else if (permission && typeof permission === 'object') {
                return permission.code === permissionCode
            }
            return false
        })

        console.log(`Permission check: ${permissionCode} -> ${hasPerm ? 'GRANTED' : 'DENIED'}`)
        return hasPerm
    } catch (error) {
        console.error('Error checking permission:', error)
        return false
    }
}

/**
 * 检查用户是否有指定角色
 * @param {string|string[]} roleCode - 角色代码或角色代码数组
 * @returns {boolean} - 是否有角色
 */
export function hasRole(roleCode) {
    if (!roleCode) {
        console.warn('Role code is required')
        return false
    }

    try {
        // 获取用户信息
        const userInfoStr = uni.getStorageSync('userInfo')

        if (!userInfoStr) {
            console.warn('No user info found in storage')
            return false
        }

        let userInfo = {}

        // 解析用户信息
        if (typeof userInfoStr === 'string') {
            userInfo = JSON.parse(userInfoStr)
        } else if (typeof userInfoStr === 'object') {
            userInfo = userInfoStr
        }

        const roles = userInfo.roles || []

        // 如果是数组，检查是否有任意一个角色
        if (Array.isArray(roleCode)) {
            return roleCode.some(code =>
                roles.some(role => {
                    if (typeof role === 'string') {
                        return role === code
                    } else if (role && typeof role === 'object') {
                        return role.code === code
                    }
                    return false
                })
            )
        }

        // 如果是单个角色代码
        return roles.some(role => {
            if (typeof role === 'string') {
                return role === roleCode
            } else if (role && typeof role === 'object') {
                return role.code === roleCode
            }
            return false
        })
    } catch (error) {
        console.error('Error checking role:', error)
        return false
    }
}

/**
 * 获取用户所有权限代码
 * @returns {string[]} - 权限代码数组
 */
export function getUserPermissionCodes() {
    try {
        const permissionsStr = uni.getStorageSync('userPermissions')

        if (!permissionsStr) {
            return []
        }

        let permissions = []

        if (typeof permissionsStr === 'string') {
            permissions = JSON.parse(permissionsStr)
        } else if (Array.isArray(permissionsStr)) {
            permissions = permissionsStr
        }

        if (!Array.isArray(permissions)) {
            return []
        }

        // 提取权限代码
        return permissions.map(permission => {
            if (typeof permission === 'string') {
                return permission
            } else if (permission && typeof permission === 'object') {
                return permission.code || ''
            }
            return ''
        }).filter(code => code)
    } catch (error) {
        console.error('Error getting user permission codes:', error)
        return []
    }
}

/**
 * 检查用户是否有任意一个指定权限
 * @param {string[]} permissionCodes - 权限代码数组
 * @returns {boolean} - 是否有权限
 */
export function hasAnyPermission(permissionCodes) {
    if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
        console.warn('Permission codes array is required')
        return false
    }

    const userPermissions = getUserPermissionCodes()

    if (userPermissions.length === 0) {
        return false
    }

    // 检查是否有任意一个权限
    const hasAny = permissionCodes.some(code => {
        if (!code) return false
        return userPermissions.includes(code)
    })

    console.log(`Any permission check: ${JSON.stringify(permissionCodes)} -> ${hasAny ? 'GRANTED' : 'DENIED'}`)
    return hasAny
}

/**
 * 检查用户是否有所有指定权限
 * @param {string[]} permissionCodes - 权限代码数组
 * @returns {boolean} - 是否有所有权限
 */
export function hasAllPermissions(permissionCodes) {
    if (!Array.isArray(permissionCodes) || permissionCodes.length === 0) {
        console.warn('Permission codes array is required')
        return false
    }

    const userPermissions = getUserPermissionCodes()

    if (userPermissions.length === 0) {
        return false
    }

    // 检查是否拥有所有权限
    const hasAll = permissionCodes.every(code => {
        if (!code) return false
        return userPermissions.includes(code)
    })

    console.log(`All permissions check: ${JSON.stringify(permissionCodes)} -> ${hasAll ? 'GRANTED' : 'DENIED'}`)
    return hasAll
}

/**
 * 设置用户权限
 * @param {Array} permissions - 权限数组
 */
export function setUserPermissions(permissions) {
    if (!permissions) {
        console.warn('Permissions data is required')
        return
    }

    try {
        // 确保是数组
        const permissionsArray = Array.isArray(permissions) ? permissions : []

        // 存储权限
        uni.setStorageSync('userPermissions', JSON.stringify(permissionsArray))
        console.log('User permissions set successfully')
    } catch (error) {
        console.error('Error setting user permissions:', error)
    }
}

/**
 * 设置用户信息
 * @param {Object} userInfo - 用户信息对象
 */
export function setUserInfo(userInfo) {
    if (!userInfo || typeof userInfo !== 'object') {
        console.warn('User info object is required')
        return
    }

    try {
        // 存储用户信息
        uni.setStorageSync('userInfo', JSON.stringify(userInfo))
        console.log('User info set successfully')
    } catch (error) {
        console.error('Error setting user info:', error)
    }
}

/**
 * 设置用户 token
 * @param {string} token - JWT token
 */
export function setToken(token) {
    if (!token) {
        console.warn('Token is required')
        return
    }

    try {
        uni.setStorageSync('token', token)
        console.log('Token set successfully')
    } catch (error) {
        console.error('Error setting token:', error)
    }
}

/**
 * 获取用户 token
 * @returns {string} - JWT token
 */
export function getToken() {
    try {
        return uni.getStorageSync('token') || ''
    } catch (error) {
        console.error('Error getting token:', error)
        return ''
    }
}

/**
 * 获取用户信息
 * @returns {Object} - 用户信息对象
 */
export function getUserInfo() {
    try {
        const userInfoStr = uni.getStorageSync('userInfo')

        if (!userInfoStr) {
            return {}
        }

        if (typeof userInfoStr === 'string') {
            return JSON.parse(userInfoStr) || {}
        }

        return userInfoStr || {}
    } catch (error) {
        console.error('Error getting user info:', error)
        return {}
    }
}

/**
 * 清除用户认证信息
 */
export function clearUserAuth() {
    try {
        // 清除所有认证相关存储
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
        uni.removeStorageSync('userPermissions')

        console.log('User auth cleared successfully')
    } catch (error) {
        console.error('Error clearing user auth:', error)
    }
}

/**
 * 检查用户是否已登录
 * @returns {boolean} - 是否已登录
 */
export function isLoggedIn() {
    try {
        const token = uni.getStorageSync('token')
        const userInfo = uni.getStorageSync('userInfo')

        // 要求同时有 token 和用户信息才算登录
        return !!token && !!userInfo
    } catch (error) {
        console.error('Error checking login status:', error)
        return false
    }
}

/**
 * 权限检查组合式函数
 * @returns {Object} - 包含权限检查方法的对象
 */
export function usePermission() {
    return {
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        getUserPermissionCodes,
        setUserPermissions,
        setUserInfo,
        setToken,
        getToken,
        getUserInfo,
        clearUserAuth,
        isLoggedIn
    }
}

/**
 * 页面路由守卫（替代 Vue Router 的导航守卫）
 * @param {Array} requiredPermissions - 需要的权限数组
 * @param {string} redirectUrl - 无权限时重定向的URL
 * @returns {Object} - 页面配置对象
 */
export function createPageGuard(requiredPermissions = [], redirectUrl = '/pages/login/login') {
    return {
        onLoad(options) {
            console.log('Page guard checking permissions:', requiredPermissions)

            // 检查登录状态
            if (!isLoggedIn()) {
                console.warn('User not logged in, redirecting to login')
                uni.showToast({
                    title: '请先登录',
                    icon: 'none',
                    duration: 2000
                })

                setTimeout(() => {
                    uni.redirectTo({
                        url: redirectUrl
                    })
                }, 1500)
                return
            }

            // 检查权限
            if (requiredPermissions.length > 0) {
                const hasRequired = hasAllPermissions(requiredPermissions)

                if (!hasRequired) {
                    console.warn('Insufficient permissions, redirecting')
                    uni.showToast({
                        title: '无权限访问',
                        icon: 'none',
                        duration: 2000
                    })

                    setTimeout(() => {
                        uni.navigateBack()
                    }, 1500)
                    return
                }
            }

            console.log('Page guard passed')
        }
    }
}

// 默认导出
export default {
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissionCodes,
    setUserPermissions,
    setUserInfo,
    setToken,
    getToken,
    getUserInfo,
    clearUserAuth,
    isLoggedIn,
    usePermission,
    createPageGuard
}