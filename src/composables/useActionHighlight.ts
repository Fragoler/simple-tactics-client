import { useGameStore } from '@/stores/gameStore'
import { useActionStore } from '@/stores/actionStore'
import { state, usePixiGame } from './usePixiGame'
import { useActionSystem } from './useActionSystem'
import { ActionDefinition, HighlightLayer } from '@/types/action'
import { Position } from '@/types/unit'


export function useActionHighlight() {

  function showActionHighlights(unitId: number) {
    const gameStore = useGameStore()
    const actionStore = useActionStore()
    const actionSystem = useActionSystem()
    const pixi = usePixiGame()

    clearActionHighlights()

    const unit = gameStore.units.find(u => u.unitId === unitId)
    if (!unit) return

    const scheduled = actionStore.getUnitAction(unitId)
    if (!scheduled) return

    const action = actionStore.getActionById(scheduled.actionId)
    if (!action || !state.highlightLayer.value) return

    const confirmed_ = scheduled.confirmed

    const layers = getHighlightLayers(action, confirmed_)
    for (const layer of layers) {
      console.log("LAYER", layer)
      let basePos: Position
      if (layer.relative === 'Executor')
        basePos = unit.coords
      else
      {
        // Relative to target
        if (scheduled.target && action.targetType === 'Cell' && scheduled.target.cell)
          basePos = scheduled.target.cell
        else
          continue
      }

      console.log("Here", layer)
      const positions = actionSystem.getPositionsByPattern(basePos, layer.pattern, layer.range, action.targetFilter)
      pixi.drawActionLayer(positions, layer.type)
    }
  }

  function clearActionHighlights() {
    const pixi = usePixiGame()
    pixi.clearActionHighlights()
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
    showActionHighlights,
    clearActionHighlights
  }
}
