// Canvas utility functions
export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  if (radius > width / 2) radius = width / 2
  if (radius > height / 2) radius = height / 2
  
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

export function drawShadow(
  ctx: CanvasRenderingContext2D,
  options: {
    color?: string
    blur?: number
    offsetX?: number
    offsetY?: number
  } = {}
): void {
  const {
    color = 'rgba(0,0,0,0.2)',
    blur = 6,
    offsetX = 0,
    offsetY = 2
  } = options
  
  ctx.shadowColor = color
  ctx.shadowBlur = blur
  ctx.shadowOffsetX = offsetX
  ctx.shadowOffsetY = offsetY
}

export function clearShadow(ctx: CanvasRenderingContext2D): void {
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}

export function measureTextWidth(
  ctx: CanvasRenderingContext2D,
  text: string
): number {
  return ctx.measureText(text).width
}

export function drawTextWithEllipsis(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number
): void {
  const ellipsis = '...'
  
  if (measureTextWidth(ctx, text) <= maxWidth) {
    ctx.fillText(text, x, y)
    return
  }
  
  let truncatedText = text
  while (
    measureTextWidth(ctx, truncatedText + ellipsis) > maxWidth &&
    truncatedText.length > 1
  ) {
    truncatedText = truncatedText.slice(0, -1)
  }
  
  ctx.fillText(truncatedText + ellipsis, x, y)
}

export function isPointInRect(
  point: { x: number; y: number },
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  )
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2
}