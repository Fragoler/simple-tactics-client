import { state } from './index'

export const UnitParams = {
  get radius() {
    return state.cellSize * 0.4
  },
  get strokeWidth() {
    return Math.max(2, state.cellSize * 0.04)
  },
  triangleSides: 3,
  squareSides: 4,
  circleSides: 32,

  moveDuration: 300,
  fillAlpha: 0.8,
} as const

