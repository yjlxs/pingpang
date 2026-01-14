// 注意：这是完全重写的 uni-app 版本，删除了所有 axios 代码

// 基础配置
const config = {
    baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:3000/api',
    timeout: 10000, // 10秒超时
    // 请求头默认配置
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
}

// 错误处理
const handleError = (error, url) => {
    console.error(`Request failed for ${url}:`, error)

    let errorMessage = '请求失败，请稍后重试'

    if (error.errMsg) {
        if (error.errMsg.includes('timeout')) {
            errorMessage = '请求超时，请检查网络连接'
        } else if (error.errMsg.includes('fail')) {
            errorMessage = '网络连接失败，请检查网络设置'
        }
    }

    // 显示错误提示
    uni.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000
    })

    return Promise.reject(error)
}

// 响应处理
const handleResponse = (res, url) => {
    console.log(`Response from ${url}:`, res)

    // 处理 HTTP 状态码
    if (res.statusCode < 200 || res.statusCode >= 300) {
        let errorMessage = `请求失败 (${res.statusCode})`

        // 常见的 HTTP 状态码处理
        switch (res.statusCode) {
            case 400:
                errorMessage = '请求参数错误'
                break
            case 401:
                errorMessage = '未授权，请重新登录'
                // 清除 token 并跳转到登录页
                uni.removeStorageSync('token')
                uni.removeStorageSync('userInfo')
                uni.showToast({
                    title: '登录已过期，请重新登录',
                    icon: 'none',
                    duration: 2000
                })

                setTimeout(() => {
                    uni.navigateTo({
                        url: '/pages/login/login'
                    })
                }, 1500)
                break
            case 403:
                errorMessage = '没有权限访问该资源'
                break
            case 404:
                errorMessage = '请求的资源不存在'
                break
            case 500:
                errorMessage = '服务器内部错误'
                break
            case 502:
            case 503:
            case 504:
                errorMessage = '服务暂时不可用，请稍后重试'
                break
        }

        uni.showToast({
            title: errorMessage,
            icon: 'none',
            duration: 3000
        })

        return Promise.reject({
            statusCode: res.statusCode,
            message: errorMessage,
            data: res.data
        })
    }

    // 处理业务响应
    const responseData = res.data

    // 检查响应数据格式
    if (!responseData) {
        console.warn('Empty response data')
        return Promise.resolve({})
    }

    // 如果后端使用统一的响应格式（例如：{ code: 200, data: {}, message: '' }）
    if (responseData.code !== undefined) {
        if (responseData.code === 200 || responseData.code === 0) {
            // 成功
            return Promise.resolve(responseData.data || responseData)
        } else {
            // 业务错误
            const errorMessage = responseData.message || '请求失败'

            uni.showToast({
                title: errorMessage,
                icon: 'none',
                duration: 3000
            })

            return Promise.reject({
                code: responseData.code,
                message: errorMessage,
                data: responseData.data
            })
        }
    }

    // 如果没有 code 字段，直接返回数据
    return Promise.resolve(responseData)
}

// 请求拦截器（模拟）
const requestInterceptor = (config) => {
    // 获取 token
    const token = uni.getStorageSync('token')

    // 添加 Authorization 头
    if (token) {
        config.header = {
            ...config.header,
            'Authorization': `Bearer ${token}`
        }
    }

    // 添加请求时间戳（防止缓存）
    if (config.method === 'GET') {
        if (!config.data) config.data = {}
        config.data._t = Date.now()
    }

    console.log(`Request ${config.method} ${config.url}:`, config)

    return config
}

// 主请求函数
const request = (options) => {
    return new Promise((resolve, reject) => {
        const {
            url,
            method = 'GET',
            data = {},
            params = {},
            headers = {},
            timeout = config.timeout,
            dataType = 'json',
            responseType = 'text'
        } = options

        // 构建完整的 URL
        let requestUrl = url

        // 如果不是完整 URL，添加 baseURL
        if (!requestUrl.startsWith('http://') && !requestUrl.startsWith('https://')) {
            requestUrl = config.baseURL + requestUrl
        }

        // 处理查询参数（GET 请求）
        if (method.toUpperCase() === 'GET' && Object.keys(params).length > 0) {
            const queryString = Object.keys(params)
                .map(key => {
                    const value = params[key]
                    // 过滤掉 undefined 和 null
                    if (value === undefined || value === null) return ''
                    return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
                })
                .filter(Boolean)
                .join('&')

            if (queryString) {
                requestUrl += (requestUrl.includes('?') ? '&' : '?') + queryString
            }
        }

        // 准备请求配置
        const requestConfig = {
            url: requestUrl,
            method: method.toUpperCase(),
            data: method.toUpperCase() === 'GET' ? undefined : data,
            header: {
                ...config.headers,
                ...headers
            },
            timeout,
            dataType,
            responseType,
            success: (res) => {
                handleResponse(res, url)
                    .then(resolve)
                    .catch(reject)
            },
            fail: (error) => {
                handleError(error, url)
                    .then(reject)
                    .catch(reject)
            }
        }

        // 应用请求拦截器
        const finalConfig = requestInterceptor(requestConfig)

        // 发送请求
        uni.request(finalConfig)
    })
}

// 快捷方法
const createMethod = (method) => (url, dataOrParams, options = {}) => {
    const isGet = method.toUpperCase() === 'GET'
    const config = {
        url,
        method,
        ...options
    }

    if (isGet) {
        config.params = dataOrParams
    } else {
        config.data = dataOrParams
    }

    return request(config)
}

// 导出常用的请求方法
export const get = createMethod('GET')
export const post = createMethod('POST')
export const put = createMethod('PUT')
export const del = createMethod('DELETE')
export const patch = createMethod('PATCH')

// 文件上传
export const upload = (url, filePath, formData = {}, options = {}) => {
    return new Promise((resolve, reject) => {
        // 获取 token
        const token = uni.getStorageSync('token')

        // 构建完整的 URL
        let requestUrl = url
        if (!requestUrl.startsWith('http://') && !requestUrl.startsWith('https://')) {
            requestUrl = config.baseURL + requestUrl
        }

        const uploadConfig = {
            url: requestUrl,
            filePath,
            name: options.name || 'file',
            formData,
            header: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers
            },
            success: (res) => {
                handleResponse(res, url)
                    .then(resolve)
                    .catch(reject)
            },
            fail: (error) => {
                handleError(error, url)
                    .then(reject)
                    .catch(reject)
            }
        }

        uni.uploadFile(uploadConfig)
    })
}

// 文件下载
export const download = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        // 获取 token
        const token = uni.getStorageSync('token')

        // 构建完整的 URL
        let requestUrl = url
        if (!requestUrl.startsWith('http://') && !requestUrl.startsWith('https://')) {
            requestUrl = config.baseURL + requestUrl
        }

        const downloadConfig = {
            url: requestUrl,
            header: {
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...options.headers
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    resolve(res.tempFilePath || res)
                } else {
                    reject(new Error(`下载失败: ${res.statusCode}`))
                }
            },
            fail: reject
        }

        uni.downloadFile(downloadConfig)
    })
}

// 设置全局配置
export const setConfig = (newConfig) => {
    Object.assign(config, newConfig)
}

// 获取当前配置
export const getConfig = () => {
    return { ...config }
}

// 默认导出 request 函数
const http = request
http.get = get
http.post = post
http.put = put
http.delete = del
http.patch = patch
http.upload = upload
http.download = download
http.setConfig = setConfig
http.getConfig = getConfig

export default http