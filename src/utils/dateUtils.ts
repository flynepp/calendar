/**
 * 日期相关工具函数
 */

/**
 * 获取一周的日期范围
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setDate(date.getDate() - date.getDay())
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * 获取一个月的日期范围
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
  
  return { start, end }
}

/**
 * 获取当天的日期范围
 */
export function getDayRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  
  return { start, end }
}

/**
 * 格式化时间为 HH:mm
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * 格式化日期为 MM/DD
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getMonth() + 1}/${date.getDate()}`
}

/**
 * 格式化完整日期时间
 */
export function formatDateTime(timestamp: number): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`
}

/**
 * 判断两个日期是否是同一天
 */
export function isSameDay(date1: Date | number, date2: Date | number): boolean {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
}

/**
 * 获取时间戳对应的小时数（0-23）
 */
export function getHourFromTimestamp(timestamp: number): number {
  return new Date(timestamp).getHours()
}

/**
 * 获取时间戳对应的分钟数（0-59）
 */
export function getMinuteFromTimestamp(timestamp: number): number {
  return new Date(timestamp).getMinutes()
}
