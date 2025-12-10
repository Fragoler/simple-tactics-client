import { useGameStore } from '@/stores/gameStore'
import { useActionStore } from '@/stores/actionStore'
import { state, usePixiGame } from './usePixiGame'
import { useActionSystem } from './useActionSystem'
import { ActionDefinition, HighlightLayer } from '@/types/action'
import { Position } from '@/types/unit'


export function useActionHighlight() {

  function renderActionHighlights(unitId: number) {
    const gameStore = useGameStore()
    const actionStore = useActionStore()
    const actionSystem = useActionSystem()
    const pixi = usePixiGame()

    pixi.clearHighlights()

    const unit = gameStore.units.find(u => u.unitId === unitId)
    if (!unit) return

    const scheduled = actionStore.getUnitScheduledAction(unitId)
    if (!scheduled) return

    const action = actionStore.getActionById(scheduled.actionId)
    if (!action || !state.highlightLayer.value) return

    const confirmed_ = scheduled.confirmed

    const layers = getHighlightLayers(action, confirmed_)
    for (const layer of layers) {
      let basePos: Position
      if (layer.relative === 'Executor')
        basePos = unit.coords
      else
      {
        // Relative to target
        if (scheduled.target && action.targetType === 'Cell' && scheduled.target)
          basePos = scheduled.target
        else
          continue
      }

      const positions = actionSystem.getPositionsByPattern(basePos, layer.pattern, layer.range, action.targetFilter)
      pixi.drawHighlights(positions, layer.type, layer.relative === 'Target')
    }
  }

  function highlightForTarget(unitId: number)
  {
    const gameStore = useGameStore()
    const actionStore = useActionStore()
    const actionSystem = useActionSystem()
    const pixi = usePixiGame()

    pixi.clearTargetHighlights()

    const unit = gameStore.units.find(u => u.unitId === unitId)
    if (!unit) return

    const scheduled = actionStore.getUnitScheduledAction(unitId)
    if (!scheduled) return

    const action = actionStore.getActionById(scheduled.actionId)
    if (!action || !state.highlightLayer.value) return

    const confirmed_ = scheduled.confirmed

    const layers = getHighlightLayers(action, confirmed_)
    for (const layer of layers) {
      if (layer.relative !== 'Target')
        continue

      if (!scheduled.target || action.targetType !== 'Cell' || !scheduled.target)
        continue

      const positions = actionSystem.getPositionsByPattern(scheduled.target, layer.pattern, layer.range, action.targetFilter)
      pixi.drawHighlights(positions, layer.type, true)
    }
  }

  function clearActionHighlights() {
    const pixi = usePixiGame()
    pixi.clearHighlights()
  }

  
  function getHighlightLayers(
    action: ActionDefinition,
    confirmed: boolean
  ): HighlightLayer[] {
    return action.highlightLayers.filter(layer => {
      if (layer.visibility === 'Always') return true
      return confirmed == (layer.visibility == 'Confirmed')
    })
  }

  return {
    renderActionHighlights,
    highlightForTarget,
    clearActionHighlights
  }
}
