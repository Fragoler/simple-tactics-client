import type { Position } from '@/types/unit'
import { CellSize } from './constants'

export function getPolygonPoints(sides: number, radius: number): number[] {
  const points: number[] = []
  for (let i = 0; i < sides; i++) {
    const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius)
  }
  return points
}

export function screenToGrid(screenX: number, screenY: number): Position {
  return {
    x: Math.floor(screenX / CellSize),
    y: Math.floor(screenY / CellSize)
  }
}
