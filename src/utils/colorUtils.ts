/**
 * 颜色处理工具函数
 */

/**
 * 将十六进制颜色转换为 RGBA
 */
export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 生成随机颜色
 */
export function randomColor(): string {
  return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`
}

/**
 * 颜色变亮
 */
export function lightenColor(hex: string, percent: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  const newR = Math.min(255, Math.floor(r + (255 - r) * percent))
  const newG = Math.min(255, Math.floor(g + (255 - g) * percent))
  const newB = Math.min(255, Math.floor(b + (255 - b) * percent))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * 颜色变暗
 */
export function darkenColor(hex: string, percent: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  const newR = Math.floor(r * (1 - percent))
  const newG = Math.floor(g * (1 - percent))
  const newB = Math.floor(b * (1 - percent))
  
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}
