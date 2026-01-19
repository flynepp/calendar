// Demo script for Canvas Calendar Engine
// This shows how to use the calendar engine programmatically

console.log('Canvas Calendar Engine Demo');
console.log('===========================\n');

// Wait for page to load
document.addEventListener('DOMContentLoaded', () => {
  console.log('1. Calendar engine is initialized automatically');
  console.log('2. Sample events are loaded');
  console.log('3. Try these interactions:');
  console.log('   - Hover over events to see highlight effect');
  console.log('   - Click events to select them');
  console.log('   - Double-click on empty space to create new events');
  console.log('   - Press Delete to remove selected events');
  console.log('   - Click view buttons to switch between Day/Week views');
  console.log('\n4. Debug tools available in console:');
  console.log('   - window.calendarEngine: Main calendar engine instance');
  console.log('   - window.appState: Current application state');
  console.log('   - window.createEventAtPosition(x, y): Create event at position');
  
  // Add some helpful keyboard shortcuts info
  setTimeout(() => {
    console.log('\n\nKeyboard Shortcuts:');
    console.log('  Delete/Backspace: Delete selected event');
    console.log('  Escape: Clear selection');
    console.log('  Double-click: Create new event');
  }, 1000);
});

// Export demo functions
window.demoCalendar = {
  addRandomEvent: () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const hour = Math.floor(Math.random() * 10) + 8; // 8am-6pm
    
    const newEvent = {
      id: `demo-${Date.now()}`,
      startTime: today.getTime() + hour * 60 * 60 * 1000,
      endTime: today.getTime() + (hour + 1) * 60 * 60 * 1000,
      metadata: {
        title: 'Demo Event',
        color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
        tags: ['demo']
      }
    };
    
    window.appState.events.push(newEvent);
    window.calendarEngine.render(window.appState.events);
    
    console.log(`Added demo event at ${hour}:00`);
    return newEvent;
  },
  
  clearAllEvents: () => {
    window.appState.events = [];
    window.calendarEngine.render(window.appState.events);
    console.log('Cleared all events');
  },
  
  getEventCount: () => {
    return window.appState.events.length;
  }
};