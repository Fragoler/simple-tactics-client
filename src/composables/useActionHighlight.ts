import { useGameStore } from '@/stores/gameStore'
import { useActionStore } from '@/stores/actionStore'
import { state, usePixiGame } from './usePixiGame'
import { useActionSystem } from './useActionSystem'
import { ActionDefinition, HighlightLayer } from '@/types/action'


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

    const target = scheduled.target?.cell
    const confirmed_ = scheduled.confirmed

    const layers = getHighlightLayers(action, confirmed_)
    for (const layer of layers) {
      const basePos = layer.relativeTo === 'Executor' 
        ? unit.coords 
        : target || unit.coords

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
