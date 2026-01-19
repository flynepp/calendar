/**
 * Canvas 布局管理系统
 * 支持画面分区和控件尺寸控制
 */

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export type SizeMode = 'original' | 'scale' // 原始大小 | 等比缩放

export interface Region {
  id: string
  type: 'fixed' | 'flex' // 固定大小 | 弹性大小
  sizeMode: SizeMode
  
  // 对于 fixed 类型
  fixedHeight?: number // 固定高度
  fixedWidth?: number  // 固定宽度
  
  // 对于 flex 类型
  flexGrow?: number    // 弹性增长系数
  
  // 位置和实际计算出的尺寸
  bounds: Rect
  
  // 内边距
  padding?: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

export interface LayoutConfig {
  direction: 'horizontal' | 'vertical' // 布局方向
  regions: Region[]
  gap?: number // 区域间隙
}

export class LayoutManager {
  private canvas: HTMLCanvasElement
  private config: LayoutConfig
  private regions: Map<string, Region> = new Map()
  private baseWidth: number = 1920  // 基准宽度（用于等比缩放）
  // private baseHeight: number = 1080 // 基准高度（用于等比缩放）
  private currentScale: number = 1  // 当前缩放比例

  constructor(canvas: HTMLCanvasElement, config: LayoutConfig) {
    this.canvas = canvas
    this.config = config
    this.calculate()
  }

  /**
   * 计算所有区域的位置和尺寸
   */
  public calculate(): void {
    const dpr = window.devicePixelRatio || 1
    const canvasWidth = this.canvas.width / dpr
    const canvasHeight = this.canvas.height / dpr
    
    // 计算缩放比例（基于宽度）
    this.currentScale = canvasWidth / this.baseWidth
    
    this.regions.clear()
    
    if (this.config.direction === 'vertical') {
      this.calculateVertical(canvasWidth, canvasHeight)
    } else {
      this.calculateHorizontal(canvasWidth, canvasHeight)
    }
  }

  /**
   * 垂直方向布局
   */
  private calculateVertical(totalWidth: number, totalHeight: number): void {
    const gap = this.config.gap || 0
    let currentY = 0
    
    // 第一遍：计算固定大小的区域
    let fixedTotalHeight = 0
    let flexTotalGrow = 0
    
    for (const region of this.config.regions) {
      if (region.type === 'fixed') {
        fixedTotalHeight += region.fixedHeight || 0
      } else {
        flexTotalGrow += region.flexGrow || 1
      }
    }
    
    // 计算间隙总高度
    const totalGap = gap * (this.config.regions.length - 1)
    fixedTotalHeight += totalGap
    
    // 剩余可分配高度
    const remainingHeight = totalHeight - fixedTotalHeight
    
    // 第二遍：分配位置和尺寸
    for (const region of this.config.regions) {
      let height: number
      
      if (region.type === 'fixed') {
        height = region.fixedHeight || 0
      } else {
        const grow = region.flexGrow || 1
        height = (remainingHeight / flexTotalGrow) * grow
      }
      
      // 应用内边距
      const padding = region.padding || { top: 0, right: 0, bottom: 0, left: 0 }
      
      const bounds: Rect = {
        x: padding.left,
        y: currentY + padding.top,
        width: totalWidth - padding.left - padding.right,
        height: height - padding.top - padding.bottom
      }
      
      const regionWithBounds: Region = {
        ...region,
        bounds
      }
      
      this.regions.set(region.id, regionWithBounds)
      currentY += height + gap
    }
  }

  /**
   * 水平方向布局（暂未实现，需要时可扩展）
   */
  private calculateHorizontal(totalWidth: number, totalHeight: number): void {
    const gap = this.config.gap || 0
    let currentX = 0
    
    let fixedTotalWidth = 0
    let flexTotalGrow = 0
    
    for (const region of this.config.regions) {
      if (region.type === 'fixed') {
        fixedTotalWidth += region.fixedWidth || 0
      } else {
        flexTotalGrow += region.flexGrow || 1
      }
    }
    
    const totalGap = gap * (this.config.regions.length - 1)
    fixedTotalWidth += totalGap
    const remainingWidth = totalWidth - fixedTotalWidth
    
    for (const region of this.config.regions) {
      let width: number
      
      if (region.type === 'fixed') {
        width = region.fixedWidth || 0
      } else {
        const grow = region.flexGrow || 1
        width = (remainingWidth / flexTotalGrow) * grow
      }
      
      const padding = region.padding || { top: 0, right: 0, bottom: 0, left: 0 }
      
      const bounds: Rect = {
        x: currentX + padding.left,
        y: padding.top,
        width: width - padding.left - padding.right,
        height: totalHeight - padding.top - padding.bottom
      }
      
      const regionWithBounds: Region = {
        ...region,
        bounds
      }
      
      this.regions.set(region.id, regionWithBounds)
      currentX += width + gap
    }
  }

  /**
   * 获取指定区域
   */
  public getRegion(id: string): Region | undefined {
    return this.regions.get(id)
  }

  /**
   * 获取所有区域
   */
  public getAllRegions(): Region[] {
    return Array.from(this.regions.values())
  }

  /**
   * 将全局坐标转换为区域内坐标
   */
  public globalToRegion(regionId: string, globalX: number, globalY: number): { x: number; y: number } | null {
    const region = this.regions.get(regionId)
    if (!region) return null
    
    return {
      x: globalX - region.bounds.x,
      y: globalY - region.bounds.y
    }
  }

  /**
   * 将区域内坐标转换为全局坐标
   */
  public regionToGlobal(regionId: string, localX: number, localY: number): { x: number; y: number } | null {
    const region = this.regions.get(regionId)
    if (!region) return null
    
    return {
      x: localX + region.bounds.x,
      y: localY + region.bounds.y
    }
  }

  /**
   * 判断点是否在指定区域内
   */
  public isPointInRegion(regionId: string, x: number, y: number): boolean {
    const region = this.regions.get(regionId)
    if (!region) return false
    
    const { bounds } = region
    return (
      x >= bounds.x &&
      x <= bounds.x + bounds.width &&
      y >= bounds.y &&
      y <= bounds.y + bounds.height
    )
  }

  /**
   * 根据尺寸模式计算实际尺寸
   * @param region 区域
   * @param originalWidth 原始宽度
   * @param originalHeight 原始高度
   */
  public calculateSize(
    region: Region,
    originalWidth: number,
    originalHeight: number
  ): { width: number; height: number } {
    if (region.sizeMode === 'original') {
      // 原始大小模式：直接使用原始尺寸
      return {
        width: originalWidth,
        height: originalHeight
      }
    } else {
      // 等比缩放模式：根据当前缩放比例调整
      return {
        width: originalWidth * this.currentScale,
        height: originalHeight * this.currentScale
      }
    }
  }

  /**
   * 根据尺寸模式计算字体大小
   */
  public calculateFontSize(region: Region, originalFontSize: number): number {
    if (region.sizeMode === 'original') {
      return originalFontSize
    } else {
      return originalFontSize * this.currentScale
    }
  }

  /**
   * 获取当前缩放比例
   */
  public getScale(): number {
    return this.currentScale
  }

  /**
   * 设置基准尺寸
   */
  public setBaseSize(width: number, _height: number): void {
    this.baseWidth = width
    // this.baseHeight = height // 暂未使用
    this.calculate()
  }

  /**
   * 更新布局配置
   */
  public updateConfig(config: LayoutConfig): void {
    this.config = config
    this.calculate()
  }

  /**
   * 调试：绘制区域边界
   */
  public drawDebugBounds(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    
    for (const region of this.regions.values()) {
      const { bounds } = region
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height)
      
      // 绘制区域 ID
      ctx.fillStyle = 'rgba(255, 0, 0, 0.8)'
      ctx.font = '12px monospace'
      ctx.fillText(
        `${region.id} (${region.sizeMode})`,
        bounds.x + 5,
        bounds.y + 15
      )
    }
    
    ctx.restore()
  }
}
