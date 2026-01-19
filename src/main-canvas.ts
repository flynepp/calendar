import { ConfigCalendar } from './core/ConfigCalendar'
import { createSampleEvents, createWeekEvents } from './data/sampleEvents'
import { Event, CalendarConfig, CalendarView } from './types'
import {
  CanvasUIManager,
  CanvasButton,
  CanvasTextLabel,
  Point
} from './ui/CanvasUI'
import { LayoutManager, LayoutConfig } from './layout/LayoutManager'
import { setGlobalConfig } from './config/configHelper'

export type { CalendarView }

export interface AppState {
  currentView: 'day' | 'week' | 'month' | 'year'  // 与 main.ts 兼容
  currentDate: Date
  events: Event[]
  isDragging: boolean
  selectedEventId: string | null
}

// Load configuration
async function loadConfig(): Promise<CalendarConfig> {
  try {
    const response = await fetch('/views.config.json')
    if (!response.ok) throw new Error('Failed to load config')
    return await response.json()
  } catch (error) {
    console.error('Failed to load config:', error)
    throw error
  }
}

class CalendarApp {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private calendarEngine: ConfigCalendar
  private uiManager: CanvasUIManager
  private layoutManager: LayoutManager
  private appState: AppState
  private currentCalendarView: CalendarView = 'personal-day'
  private animationFrameId: number | null = null
  private debugMode: boolean = false
  private config: CalendarConfig

  constructor(canvas: HTMLCanvasElement, config: CalendarConfig) {
    this.canvas = canvas
    this.config = config
    
    // 设置全局配置供其他模块使用
    setGlobalConfig(config)
    
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context')
    this.ctx = ctx

    this.calendarEngine = new ConfigCalendar(canvas, config)
    this.uiManager = new CanvasUIManager()
    
    // 从配置文件创建布局配置
    const layoutConfig: LayoutConfig = {
      direction: config.layout?.direction || 'vertical',
      gap: config.layout?.gap || 0,
      regions: (config.layout?.regions || []).map(r => ({
        id: r.id,
        type: r.type,
        sizeMode: r.sizeMode,
        fixedWidth: r.fixedWidth,
        fixedHeight: r.fixedHeight,
        flexGrow: r.flexGrow || 1,
        bounds: { x: 0, y: 0, width: 0, height: 0 },
        padding: {
          top: r.padding?.top || 0,
          right: r.padding?.right || 0,
          bottom: r.padding?.bottom || 0,
          left: r.padding?.left || 0
        }
      }))
    }
    
    this.layoutManager = new LayoutManager(canvas, layoutConfig)

    // Initialize app state
    this.appState = {
      currentView: 'day',  // 用于 ConfigCalendar
      currentDate: new Date(),
      events: createSampleEvents(),
      isDragging: false,
      selectedEventId: null
    }

    this.setupUI()
    this.setupEventListeners()
    this.startRenderLoop()
    
    // Debug 键
    document.addEventListener('keydown', (e) => {
      if (e.key === 'd' && e.ctrlKey) {
        e.preventDefault()
        this.debugMode = !this.debugMode
        console.log('Debug mode:', this.debugMode)
        this.uiManager.markDirty()
      }
    })
  }

  private setupUI(): void {
    this.uiManager.clear()
    
    // 获取 header 区域
    const headerRegion = this.layoutManager.getRegion('header')
    if (!headerRegion) {
      console.warn('Header region not found!')
      return
    }
    
    const { bounds } = headerRegion
    console.log('Header bounds:', bounds)
    
    // 从配置获取 UI 设置
    const uiConfig = this.config.ui || {}
    const titleConfig = uiConfig.title || {}
    const buttonConfig = uiConfig.buttons || {}
    const themeColors = this.config.theme?.colors || {}
    
    // 顶部标题
    const titleLabel = new CanvasTextLabel({
      id: 'title',
      x: bounds.x + (titleConfig.offsetX || 10),
      y: bounds.y + (bounds.height / 2) - 10,
      text: titleConfig.text || 'Canvas Calendar',
      fontSize: titleConfig.fontSize || 20,
      color: titleConfig.color || themeColors.textPrimary || '#333',
      layer: 100,
      regionId: 'header'
    })
    this.uiManager.add(titleLabel)

    // 视图切换按钮 - 从配置读取
    const views = buttonConfig.views || [
      { id: 'personal-day' as CalendarView, label: '个人日' },
      { id: 'personal-week' as CalendarView, label: '个人周' },
      { id: 'personal-month' as CalendarView, label: '个人月' },
      { id: 'group-day' as CalendarView, label: '组日' },
      { id: 'group-week' as CalendarView, label: '组周' }
    ]

    const buttonWidth = buttonConfig.width || 90
    const buttonHeight = buttonConfig.height || 32
    const gap = buttonConfig.gap || 8
    const fontSize = buttonConfig.fontSize || 13
    const startX = bounds.x + bounds.width - (views.length * (buttonWidth + gap))
    const buttonY = bounds.y + (bounds.height - buttonHeight) / 2
    
    console.log('Button config:', { buttonWidth, buttonHeight, gap, fontSize, startX, buttonY, viewsCount: views.length })

    views.forEach((view, index) => {
      const buttonX = startX + (buttonWidth + gap) * index
      const button = new CanvasButton({
        id: `view-${view.id}`,
        x: buttonX,
        y: buttonY,
        width: buttonWidth,
        height: buttonHeight,
        text: view.label,
        fontSize: fontSize,
        regionId: 'header',
        layer: 101,
        onClick: () => this.switchView(view.id)
      })

      if (view.id === this.currentCalendarView) {
        button.setActive(true)
      }

      console.log(`Created button "${view.label}" at (${buttonX}, ${buttonY})`)
      this.uiManager.add(button)
    })
    
    // 设置日历引擎的渲染边界
    const calendarRegion = this.layoutManager.getRegion('calendar')
    if (calendarRegion) {
      const { bounds: calBounds } = calendarRegion
      this.calendarEngine.setRenderBounds(
        calBounds.x,
        calBounds.y,
        calBounds.width,
        calBounds.height
      )
    }
  }

  private switchView(view: CalendarView): void {
    this.currentCalendarView = view
    
    // 映射到 main.ts 的视图类型
    const viewMap: Record<CalendarView, 'day' | 'week' | 'month' | 'year'> = {
      'personal-day': 'day',
      'personal-week': 'week',
      'personal-month': 'month',
      'personal-year': 'year',
      'group-day': 'day',
      'group-week': 'week'
    }
    this.appState.currentView = viewMap[view]

    // 更新按钮状态
    const views: CalendarView[] = ['personal-day', 'personal-week', 'personal-month', 'group-day', 'group-week']
    views.forEach(v => {
      const button = this.uiManager.get(`view-${v}`) as CanvasButton
      if (button) {
        button.setActive(v === view)
      }
    })

    // 根据视图切换事件数据
    if (view === 'personal-week' || view === 'group-week') {
      this.appState.events = createWeekEvents()
    } else if (view === 'group-day') {
      // 为组视图添加 userId
      this.appState.events = createSampleEvents().map((event, index) => ({
        ...event,
        userId: `user${(index % 4) + 1}`
      }))
    } else {
      this.appState.events = createSampleEvents()
    }

    // 更新日历引擎
    this.calendarEngine.setView(view)
    this.updateStatus()
    this.uiManager.markDirty()
  }

  private getStatusText(): string {
    const count = this.appState.events.length
    const selected = this.appState.selectedEventId
    return selected
      ? `${count} 个事件 (已选择: ${selected})`
      : `${count} 个事件`
  }

  private updateStatus(): void {
    const label = this.uiManager.get('status') as CanvasTextLabel
    if (label) {
      label.setText(this.getStatusText())
      this.uiManager.markDirty()
    }
  }

  private setupEventListeners(): void {
    // 鼠标移动
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const point: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }

      // 先检查 UI 元素
      const uiHandled = this.uiManager.handleMouseMove(point)

      // 如果 UI 没有处理，转换为 calendar 区域坐标并传递给日历引擎
      if (!uiHandled) {
        const calendarPoint = this.layoutManager.globalToRegion('calendar', point.x, point.y)
        if (calendarPoint) {
          this.calendarEngine.handleMouseMove(calendarPoint.x, calendarPoint.y, this.appState)
        }
      }

      // 更新光标样式
      this.canvas.style.cursor = uiHandled ? 'pointer' : 'default'
    })

    // 鼠标点击
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const point: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }

      // 先检查 UI 元素
      const uiHandled = this.uiManager.handleClick(point)

      // 如果 UI 没有处理，转换为 calendar 区域坐标并传递给日历引擎
      if (!uiHandled) {
        const calendarPoint = this.layoutManager.globalToRegion('calendar', point.x, point.y)
        if (calendarPoint) {
          this.calendarEngine.handleClick(calendarPoint.x, calendarPoint.y, this.appState)
          this.updateStatus()
        }
      }
    })

    // 双击创建事件
    this.canvas.addEventListener('dblclick', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      const y = e.clientY - rect.top

      // 简单的时间映射（实际应该用视图的 scale）
      const height = this.canvas.height / window.devicePixelRatio
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      
      // 假设 y 轴是时间轴，占据 90% 的高度
      const topMargin = height * 0.08
      const bottomMargin = height * 0.1
      const contentHeight = height - topMargin - bottomMargin
      
      if (y > topMargin && y < height - bottomMargin) {
        const hour = Math.floor(((y - topMargin) / contentHeight) * 24)
        const minute = Math.floor((((y - topMargin) / contentHeight) * 24 - hour) * 60)
        
        const newEvent: Event = {
          id: `event-${Date.now()}`,
          startTime: today.getTime() + (hour * 60 + minute) * 60 * 1000,
          endTime: today.getTime() + (hour * 60 + minute + 60) * 60 * 1000,
          userId: this.appState.currentView.includes('group') ? 'user1' : undefined,
          metadata: {
            title: 'New Event',
            color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            tags: ['new']
          }
        }
        
        this.appState.events.push(newEvent)
        this.updateStatus()
        this.uiManager.markDirty()
        
        console.log(`Created event at ${hour}:${minute.toString().padStart(2, '0')}`)
      }
    })

    // 键盘事件
    document.addEventListener('keydown', (e) => {
      // Ctrl+D 切换调试模式
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault()
        this.debugMode = !this.debugMode
        console.log(`Debug mode: ${this.debugMode ? 'ON' : 'OFF'}`)
        return
      }
      
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.appState.selectedEventId) {
        this.appState.events = this.appState.events.filter(
          event => event.id !== this.appState.selectedEventId
        )
        this.appState.selectedEventId = null
        this.updateStatus()
        this.uiManager.markDirty()
        console.log('Deleted selected event')
      }

      if (e.key === 'Escape') {
        this.appState.selectedEventId = null
        this.updateStatus()
      }
    })

    // 窗口大小改变
    window.addEventListener('resize', () => {
      this.calendarEngine.handleResize()
      this.uiManager.clear()
      this.setupUI()
      this.uiManager.markDirty()
    })
  }

  private startRenderLoop(): void {
    const render = () => {
      // 清空整个画布
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      
      // 渲染日历（在 calendar 区域内，已设置 renderBounds）
      this.calendarEngine.render(this.appState.events)

      // 绘制调试边界
      if (this.debugMode) {
        this.layoutManager.drawDebugBounds(this.ctx)
      }

      // 渲染 UI（每帧都渲染）
      this.uiManager.render(this.ctx)

      this.animationFrameId = requestAnimationFrame(render)
    }

    render()
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }
}

// Initialize app
async function initApp() {
  const canvas = document.getElementById('calendar-canvas') as HTMLCanvasElement
  if (!canvas) {
    console.error('Canvas element not found')
    return
  }

  try {
    const config = await loadConfig()
    const app = new CalendarApp(canvas, config)

    // Export for debugging
    ;(window as any).calendarApp = app
    console.log('Calendar app initialized. Access via window.calendarApp')
  } catch (error) {
    console.error('Failed to initialize app:', error)
  }
}

// Start app
initApp()
