import { Graphics } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { state } from './index'

export function highlightUnit(unitId: number) {
  const container = state.unitContainers.value.get(unitId)
  if (container) {
    container.scale.set(1.2)
  }
}

export function unhighlightUnit(unitId: number) {
  const container = state.unitContainers.value.get(unitId)
  if (container) {
    container.scale.set(1)
  }
}

export function showMovementRange(centerX: number, centerY: number, range: number) {
  const gameStore = useGameStore()
  if (!state.config || !gameStore.map || !state.isFieldInitialized) return

  clearHighlights()
  if (!state.highlightLayer.value) return

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      const distance = Math.abs(dx) + Math.abs(dy)
      if (distance > 0 && distance <= range) {
        const x = centerX + dx
        const y = centerY + dy

        if (x >= 0 && x < gameStore.map.width && y >= 0 && y < gameStore.map.height) {
          const highlight = new Graphics()

          highlight
            .rect(x * state.config.cellSize, y * state.config.cellSize, state.config.cellSize, state.config.cellSize)
            .fill({ color: state.config.colors.highlight, alpha: 0.3 })

          state.highlightLayer.value.addChild(highlight)
        }
      }
    }
  }
}

export function clearHighlights() {
  state.highlightLayer.value?.removeChildren()
}
