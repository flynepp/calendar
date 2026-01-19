/**
 * Canvas UI 控件系统
 * 用于在 Canvas 内绘制和管理交互式 UI 元素
 */
import { getThemeColor, getBorderRadius } from '../config/configHelper'

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number      // 左上角 x 坐标（与 HTML/CSS 坐标系一致）
  y: number      // 左上角 y 坐标（与 HTML/CSS 坐标系一致）
  width: number  // 宽度
  height: number // 高度
}

export interface UIElement {
  id: string
  layer: number // 层级，数字越大越在上层
  regionId?: string // 所属区域 ID
  bounds: Rect
  render(ctx: CanvasRenderingContext2D): void
  hitTest(point: Point): boolean
  onClick?(point: Point): void
  onHover?(point: Point): void
  onLeave?(): void
}

export interface ButtonConfig {
  id: string
  x: number
  y: number
  width: number
  height: number
  text: string
  layer?: number
  regionId?: string // 所属区域
  backgroundColor?: string
  hoverColor?: string
  activeColor?: string
  textColor?: string
  fontSize?: number
  borderRadius?: number
  onClick?: () => void
}

export class CanvasButton implements UIElement {
  id: string
  layer: number
  regionId?: string
  bounds: Rect
  text: string
  backgroundColor: string
  hoverColor: string
  activeColor: string
  textColor: string
  fontSize: number
  borderRadius: number
  private _onClick?: () => void
  private _isHovered: boolean = false
  private _isActive: boolean = false
  
  // 渲染时的实际坐标（可能和 bounds 不同，用于精确的交互判断）
  private _renderBounds: Rect | null = null

  constructor(config: ButtonConfig) {
    this.id = config.id
    this.layer = config.layer || 100
    this.regionId = config.regionId
    this.bounds = {
      x: config.x,
      y: config.y,
      width: config.width,
      height: config.height
    }
    this.text = config.text
    this.backgroundColor = config.backgroundColor || getThemeColor('primary', '#1a73e8')
    this.hoverColor = config.hoverColor || getThemeColor('primaryHover', '#1557b0')
    this.activeColor = config.activeColor || getThemeColor('primaryActive', '#0d47a1')
    this.textColor = config.textColor || getThemeColor('textInverse', '#ffffff')
    this.fontSize = config.fontSize || 14
    this.borderRadius = config.borderRadius || getBorderRadius('md', 6)
    this._onClick = config.onClick
  }

  setActive(active: boolean) {
    this._isActive = active
  }
  
  /**
   * 更新控件位置（用于布局变化时）
   */
  updatePosition(x: number, y: number): void {
    this.bounds.x = x
    this.bounds.y = y
    this._renderBounds = null // 清除缓存，下次渲染时更新
  }
  
  /**
   * 获取实际渲染的边界（用于精确的交互判断）
   */
  getRenderBounds(): Rect {
    return this._renderBounds || this.bounds
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height } = this.bounds // 左上角坐标
    
    // 缓存渲染边界用于交互判断
    this._renderBounds = { x, y, width, height }

    // 背景
    ctx.fillStyle = this._isActive
      ? this.activeColor
      : this._isHovered
      ? this.hoverColor
      : this.backgroundColor

    // 圆角矩形（从左上角开始绘制）
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, this.borderRadius)
    ctx.fill()

    // 边框
    ctx.strokeStyle = this._isActive ? this.activeColor : '#ddd'
    ctx.lineWidth = 1
    ctx.stroke()

    // 文字（居中对齐）
    ctx.fillStyle = this._isActive ? '#ffffff' : this.textColor
    ctx.font = `${this.fontSize}px -apple-system, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.text, x + width / 2, y + height / 2)
  }

  hitTest(point: Point): boolean {
    // 使用实际渲染的边界进行交互判断
    const bounds = this.getRenderBounds()
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    )
  }

  onClick(_point: Point): void {
    if (this._onClick) {
      this._onClick()
    }
  }

  onHover(_point: Point): void {
    this._isHovered = true
  }

  onLeave(): void {
    this._isHovered = false
  }
}

export interface TextLabelConfig {
  id: string
  x: number
  y: number
  text: string
  layer?: number
  regionId?: string // 所属区域
  color?: string
  fontSize?: number
  align?: CanvasTextAlign
  baseline?: CanvasTextBaseline
  backgroundColor?: string
  padding?: number
}

export class CanvasTextLabel implements UIElement {
  id: string
  layer: number
  regionId?: string
  bounds: Rect
  text: string
  color: string
  fontSize: number
  align: CanvasTextAlign
  baseline: CanvasTextBaseline
  backgroundColor?: string
  padding: number
  
  // 渲染时的实际坐标（用于精确的交互判断）
  private _renderBounds: Rect | null = null

  constructor(config: TextLabelConfig) {
    this.id = config.id
    this.layer = config.layer || 50
    this.regionId = config.regionId
    this.text = config.text
    this.color = config.color || '#333333'
    this.fontSize = config.fontSize || 14
    this.align = config.align || 'left'
    this.baseline = config.baseline || 'top'
    this.backgroundColor = config.backgroundColor
    this.padding = config.padding || 4

    // 计算边界（简化版，实际需要测量文本）
    this.bounds = {
      x: config.x,
      y: config.y,
      width: this.text.length * this.fontSize * 0.6 + this.padding * 2,
      height: this.fontSize + this.padding * 2
    }
  }

  setText(text: string): void {
    this.text = text
    this.bounds.width = text.length * this.fontSize * 0.6 + this.padding * 2
    this._renderBounds = null // 清除缓存
  }
  
  /**
   * 更新控件位置（用于布局变化时）
   */
  updatePosition(x: number, y: number): void {
    this.bounds.x = x
    this.bounds.y = y
    this._renderBounds = null // 清除缓存，下次渲染时更新
  }
  
  /**
   * 获取实际渲染的边界（用于精确的交互判断）
   */
  getRenderBounds(): Rect {
    return this._renderBounds || this.bounds
  }

  render(ctx: CanvasRenderingContext2D): void {
    const { x, y, width, height } = this.bounds // 左上角坐标
    
    // 缓存渲染边界用于交互判断
    this._renderBounds = { x, y, width, height }

    // 背景（可选）- 从左上角开始绘制，包含 padding
    if (this.backgroundColor) {
      ctx.fillStyle = this.backgroundColor
      ctx.fillRect(x, y, width, height)
    }

    // 文字 - 基于左上角坐标，考虑 padding 和对齐方式
    ctx.fillStyle = this.color
    ctx.font = `${this.fontSize}px -apple-system, sans-serif`
    
    // 计算文字绘制位置（基于左上角 + padding）
    let textX = x + this.padding
    let textY = y + this.padding
    
    // 根据对齐方式调整 x 坐标
    if (this.align === 'center') {
      textX = x + width / 2
    } else if (this.align === 'right') {
      textX = x + width - this.padding
    }
    
    // 根据基线调整 y 坐标
    if (this.baseline === 'middle') {
      textY = y + height / 2
    } else if (this.baseline === 'bottom') {
      textY = y + height - this.padding
    }
    
    ctx.textAlign = this.align
    ctx.textBaseline = this.baseline
    ctx.fillText(this.text, textX, textY)
  }

  hitTest(point: Point): boolean {
    // 文本标签默认不响应点击，但如果需要可以启用
    // 使用实际渲染的边界进行交互判断
    const bounds = this.getRenderBounds()
    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    )
    // return false // 如果不需要交互，取消注释这行并删除上面的代码
  }
}

export class CanvasUIManager {
  private elements: Map<string, UIElement> = new Map()
  private hoveredElement: UIElement | null = null
  private needsRedraw: boolean = true

  add(element: UIElement): void {
    this.elements.set(element.id, element)
    this.needsRedraw = true
  }

  remove(id: string): void {
    this.elements.delete(id)
    this.needsRedraw = true
  }

  get(id: string): UIElement | undefined {
    return this.elements.get(id)
  }

  clear(): void {
    this.elements.clear()
    this.hoveredElement = null
    this.needsRedraw = true
  }

  /**
   * 获取指定区域内的所有元素
   */
  getElementsInRegion(regionId: string): UIElement[] {
    return Array.from(this.elements.values()).filter(el => el.regionId === regionId)
  }

  /**
   * 渲染所有元素或指定区域的元素
   */
  render(ctx: CanvasRenderingContext2D, regionId?: string): void {
    // 按层级排序
    let elements = Array.from(this.elements.values())
    
    if (regionId) {
      elements = elements.filter(el => el.regionId === regionId)
    }
    
    const sorted = elements.sort((a, b) => a.layer - b.layer)
    
    // 调试日志
    if (sorted.length > 0 && Math.random() < 0.01) { // 每100帧打印一次
      console.log(`Rendering ${sorted.length} UI elements`)
    }

    for (const element of sorted) {
      element.render(ctx)
    }

    this.needsRedraw = false
  }

  handleMouseMove(point: Point): boolean {
    // 从高层级到低层级检测
    const sorted = Array.from(this.elements.values()).sort((a, b) => b.layer - a.layer)

    let foundHovered: UIElement | null = null

    for (const element of sorted) {
      if (element.hitTest(point)) {
        foundHovered = element
        break
      }
    }

    // 处理 hover 状态变化
    if (foundHovered !== this.hoveredElement) {
      if (this.hoveredElement && this.hoveredElement.onLeave) {
        this.hoveredElement.onLeave()
      }

      if (foundHovered && foundHovered.onHover) {
        foundHovered.onHover(point)
      }

      this.hoveredElement = foundHovered
      this.needsRedraw = true
      return true
    }

    return false
  }

  handleClick(point: Point): boolean {
    // 从高层级到低层级检测
    const sorted = Array.from(this.elements.values()).sort((a, b) => b.layer - a.layer)

    for (const element of sorted) {
      if (element.hitTest(point) && element.onClick) {
        element.onClick(point)
        this.needsRedraw = true
        return true // 阻止事件继续传播
      }
    }

    return false
  }

  needsRender(): boolean {
    return this.needsRedraw
  }

  markDirty(): void {
    this.needsRedraw = true
  }
}
