import { Event } from '../types'

// 生成带用户信息的模拟事件
export function generateMockEvents(count: number = 20): Event[] {
  const events: Event[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  // 用户列表
  const users = [
    { id: 'user1', name: '张三' },
    { id: 'user2', name: '李四' },
    { id: 'user3', name: '王五' },
    { id: 'user4', name: '赵六' },
    { id: 'user5', name: '钱七' },
  ]
  
  // 事件颜色
  const colors = [
    '#007AFF', // 蓝色
    '#34C759', // 绿色
    '#FF9500', // 橙色
    '#AF52DE', // 紫色
    '#FF3B30', // 红色
    '#5AC8FA', // 浅蓝
    '#FFCC00', // 黄色
    '#5856D6', // 深紫
  ]
  
  // 事件标题
  const titles = [
    '团队会议',
    '产品评审',
    '代码审查',
    '客户拜访',
    '需求讨论',
    '技术分享',
    '项目规划',
    '进度同步',
    '设计评审',
    '测试会议',
  ]
  
  // 标签
  const tags = [
    ['会议', '团队'],
    ['产品', '评审'],
    ['开发', '代码'],
    ['客户', '商务'],
    ['需求', '讨论'],
    ['技术', '分享'],
    ['项目', '规划'],
    ['进度', '同步'],
  ]
  
  for (let i = 0; i < count; i++) {
    // 随机选择用户
    const userIndex = Math.floor(Math.random() * users.length)
    const userId = users[userIndex].id
    
    // 随机时间（8:00-20:00之间）
    const startHour = 8 + Math.floor(Math.random() * 12)
    const startMinute = Math.floor(Math.random() * 4) * 15 // 0, 15, 30, 45
    const duration = 0.5 + Math.random() * 3 // 0.5-3.5小时
    
    const startTime = today.getTime() + 
      (startHour * 60 + startMinute) * 60 * 1000
    const endTime = startTime + duration * 60 * 60 * 1000
    
    // 随机标题和标签
    const titleIndex = Math.floor(Math.random() * titles.length)
    const tagIndex = Math.floor(Math.random() * tags.length)
    
    // 随机颜色（但用户有固定颜色倾向）
    const userColorIndex = userIndex % colors.length
    const color = colors[userColorIndex]
    
    events.push({
      id: `event-${i + 1}`,
      startTime,
      endTime,
      userId,
      layer: Math.floor(Math.random() * 3), // 随机层数 0-2
      crossDay: endTime - startTime > 24 * 60 * 60 * 1000, // 是否跨天
      metadata: {
        title: titles[titleIndex],
        color,
        tags: tags[tagIndex],
        description: `这是${users[userIndex].name}的${titles[titleIndex]}`, 
        userColor: color,
      }
    })
  }
  
  // 添加一些跨天事件
  for (let i = 0; i < 3; i++) {
    const userIndex = Math.floor(Math.random() * users.length)
    const userId = users[userIndex].id
    
    events.push({
      id: `cross-day-${i + 1}`,
      startTime: today.getTime() + 20 * 60 * 60 * 1000, // 20:00
      endTime: today.getTime() + 28 * 60 * 60 * 1000, // 次日4:00
      userId,
      layer: 0,
      crossDay: true,
      metadata: {
        title: '跨天任务',
        color: '#8E8E93',
        tags: ['跨天', '任务'],
        description: '这是一个跨天事件',
        userColor: colors[userIndex % colors.length],
      }
    })
  }
  
  return events
}

// 生成周视图数据（跨多天）
export function generateWeekEvents(): Event[] {
  const events: Event[] = []
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - now.getDay() + 1) // 本周一
  
  const users = [
    { id: 'user1', name: '张三' },
    { id: 'user2', name: '李四' },
    { id: 'user3', name: '王五' },
    { id: 'user4', name: '赵六' },
  ]
  
  const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE']
  
  // 为每个用户每天创建1-2个事件
  for (let day = 0; day < 5; day++) { // 周一到周五
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + day)
    
    for (let userIndex = 0; userIndex < users.length; userIndex++) {
      const userId = users[userIndex].id
      const eventCount = 1 + Math.floor(Math.random() * 2)
      
      for (let i = 0; i < eventCount; i++) {
        const startHour = 9 + Math.floor(Math.random() * 8)
        const duration = 0.5 + Math.random() * 2
        
        events.push({
          id: `week-${day}-${userIndex}-${i}`,
          startTime: dayDate.getTime() + startHour * 60 * 60 * 1000,
          endTime: dayDate.getTime() + (startHour + duration) * 60 * 60 * 1000,
          userId,
          layer: i,
          metadata: {
            title: `${users[userIndex].name}的会议`,
            color: colors[userIndex],
            tags: ['周会', '工作'],
            userColor: colors[userIndex],
          }
        })
      }
    }
  }
  
  return events
}

// 生成组视图数据（多个用户在同一时间段）
export function generateGroupEvents(): Event[] {
  const events: Event[] = []
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const users = [
    { id: 'user1', name: '张三' },
    { id: 'user2', name: '李四' },
    { id: 'user3', name: '王五' },
    { id: 'user4', name: '赵六' },
    { id: 'user5', name: '钱七' },
  ]
  
  const colors = ['#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FF3B30']
  
  // 共同会议时间段
  const commonSlots = [
    { start: 9, end: 10, title: '晨会' },
    { start: 14, end: 15, title: '项目同步' },
    { start: 16, end: 17, title: '技术讨论' },
  ]
  
  // 添加共同会议
  commonSlots.forEach((slot, index) => {
    users.forEach((user, userIndex) => {
      events.push({
        id: `group-common-${index}-${user.id}`,
        startTime: today.getTime() + slot.start * 60 * 60 * 1000,
        endTime: today.getTime() + slot.end * 60 * 60 * 1000,
        userId: user.id,
        layer: 0,
        metadata: {
          title: slot.title,
          color: colors[userIndex],
          tags: ['团队', '会议'],
          userColor: colors[userIndex],
        }
      })
    })
  })
  
  // 添加个人事件
  users.forEach((user, userIndex) => {
    const personalSlots = [
      { start: 10, duration: 1.5, title: '个人工作' },
      { start: 13, duration: 1, title: '午休' },
      { start: 15.5, duration: 2, title: '专注时间' },
    ]
    
    personalSlots.forEach((slot, slotIndex) => {
      events.push({
        id: `group-personal-${user.id}-${slotIndex}`,
        startTime: today.getTime() + slot.start * 60 * 60 * 1000,
        endTime: today.getTime() + (slot.start + slot.duration) * 60 * 60 * 1000,
        userId: user.id,
        layer: 1,
        metadata: {
          title: slot.title,
          color: `${colors[userIndex]}80`, // 半透明
          tags: ['个人'],
          userColor: colors[userIndex],
        }
      })
    })
  })
  
  return events
}

export default {
  generateMockEvents,
  generateWeekEvents,
  generateGroupEvents,
}