import type { Position } from '@/types/unit'
import { state } from './index'

export function getPolygonPoints(sides: number, radius: number): number[] {
  const points: number[] = []
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  return points
}

export function screenToGrid(screenX: number, screenY: number): Position {
  if (!state.config) return { x: 0, y: 0 }

  return {
    x: Math.floor(screenX / state.config.cellSize),
    y: Math.floor(screenY / state.config.cellSize)
  }
}
