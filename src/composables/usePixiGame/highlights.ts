// highlights.ts
import { Graphics } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { state } from './index'
import { GameColors } from './colors'
import { UnitParams, MoveRangeHighlightsParams, CellSize } from './constants'


const highlightedUnits = new Map<number, Graphics>()
const moveRangeHighlights = new Array<Graphics>()

export function highlightUnit(unitId: number) {  
  const container = state.unitContainers.value.get(unitId)
  if (!container || container.destroyed) {
    console.error("Container is invalid")
    return
  }

  
  // TODO: Make it lesser hardcodded
  const glow = new Graphics()
  
  const baseRadius = UnitParams.radius * 0.2
  const glowLayers = 10
  
  for (let i = glowLayers; i > 0; i--) {
    const radius = baseRadius * (1 + i * 0.7)
    const alpha = 0.1 / Math.sqrt(i)
    
    glow
      .circle(0, 0, radius)
      .fill({ color: GameColors.selected, alpha: alpha })
  }
  
  glow.x = container.x
  glow.y = container.y
  
  if (state.highlightLayer.value) {
    state.highlightLayer.value.addChild(glow)
    highlightedUnits.set(unitId, glow)
  }
}

export function unhighlightUnit(unitId: number) {
  const highlight = highlightedUnits.get(unitId)
  if (highlight) {
    highlight.removeFromParent()
    highlight.destroy()
    highlightedUnits.delete(unitId)
  }
}

export function clearHighlights() {
  highlightedUnits.forEach((_, key) => {
    unhighlightUnit(key)
  });
  
  hideMovementRange()

  // Debug assert warn
  if (state.highlightLayer.value?.children &&
      state.highlightLayer.value?.children.length > 0)
    console.warn("highlight layer is not empty after cleaning")
}

export function showMovementRange(centerX: number, centerY: number, range: number) {
  const gameStore = useGameStore()
  if (!gameStore.map || !state.isLayersInitialized) return

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      const distance = Math.abs(dx) + Math.abs(dy)
      if (distance > 0 && distance <= range) {
        const x = centerX + dx
        const y = centerY + dy

        if (x >= 0 && x < gameStore.map.width && y >= 0 && y < gameStore.map.height) {
          const highlight = new Graphics()

          highlight
            .rect((x + 0.5 - 0.125) * CellSize, (y +  0.5 - 0.125) * CellSize, CellSize * 0.25, CellSize * 0.25)
            .fill({ color: GameColors.highlight, alpha: 0.3 })

          moveRangeHighlights.push(highlight)
          state.highlightLayer.value!.addChild(highlight)
        }
      }
    }
  }
}

function hideMovementRange()
{
  let graph : Graphics | undefined
  while (graph = moveRangeHighlights.pop()) {
    graph.removeFromParent()
    graph.destroy()
  }
};
