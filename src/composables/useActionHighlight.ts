import { Graphics } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { useActionStore } from '@/stores/actionStore'
import { state } from './usePixiGame'
import { getCSSColor, ColorVars } from '@/assets/colors'
import { CellSize } from './usePixiGame/constants'
import type { HighlightType, HighlightLayer } from '@/types/action'
import type { Position } from '@/types/unit'
import { useActionSystem } from './useActionSystem'


interface ColorConfig {
  color: number
  alpha: number
}

export const ActionHighlightColors: Record<HighlightType, ColorConfig> = {
  Selection: { color: getCSSColor(ColorVars.action.selection), alpha: 0.3 },
  Movement:  { color: getCSSColor(ColorVars.action.movement),  alpha: 0.25 },
  Damage:    { color: getCSSColor(ColorVars.action.damage),    alpha: 0.4 },
  Heal:      { color: getCSSColor(ColorVars.action.heal),      alpha: 0.35 },
  Buff:      { color: getCSSColor(ColorVars.action.buff),      alpha: 0.3 },
  Debuff:    { color: getCSSColor(ColorVars.action.debuff),    alpha: 0.35 },
} as const



const actionHighlights = new Map<string, Graphics>()

export function useActionHighlight() {
  const gameStore = useGameStore()
  const actionStore = useActionStore()
  const { getHighlightLayersForState, getPositionsByPattern } = useActionSystem()

  function showActionHighlights(unitId: number) {
    clearActionHighlights()

    const unit = gameStore.units.find(u => u.unitId === unitId)
    if (!unit) return

    const scheduled = actionStore.getUnitAction(unitId)
    if (!scheduled) return

    const action = actionStore.getActionById(scheduled.actionId)
    if (!action || !state.highlightLayer.value) return

    const state_ = scheduled.state
    const target = scheduled.target?.cell

    const layers = getHighlightLayersForState(action, state_)

    for (const layer of layers) {
      const basePos = layer.relativeTo === 'Executor' 
        ? unit.coords 
        : target || unit.coords

      const positions = getPositionsByPattern(basePos, layer.pattern, layer.range, action.targetFilter)
      
      drawHighlightLayer(positions, layer)
    }
  }

  function clearActionHighlights() {
    for (const [, highlight] of actionHighlights) {
      try {
        highlight.removeFromParent()
        highlight.destroy()
      } catch {
        // ignored
      }
    }
    actionHighlights.clear()
  }

  function drawHighlightLayer(positions: Position[], layer: HighlightLayer) {
    if (!state.highlightLayer.value) return

    const colorConfig = ActionHighlightColors[layer.type as keyof typeof ActionHighlightColors]
    if (!colorConfig) return

    for (const pos of positions) {
      const highlight = new Graphics()

      highlight
        .rect(
          (pos.x + 0.375) * CellSize,
          (pos.y + 0.375) * CellSize,
          CellSize * 0.25,
          CellSize * 0.25
        )
        .fill({
          color: colorConfig.color,
          alpha: colorConfig.alpha
        })

      state.highlightLayer.value.addChild(highlight)
      actionHighlights.set(`${pos.x}-${pos.y}-${layer.type}`, highlight)
    }
  }

  return {
    showActionHighlights,
    clearActionHighlights
  }
}
