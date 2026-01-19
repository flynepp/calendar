import { Event } from '../types'

export function createSampleEvents(): Event[] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const events: Event[] = [
    {
      id: '1',
      startTime: today.getTime() + 9 * 60 * 60 * 1000, // 9:00
      endTime: today.getTime() + 10 * 60 * 60 * 1000, // 10:00
      metadata: {
        title: 'Morning Standup',
        color: '#007AFF',
        tags: ['meeting', 'team']
      }
    },
    {
      id: '2',
      startTime: today.getTime() + 10 * 60 * 60 * 1000 + 30 * 60 * 1000, // 10:30
      endTime: today.getTime() + 11 * 60 * 60 * 1000 + 30 * 60 * 1000, // 11:30
      metadata: {
        title: 'Product Review',
        color: '#34C759',
        tags: ['product', 'review']
      }
    },
    {
      id: '3',
      startTime: today.getTime() + 13 * 60 * 60 * 1000, // 13:00
      endTime: today.getTime() + 14 * 60 * 60 * 1000, // 14:00
      metadata: {
        title: 'Lunch Break',
        color: '#FF9500',
        tags: ['break']
      }
    },
    {
      id: '4',
      startTime: today.getTime() + 14 * 60 * 60 * 1000 + 30 * 60 * 1000, // 14:30
      endTime: today.getTime() + 16 * 60 * 60 * 1000, // 16:00
      metadata: {
        title: 'Client Meeting',
        color: '#AF52DE',
        tags: ['client', 'meeting']
      }
    },
    {
      id: '5',
      startTime: today.getTime() + 16 * 60 * 60 * 1000 + 30 * 60 * 1000, // 16:30
      endTime: today.getTime() + 17 * 60 * 60 * 1000, // 17:00
      metadata: {
        title: 'Code Review',
        color: '#FF3B30',
        tags: ['development', 'review']
      }
    },
    {
      id: '6',
      startTime: today.getTime() + 8 * 60 * 60 * 1000, // 8:00
      endTime: today.getTime() + 8 * 60 * 60 * 1000 + 45 * 60 * 1000, // 8:45
      metadata: {
        title: 'Quick Sync',
        color: '#5AC8FA',
        tags: ['sync']
      }
    },
    {
      id: '7',
      startTime: today.getTime() + 17 * 60 * 60 * 1000 + 30 * 60 * 1000, // 17:30
      endTime: today.getTime() + 18 * 60 * 60 * 1000, // 18:00
      metadata: {
        title: 'Planning Session',
        color: '#FFCC00',
        tags: ['planning']
      }
    }
  ]
  
  return events
}

export function createWeekEvents(): Event[] {
  const events: Event[] = []
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - now.getDay() + 1) // Start from Monday
  
  // Create events for each day of the week
  for (let day = 0; day < 5; day++) { // Monday to Friday
    const dayDate = new Date(monday)
    dayDate.setDate(monday.getDate() + day)
    
    // Add 2-3 events per day
    const eventCount = 2 + Math.floor(Math.random() * 2)
    
    for (let i = 0; i < eventCount; i++) {
      const hour = 9 + Math.floor(Math.random() * 8) // 9-17
      const duration = 0.5 + Math.random() * 2 // 0.5-2.5 hours
      
      events.push({
        id: `week-${day}-${i}`,
        startTime: dayDate.getTime() + hour * 60 * 60 * 1000,
        endTime: dayDate.getTime() + (hour + duration) * 60 * 60 * 1000,
        metadata: {
          title: `Day ${day + 1} Event ${i + 1}`,
          color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
          tags: ['week']
        }
      })
    }
  }
  
  return events
}