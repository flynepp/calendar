# Canvas Calendar Engine

A fully controllable calendar engine using Canvas, built according to the specifications in `canvas日历.md`.

## Features Implemented

### Phase 1: Core Rendering ✅
1. **Canvas Initialization**
   - Responsive canvas sizing
   - High DPI display support (devicePixelRatio)
   - RequestAnimationFrame render loop

2. **Axis Mapping**
   - Time-based x-axis using d3-scale
   - Linear y-axis for hours (0-24)
   - World ↔ screen coordinate conversion

3. **Layout Engine**
   - Event positioning based on start/end times
   - Minimum event height enforcement
   - Basic event overlap handling

4. **Basic Rendering**
   - Grid and hour labels
   - Event blocks with rounded corners and shadows
   - Text truncation with ellipsis
   - View switching buttons

### Phase 2: Interaction & State (Partial) ✅
5. **Basic Interaction**
   - Mouse hover detection with visual feedback
   - Event click selection
   - Double-click to create new events

6. **Event CRUD**
   - Create: Double-click on empty space
   - Delete: Select event + Delete/Backspace key
   - Read: Click events to select

7. **State Management**
   - App state with current view, events, selection
   - Keyboard shortcuts (Delete, Escape)

## Getting Started

### Installation
```bash
npm install
npm run dev
```

### Development
```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build
```

## Project Structure

```
├── src/
│   ├── main.ts              # Application entry point
│   ├── types/index.ts       # TypeScript type definitions
│   ├── core/CalendarEngine.ts # Main calendar engine
│   ├── data/sampleEvents.ts # Sample event data
│   └── utils/canvasUtils.ts # Canvas utility functions
├── index.html              # HTML template
├── package.json            # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Build configuration
```

## Usage

### Basic Usage
1. Open `http://localhost:3000` in your browser
2. Click view buttons to switch between Day/Week/Month/Year views
3. Hover over events to see highlight effect
4. Click events to select them
5. Double-click on empty space to create new events
6. Press Delete to remove selected events

### Keyboard Shortcuts
- **Delete/Backspace**: Delete selected event
- **Escape**: Clear selection
- **Double-click**: Create new event

## Technical Details

### Canvas Rendering
- Uses 2D Canvas API for all rendering
- High DPI support via `devicePixelRatio`
- Custom rounded rectangle function
- Shadow effects for depth

### Data Flow
1. Events (with timestamps) → Layout Engine
2. Layout Engine → Rects (positioned events)
3. Rects → Canvas Renderer
4. User Interaction → State Updates → Re-render

### View System
Currently supports:
- **Day View**: Hour grid with events
- **Week View**: Different sample data
- **Month/Year Views**: Placeholder (to be implemented)

## Next Steps

Based on the development plan, here are the next features to implement:

### Phase 2 Completion
1. **Drag & Drop**: Move and resize events
2. **Event Details**: Show event information on click
3. **Conflict Detection**: Warn about overlapping events

### Phase 3: Optimization & Enhancement
1. **Performance**: Dirty rectangle rendering, offscreen canvas caching
2. **Animations**: Smooth transitions, easing functions
3. **Accessibility**: Keyboard navigation, screen reader support
4. **Responsive Design**: Mobile touch support

## Browser Support

- Modern browsers with Canvas 2D support
- TypeScript compilation to ES2020
- No polyfills required for core functionality

## License

MIT