import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import relativeTime from 'dayjs/plugin/relativeTime'
import isBetween from 'dayjs/plugin/isBetween'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'

// 加载 dayjs 插件
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)
dayjs.extend(isBetween)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)

/**
 * 格式化日期
 * @param {string|number|Date} date - 日期
 * @param {string} format - 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return ''

    try {
        // uni-app 中日期可能是字符串、时间戳或 Date 对象
        let dateObj = date

        // 处理空值
        if (date === null || date === undefined || date === '') {
            return ''
        }

        // 如果是数字，可能是时间戳
        if (typeof date === 'number') {
            // 判断是秒级还是毫秒级时间戳
            if (date.toString().length === 10) {
                dateObj = dayjs.unix(date)
            } else {
                dateObj = dayjs(date)
            }
        } else if (typeof date === 'string') {
            // 尝试解析字符串
            dateObj = dayjs(date)
        } else {
            // 假定是 Date 对象或 dayjs 对象
            dateObj = dayjs(date)
        }

        if (!dateObj.isValid()) {
            console.warn('Invalid date:', date)
            return ''
        }

        return dateObj.format(format)
    } catch (error) {
        console.error('Error formatting date:', error)
        return ''
    }
}

/**
 * 格式化日期（仅日期部分）
 * @param {string|number|Date} date - 日期
 * @param {string} format - 格式，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDateOnly(date, format = 'YYYY-MM-DD') {
    return formatDate(date, format)
}

/**
 * 格式化时间（仅时间部分）
 * @param {string|number|Date} date - 日期
 * @param {string} format - 格式，默认 'HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(date, format = 'HH:mm:ss') {
    return formatDate(date, format)
}

/**
 * 解析日期字符串为 Date 对象
 * @param {string} dateStr - 日期字符串
 * @returns {Date|null} Date 对象或 null
 */
export function parseDate(dateStr) {
    if (!dateStr) return null

    try {
        const date = dayjs(dateStr)
        return date.isValid() ? date.toDate() : null
    } catch (error) {
        console.error('Error parsing date:', error)
        return null
    }
}

/**
 * 获取相对时间（如：3分钟前）
 * @param {string|number|Date} date - 日期
 * @returns {string} 相对时间描述
 */
export function getRelativeTime(date) {
    if (!date) return ''

    try {
        const target = dayjs(date)
        if (!target.isValid()) return ''

        const now = dayjs()

        // 计算时间差（秒）
        const diffInSeconds = now.diff(target, 'second')

        if (diffInSeconds < 0) {
            // 未来时间
            const futureDiff = Math.abs(diffInSeconds)
            if (futureDiff < 60) return `${futureDiff}秒后`
            if (futureDiff < 3600) return `${Math.floor(futureDiff / 60)}分钟后`
            if (futureDiff < 86400) return `${Math.floor(futureDiff / 3600)}小时后`
            if (futureDiff < 2592000) return `${Math.floor(futureDiff / 86400)}天后`
            if (futureDiff < 31536000) return `${Math.floor(futureDiff / 2592000)}个月后`
            return `${Math.floor(futureDiff / 31536000)}年后`
        }

        // 过去时间
        if (diffInSeconds < 60) return '刚刚'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
        if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`
        if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}个月前`
        return `${Math.floor(diffInSeconds / 31536000)}年前`
    } catch (error) {
        console.error('Error getting relative time:', error)
        return ''
    }
}

/**
 * 检查日期是否过期
 * @param {string|number|Date} date - 日期
 * @returns {boolean} 是否过期
 */
export function isExpired(date) {
    if (!date) return false

    try {
        const target = dayjs(date)
        if (!target.isValid()) return false

        return dayjs().isAfter(target)
    } catch (error) {
        console.error('Error checking expiration:', error)
        return false
    }
}

/**
 * 获取两个日期之间的天数
 * @param {string|number|Date} startDate - 开始日期
 * @param {string|number|Date} endDate - 结束日期
 * @returns {number} 天数差
 */
export function getDaysBetween(startDate, endDate) {
    if (!startDate || !endDate) return 0

    try {
        const start = dayjs(startDate)
        const end = dayjs(endDate)

        if (!start.isValid() || !end.isValid()) return 0

        return end.diff(start, 'day')
    } catch (error) {
        console.error('Error getting days between:', error)
        return 0
    }
}

/**
 * 格式化日期范围
 * @param {string|number|Date} startTime - 开始时间
 * @param {string|number|Date} endTime - 结束时间
 * @param {string} format - 日期格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期范围字符串
 */
export function getDateRange(startTime, endTime, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!startTime || !endTime) return ''

    const startFormatted = formatDate(startTime, format)
    const endFormatted = formatDate(endTime, format)

    if (!startFormatted || !endFormatted) return ''

    return `${startFormatted} 至 ${endFormatted}`
}

/**
 * 判断日期是否在范围内
 * @param {string|number|Date} date - 要检查的日期
 * @param {string|number|Date} startDate - 开始日期
 * @param {string|number|Date} endDate - 结束日期
 * @returns {boolean} 是否在范围内
 */
export function isDateInRange(date, startDate, endDate) {
    if (!date || !startDate || !endDate) return false

    try {
        const current = dayjs(date)
        const start = dayjs(startDate)
        const end = dayjs(endDate)

        if (!current.isValid() || !start.isValid() || !end.isValid()) {
            return false
        }

        return current.isBetween(start, end, null, '[]') // [ ] 表示包含边界
    } catch (error) {
        console.error('Error checking date in range:', error)
        return false
    }
}

/**
 * 获取当前时间
 * @param {string} format - 格式，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 当前时间字符串
 */
export function getCurrentDate(format = 'YYYY-MM-DD HH:mm:ss') {
    return dayjs().format(format)
}

/**
 * 日期比较
 * @param {string|number|Date} date1 - 第一个日期
 * @param {string|number|Date} date2 - 第二个日期
 * @returns {number} 比较结果：正数表示 date1 > date2，负数表示 date1 < date2，0表示相等
 */
export function compareDates(date1, date2) {
    if (!date1 || !date2) return 0

    try {
        const d1 = dayjs(date1)
        const d2 = dayjs(date2)

        if (!d1.isValid() || !d2.isValid()) return 0

        return d1.diff(d2)
    } catch (error) {
        console.error('Error comparing dates:', error)
        return 0
    }
}

/**
 * 获取友好的时间显示
 * @param {string|number|Date} date - 日期
 * @returns {string} 友好时间显示
 */
export function getFriendlyTime(date) {
    if (!date) return ''

    const now = dayjs()
    const target = dayjs(date)

    if (!target.isValid()) return ''

    const diffInDays = now.diff(target, 'day')

    if (diffInDays === 0) {
        // 今天
        return formatTime(date, 'HH:mm')
    } else if (diffInDays === 1) {
        // 昨天
        return `昨天 ${formatTime(date, 'HH:mm')}`
    } else if (diffInDays < 7) {
        // 一周内
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const dayOfWeek = target.day()
        return `${days[dayOfWeek]} ${formatTime(date, 'HH:mm')}`
    } else if (now.year() === target.year()) {
        // 今年
        return formatDate(date, 'MM-DD HH:mm')
    } else {
        // 其他年份
        return formatDate(date, 'YYYY-MM-DD HH:mm')
    }
}

/**
 * 添加天数
 * @param {string|number|Date} date - 原始日期
 * @param {number} days - 要添加的天数
 * @returns {Date} 新的日期
 */
export function addDays(date, days) {
    if (!date) return new Date()

    try {
        return dayjs(date).add(days, 'day').toDate()
    } catch (error) {
        console.error('Error adding days:', error)
        return new Date()
    }
}

/**
 * 获取月份的第一天
 * @param {string|number|Date} date - 日期
 * @returns {Date} 月份的第一天
 */
export function getFirstDayOfMonth(date) {
    if (!date) return new Date()

    try {
        return dayjs(date).startOf('month').toDate()
    } catch (error) {
        console.error('Error getting first day of month:', error)
        return new Date()
    }
}

/**
 * 获取月份的最后一天
 * @param {string|number|Date} date - 日期
 * @returns {Date} 月份的最后一天
 */
export function getLastDayOfMonth(date) {
    if (!date) return new Date()

    try {
        return dayjs(date).endOf('month').toDate()
    } catch (error) {
        console.error('Error getting last day of month:', error)
        return new Date()
    }
}

// 默认导出所有函数
export default {
    formatDate,
    formatDateOnly,
    formatTime,
    parseDate,
    getRelativeTime,
    isExpired,
    getDaysBetween,
    getDateRange,
    isDateInRange,
    getCurrentDate,
    compareDates,
    getFriendlyTime,
    addDays,
    getFirstDayOfMonth,
    getLastDayOfMonth
}