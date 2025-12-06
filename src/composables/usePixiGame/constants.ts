import { state } from './index'

export const UnitSizes = {
  get radius() {
    return state.cellSize * 0.4
  },
  get strokeWidth() {
    return Math.max(2, state.cellSize * 0.04)
  },
  get triangleSides() {
    return 3
  },
  get squareSides() {
    return 4
  },
  get circleSides() {
    return 32
  }
}
