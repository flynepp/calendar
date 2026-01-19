import { scaleLinear, scaleBand } from 'd3-scale'
import { Event, ViewConfig, Rect, CalendarConfig } from '../types'
import { AppState } from '../main-canvas'
import {
  roundRect,
  drawShadow,
  clearShadow,
  drawTextWithEllipsis,
  isPointInRect
} from '../utils/canvasUtils'

export class ConfigCalendar {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private config: CalendarConfig
  private currentView: ViewConfig
  private dpr: number = window.devicePixelRatio || 1
  private hoveredEventId: string | null = null
  private renderBounds: { x: number; y: number; width: number; height: number } | null = null
  
  constructor(canvas: HTMLCanvasElement, config: CalendarConfig) {
    this.canvas = canvas
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Failed to get 2D context')
    this.ctx = context
    this.config = config
    this.currentView = config.views[config.defaultView]
    this.setupCanvas()
  }
  
  /**
   * 设置渲染区域边界
   */
  public setRenderBounds(x: number, y: number, width: number, height: number): void {
    this.renderBounds = { x, y, width, height }
  }
  
  /**
   * 清除渲染区域边界
   */
  public clearRenderBounds(): void {
    this.renderBounds = null
  }
  
  /**
   * 获取实际渲染区域的尺寸
   */
  private getRenderDimensions(): { x: number; y: number; width: number; height: number } {
    if (this.renderBounds) {
      return this.renderBounds
    }
    
    const width = this.canvas.width / this.dpr
    const height = this.canvas.height / this.dpr
    return { x: 0, y: 0, width, height }
  }
  
  private setupCanvas(): void {
    this.updateCanvasSize()
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'
  }
  
  private updateCanvasSize(): void {
    const rect = this.canvas.getBoundingClientRect()
    const newWidth = rect.width * this.dpr
    const newHeight = rect.height * this.dpr
    
    // 只在尺寸变化时更新
    if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
      this.canvas.width = newWidth
      this.canvas.height = newHeight
      this.ctx.scale(this.dpr, this.dpr)
    }
  }
  
  public setView(viewKey: string): void {
    if (this.config.views[viewKey]) {
      this.currentView = this.config.views[viewKey]
    } else {
      console.warn(`View '${viewKey}' not found, using default`)
      this.currentView = this.config.views[this.config.defaultView]
    }
  }
  
  public render(events: Event[]): void {
    const dims = this.getRenderDimensions()
    
    // 如果设置了渲染边界，应用裁剪
    if (this.renderBounds) {
      this.ctx.save()
      this.ctx.beginPath()
      this.ctx.rect(dims.x, dims.y, dims.width, dims.height)
      this.ctx.clip()
    }
    
    this.clearCanvas()
    this.drawGrid()
    const rects = this.layoutEvents(events)
    this.drawEvents(rects)
    this.drawLabels()
    
    if (this.renderBounds) {
      this.ctx.restore()
    }
  }
  
  private clearCanvas(): void {
    const dims = this.getRenderDimensions()
    this.ctx.fillStyle = '#ffffff'
    this.ctx.fillRect(dims.x, dims.y, dims.width, dims.height)
  }
  
  private drawGrid(): void {
    const { xAxis, yAxis } = this.currentView
    const dims = this.getRenderDimensions()
    
    const gridColor = this.config.styles?.gridColor || '#e0e0e0'
    const gridWidth = this.config.styles?.gridWidth || 1
    
    this.ctx.strokeStyle = gridColor
    this.ctx.lineWidth = gridWidth
    
    // X-axis grid - 使用全局坐标（传入偏移量）
    if (xAxis.grid && xAxis.type !== 'single-day' && xAxis.type !== 'empty') {
      const xScale = this.createScale(xAxis, dims.width, dims.x)
      const xDomain = Array.isArray(xAxis.domain) ? xAxis.domain : []
      for (const value of xDomain) {
        const x = xScale(value)
        this.ctx.beginPath()
        this.ctx.moveTo(x, dims.y)
        this.ctx.lineTo(x, dims.y + dims.height)
        this.ctx.stroke()
      }
    }
    
    // Y-axis grid
    if (yAxis.grid) {
      const yScale = this.createScale(yAxis, dims.height, dims.y)
      
      if (yAxis.type === 'time-hours' && Array.isArray(yAxis.domain) && yAxis.domain.length === 2) {
        // 时间轴：按小时绘制网格线
        const [startHour, endHour] = yAxis.domain
        const interval = yAxis.gridInterval || 1
        
        for (let hour = startHour; hour <= endHour; hour += interval) {
          const y = yScale(hour)
          this.ctx.beginPath()
          this.ctx.moveTo(dims.x, y)
          this.ctx.lineTo(dims.x + dims.width, y)
          this.ctx.stroke()
        }
      } else {
        // 其他类型：遍历 domain
        const yDomain = Array.isArray(yAxis.domain) ? yAxis.domain : []
        for (const value of yDomain) {
          const y = yScale(value)
          this.ctx.beginPath()
          this.ctx.moveTo(dims.x, y)
          this.ctx.lineTo(dims.x + dims.width, y)
          this.ctx.stroke()
        }
      }
    }
  }
  
  private createScale(axisConfig: any, rangeSize: number, rangeOffset: number = 0): any {
    const { type, domain, range } = axisConfig
    const [rangeStart, rangeEnd] = range
    
    // 注意：range 是比例值（0-1），需要转换为像素值
    // rangeOffset 用于全局坐标，如果为0则返回相对坐标
    const pixelStart = rangeOffset + rangeStart * rangeSize
    const pixelEnd = rangeOffset + rangeEnd * rangeSize
    
    switch (type) {
      case 'time-hours':
      case 'weeks-of-month':
      case 'linear':
        return scaleLinear()
          .domain(domain)
          .range([pixelStart, pixelEnd])
      
      case 'days-of-week':
      case 'users':
        return scaleBand()
          .domain(domain)
          .range([pixelStart, pixelEnd])
          .padding(0.1)
      
      case 'single-day':
      case 'empty':
        // 返回固定位置或范围
        return scaleLinear()
          .domain(domain)
          .range([pixelStart, pixelEnd])
      
      default:
        return scaleLinear()
          .domain([0, 1])
          .range([pixelStart, pixelEnd])
    }
  }
  
  private layoutEvents(events: Event[]): Rect[] {
    const rects: Rect[] = []
    const { xAxis, yAxis, layout } = this.currentView
    const dims = this.getRenderDimensions()
    
    // 使用相对坐标（不传入偏移量），返回的坐标相对于区域左上角
    const xScale = this.createScale(xAxis, dims.width, 0)
    const yScale = this.createScale(yAxis, dims.height, 0)
    
    for (const event of events) {
      const rect = this.layoutEvent(event, xScale, yScale, layout)
      if (rect) rects.push(rect)
    }
    
    return rects
  }
  
  private layoutEvent(event: Event, xScale: any, yScale: any, layout: any): Rect | null {
    const startTime = new Date(event.startTime)
    const endTime = new Date(event.endTime)
    
    // X position
    let x: number, w: number
    if (this.currentView.xAxis.type === 'time-hours') {
      const startHour = startTime.getHours() + startTime.getMinutes() / 60
      const endHour = endTime.getHours() + endTime.getMinutes() / 60
      x = xScale(startHour)
      w = xScale(endHour) - x
    } else if (this.currentView.xAxis.type === 'days-of-week') {
      const dayIndex = startTime.getDay()
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const dayName = dayNames[dayIndex]
      x = xScale(dayName) || 0
      w = xScale.bandwidth() || 0
    } else if (this.currentView.xAxis.type === 'users') {
      x = xScale(event.userId || '') || 0
      w = xScale.bandwidth() || 0
    } else if (this.currentView.xAxis.type === 'single-day') {
      // 个人日视图：横轴是一天，占据整个宽度
      x = xScale(0)
      w = xScale(1) - xScale(0)
    } else if (this.currentView.xAxis.type === 'empty') {
      // 空轴：使用固定位置
      const width = this.canvas.width / this.dpr
      x = width * 0.1
      w = width * 0.8
    } else {
      x = 0
      w = 100
    }
    
    // Y position
    let y: number, h: number
    if (this.currentView.yAxis.type === 'time-hours') {
      const startHour = startTime.getHours() + startTime.getMinutes() / 60
      const endHour = endTime.getHours() + endTime.getMinutes() / 60
      y = yScale(startHour)
      h = Math.max(layout.minEventHeight, yScale(endHour) - y)
    } else if (this.currentView.yAxis.type === 'users') {
      y = yScale(event.userId || '') || 0
      h = yScale.bandwidth() || layout.minEventHeight
    } else {
      y = 0
      h = layout.minEventHeight
    }
    
    if (w < 2 || h < 2) return null
    
    return {
      x,
      y,
      w,
      h,
      layer: event.layer || 0,
      eventId: event.id,
      color: event.metadata?.color || '#007AFF',
      radius: this.config.styles?.eventRadius || 4,
      metadata: {
        title: event.metadata?.title,
        userId: event.userId
      }
    }
  }
  
  private drawEvents(rects: Rect[]): void {
    for (const rect of rects) {
      this.drawEventRect(rect)
    }
  }
  
  private drawEventRect(rect: Rect): void {
    const { x, y, w, h, color, radius = 4, eventId } = rect
    const isHovered = eventId === this.hoveredEventId
    
    // 转换相对坐标为全局坐标（加上区域偏移）
    const dims = this.getRenderDimensions()
    const globalX = dims.x + x
    const globalY = dims.y + y
    
    // Shadow
    const shadow = this.config.styles?.eventShadow || '0 2px 6px rgba(0,0,0,0.2)'
    const shadowParts = shadow.match(/[0-9.]+/g) || ['0', '2', '6']
    
    drawShadow(this.ctx, {
      color: isHovered ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.2)',
      blur: parseFloat(shadowParts[2]) * (isHovered ? 1.5 : 1),
      offsetX: parseFloat(shadowParts[0]),
      offsetY: parseFloat(shadowParts[1]) * (isHovered ? 1.5 : 1)
    })
    
    // Rectangle
    this.ctx.fillStyle = isHovered ? this.lightenColor(color || '#007AFF', 20) : (color || '#007AFF')
    roundRect(this.ctx, globalX, globalY, w, h, radius)
    this.ctx.fill()
    
    clearShadow(this.ctx)
    
    // Text
    if (w > 30 && h > 20) {
      this.ctx.fillStyle = '#ffffff'
      this.ctx.font = `${this.config.styles?.labelFontSize || 12}px -apple-system, sans-serif`
      this.ctx.textBaseline = 'top'
      
      const padding = 4
      const textX = globalX + padding
      const textY = globalY + padding
      const maxWidth = w - padding * 2
      
      const title = rect.metadata?.title || 'Event'
      drawTextWithEllipsis(this.ctx, title, textX, textY, maxWidth)
    }
  }
  
  private lightenColor(color: string, percent: number): string {
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16)
      const r = Math.min(255, ((num >> 16) & 0xff) + percent)
      const g = Math.min(255, ((num >> 8) & 0xff) + percent)
      const b = Math.min(255, (num & 0xff) + percent)
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    }
    return color
  }
  
  private drawLabels(): void {
    const { xAxis, yAxis } = this.currentView
    const dims = this.getRenderDimensions()
    
    const labelColor = this.config.styles?.labelColor || '#666666'
    const fontSize = this.config.styles?.labelFontSize || 12
    
    this.ctx.fillStyle = labelColor
    this.ctx.font = `${fontSize}px -apple-system, sans-serif`
    
    // X labels
    if (xAxis.type !== 'empty' && xAxis.type !== 'single-day') {
      const xScale = this.createScale(xAxis, dims.width, dims.x)
      const xDomain = Array.isArray(xAxis.domain) ? xAxis.domain : []
      
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'top'
      
      xDomain.forEach((value) => {
        const x = xScale(value)
        const label = xAxis.format ? xAxis.format(value) : String(value)
        
        if (xAxis.type === 'days-of-week' || xAxis.type === 'users') {
          const bandWidth = xScale.bandwidth()
          this.ctx.fillText(label, x + bandWidth / 2, dims.y + dims.height - 25)
        } else {
          this.ctx.fillText(label, x, dims.y + dims.height - 25)
        }
      })
    } else if (xAxis.type === 'single-day') {
      // 个人日视图：在顶部显示日期标签
      const xScale = this.createScale(xAxis, dims.width, dims.x)
      const centerX = (xScale(0) + xScale(1)) / 2
      
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'top'
      
      const today = new Date()
      const dateLabel = `${today.getMonth() + 1}/${today.getDate()} ${xAxis.label || '今天'}`
      this.ctx.fillText(dateLabel, centerX, dims.y + 10)
    }
    
    // Y labels
    if (yAxis.type !== 'empty') {
      const yScale = this.createScale(yAxis, dims.height, dims.y)
      
      this.ctx.textAlign = 'right'
      this.ctx.textBaseline = 'middle'
      
      if (yAxis.type === 'time-hours' && Array.isArray(yAxis.domain) && yAxis.domain.length === 2) {
        // 时间轴：显示小时标签
        const [startHour, endHour] = yAxis.domain
        const interval = yAxis.gridInterval || 1
        
        for (let hour = startHour; hour <= endHour; hour += interval) {
          const y = yScale(hour)
          const label = yAxis.format ? yAxis.format(hour) : `${hour}:00`
          this.ctx.fillText(label, 45, y)
        }
      } else if (yAxis.type === 'users') {
        const yDomain = Array.isArray(yAxis.domain) ? yAxis.domain : []
        yDomain.forEach((value) => {
          const y = yScale(value)
          const bandWidth = yScale.bandwidth()
          const label = yAxis.format ? yAxis.format(value) : String(value)
          this.ctx.fillText(label, 45, y + bandWidth / 2)
        })
      } else {
        const yDomain = Array.isArray(yAxis.domain) ? yAxis.domain : []
        yDomain.forEach((value) => {
          const y = yScale(value)
          const label = yAxis.format ? yAxis.format(value) : String(value)
          this.ctx.fillText(label, 45, y)
        })
      }
    }
  }
  
  public handleResize(): void {
    this.updateCanvasSize()
  }
  
  public handleMouseMove(x: number, y: number, state: AppState): void {
    const rects = this.layoutEvents(state.events)
    let newHoveredEventId: string | null = null
    
    // 调试日志：输出鼠标坐标和事件坐标
    if (Math.random() < 0.05) { // 5% 概率输出，避免刷屏
      console.log(`[ConfigCalendar] Mouse at: (${x.toFixed(1)}, ${y.toFixed(1)})`)
      if (rects.length > 0) {
        console.log(`[ConfigCalendar] First event rect: (${rects[0].x.toFixed(1)}, ${rects[0].y.toFixed(1)}, ${rects[0].w.toFixed(1)}×${rects[0].h.toFixed(1)})`)
      }
    }
    
    for (const rect of rects) {
      if (isPointInRect({ x, y }, { x: rect.x, y: rect.y, width: rect.w, height: rect.h })) {
        newHoveredEventId = rect.eventId
        console.log(`[ConfigCalendar] Hovered event: ${rect.eventId} at (${rect.x}, ${rect.y})`)
        break
      }
    }
    
    if (newHoveredEventId !== this.hoveredEventId) {
      this.hoveredEventId = newHoveredEventId
      this.render(state.events)
    }
  }
  
  public handleClick(x: number, y: number, state: AppState): void {
    const rects = this.layoutEvents(state.events)
    
    for (const rect of rects) {
      if (isPointInRect({ x, y }, { x: rect.x, y: rect.y, width: rect.w, height: rect.h })) {
        console.log(`Clicked event: ${rect.eventId}`)
        state.selectedEventId = rect.eventId
        
        const eventCountElement = document.getElementById('event-count')
        if (eventCountElement) {
          eventCountElement.textContent = `${state.events.length} events (selected: ${rect.eventId})`
        }
        return
      }
    }
    
    console.log(`Clicked on empty space at (${x}, ${y})`)
    state.selectedEventId = null
  }
}