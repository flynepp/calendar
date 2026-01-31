export interface Event {
  id: string
  startTime: number // timestamp
  endTime: number   // timestamp
  allDay: boolean
  metadata?: any
}

// 视图配置接口
export interface ViewConfig {
  name: string
  description?: string
  xAxis: AxisConfig
  yAxis: AxisConfig
  layout: LayoutConfig
  styles?: ViewStyles
}

// 坐标轴配置
export interface AxisConfig {
  type: 'time-hours' | 'days-of-week' | 'weeks-of-month' | 'users' | 'empty' | 'linear' | 'single-day'
  domain: any[] | [any, any]
  range: [number, number]
  label: string
  grid?: boolean
  gridInterval?: number
  format?: (value: any) => string
}

// 布局配置
export interface LayoutConfig {
  type: 'vertical-stack' | 'horizontal-stack' | 'grid' | 'calendar-grid'
  minEventHeight: number
  maxLayers: number
  overlapStrategy: 'stack' | 'hide' | 'compress'
}

// 视图样式
export interface ViewStyles {
  gridColor?: string
  gridWidth?: number
  labelColor?: string
  labelFontSize?: number
  eventRadius?: number
  eventShadow?: string
}

// 全局配置
export interface CalendarConfig {
  views: Record<string, ViewConfig>
  defaultView: string
  users: UserConfig[]
  timeRange?: TimeRangeConfig
  styles?: GlobalStyles
  theme?: ThemeConfig
  ui?: UIConfigData
  layout?: LayoutConfigData
}

export interface UserConfig {
  id: string
  name: string
  color: string
}

export interface TimeRangeConfig {
  startHour: number
  endHour: number
  workingHours?: boolean
}

export interface GlobalStyles {
  gridColor: string
  gridWidth: number
  labelColor: string
  labelFontSize: number
  eventRadius: number
  eventShadow: string
}

export interface ThemeConfig {
  colors?: {
    primary?: string
    primaryHover?: string
    primaryActive?: string
    background?: string
    textPrimary?: string
    textSecondary?: string
    textInverse?: string
    [key: string]: string | undefined
  }
  typography?: {
    fontFamily?: string
    fontSize?: Record<string, number>
  }
  dimensions?: {
    spacing?: Record<string, number>
    borderRadius?: Record<string, number>
  }
}

export interface UIConfigData {
  title?: {
    text?: string
    fontSize?: number
    color?: string
    offsetX?: number
    offsetY?: number
  }
  buttons?: {
    width?: number
    height?: number
    gap?: number
    fontSize?: number
    views?: Array<{ id: CalendarView; label: string }>
  }
}

export interface LayoutConfigData {
  direction?: 'vertical' | 'horizontal'
  gap?: number
  regions?: Array<{
    id: string
    type: 'fixed' | 'flex'
    sizeMode: 'original' | 'scale'
    fixedWidth?: number
    fixedHeight?: number
    flexGrow?: number
    padding?: { top?: number; right?: number; bottom?: number; left?: number }
  }>
}

export interface Rect {
  x: number
  y: number
  w: number
  h: number
  layer: number
  eventId: string
  color?: string
  radius?: number
  shadow?: boolean
  metadata?: {
    title?: string
    userId?: string
  }
}

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export interface Viewport {
  position: Point
  size: Size
  zoom: number
}

export type CalendarView = 'personal-day' | 'personal-week' | 'personal-month' | 'personal-year' | 'group-day' | 'group-week'
