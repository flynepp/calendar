/**
 * 配置助手函数 - 从配置文件中获取值
 */
import type { CalendarConfig } from '../types'

/**
 * 全局配置存储
 */
let globalConfig: CalendarConfig | null = null

export function setGlobalConfig(config: CalendarConfig): void {
  globalConfig = config
}

export function getGlobalConfig(): CalendarConfig | null {
  return globalConfig
}

/**
 * 获取主题颜色
 */
export function getThemeColor(key: string, defaultValue: string = '#000000'): string {
  if (!globalConfig?.theme?.colors) return defaultValue
  const colors = globalConfig.theme.colors as any
  return colors[key] || defaultValue
}

/**
 * 获取字体大小
 */
export function getFontSize(key: string, defaultValue: number = 12): number {
  if (!globalConfig?.theme?.typography?.fontSize) return defaultValue
  const sizes = globalConfig.theme.typography.fontSize as any
  return sizes[key] || defaultValue
}

/**
 * 获取间距
 */
export function getSpacing(key: string, defaultValue: number = 8): number {
  if (!globalConfig?.theme?.dimensions?.spacing) return defaultValue
  const spacing = globalConfig.theme.dimensions.spacing as any
  return spacing[key] || defaultValue
}

/**
 * 获取圆角
 */
export function getBorderRadius(key: string, defaultValue: number = 4): number {
  if (!globalConfig?.theme?.dimensions?.borderRadius) return defaultValue
  const radius = globalConfig.theme.dimensions.borderRadius as any
  return radius[key] || defaultValue
}

/**
 * 获取样式配置
 */
export function getStyleConfig<T = any>(path: string, defaultValue?: T): T {
  if (!globalConfig?.styles) return defaultValue as T
  const styles = globalConfig.styles as any
  return styles[path] || defaultValue
}

/**
 * 获取 UI 配置
 */
export function getUIConfig<T = any>(path: string, defaultValue: T): T {
  if (!globalConfig?.ui) return defaultValue
  const parts = path.split('.')
  let value: any = globalConfig.ui
  for (const part of parts) {
    if (value && typeof value === 'object') {
      value = value[part]
    } else {
      return defaultValue
    }
  }
  return value !== undefined ? value : defaultValue
}
