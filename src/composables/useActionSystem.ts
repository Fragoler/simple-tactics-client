import { useGameStore } from '@/stores/gameStore'
import { useActionStore } from '@/stores/actionStore'
import type { ActionDefinition, HighlightLayer, ActionState, HighlightPattern } from '@/types/action'
import type { Unit, Position } from '@/types/unit'

export function useActionSystem() {
  const gameStore = useGameStore()
  

  function getAvailableActions(): ActionDefinition[] {
    const actionStore = useActionStore()
    return actionStore.availableActions;
  }

  function getValidTargets(
    action: ActionDefinition,
    executor: Unit
  ): Position[] {
    const layer = action.highlightLayers.find(l => l.relativeTo === 'Executor')
    if (!layer) return []

    return getPositionsByPattern(
      executor.coords,
      layer.pattern,
      layer.range,
      action.targetFilter
    )
  }

  function validateTarget(
    unit: Unit,
    action: ActionDefinition,
    target: Position | Unit
  ): boolean {
    const layer = action.highlightLayers.find(l => l.relativeTo === 'Executor')
    if (!layer) return true

    const positions = getPositionsByPattern(
      unit.coords,
      layer.pattern,
      layer.range,
      action.targetFilter
    )

    const targetPos = 'coords' in target ? target.coords : target
    const isInRange = positions.some(p => p.x === targetPos.x && p.y === targetPos.y)

    if (!isInRange) return false

    if (action.targetFilter?.requireEnemy) {
      if ('playerId' in target && target.playerId === unit.playerId) {
        return false
      }
    }

    if (action.targetFilter?.requireAlly) {
      if ('playerId' in target && target.playerId !== unit.playerId) {
        return false
      }
    }

    return true
  }

  function getHighlightLayersForState(
    action: ActionDefinition,
    state: ActionState
  ): HighlightLayer[] {
    return action.highlightLayers.filter(layer => {
      if (layer.visibility === 'Always') return true
      return layer.visibility === state
    })
  }

  function getPositionsByPattern(
    center: Position,
    pattern: HighlightPattern,
    range: number,
    filter: ActionDefinition['targetFilter']
  ): Position[] {
    if (!gameStore.map) return []

    const positions: Position[] = []

    switch (pattern) {
      case 'Manhattan':
        positions.push(...getManhattanPositions(center, range))
        break
      case 'Circle':
        positions.push(...getCirclePositions(center, range))
        break
      case 'Adjacent':
        positions.push(...getAdjacentPositions(center, false))
        break
      case 'AdjacentDiagonal':
        positions.push(...getAdjacentPositions(center, true))
        break
      case 'Self':
        positions.push(center)
        break
    }

    // FIXME: USE FILTER!
    return positions.filter(pos =>
      pos.x >= 0 && pos.x < gameStore.map!.width &&
      pos.y >= 0 && pos.y < gameStore.map!.height
    )
  }

  function getManhattanPositions(center: Position, range: number): Position[] {
    const positions: Position[] = []
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const distance = Math.abs(dx) + Math.abs(dy)
        if (distance > 0 && distance <= range) {
          positions.push({ x: center.x + dx, y: center.y + dy })
        }
      }
    }
    return positions
  }

  function getCirclePositions(center: Position, range: number): Position[] {
    const positions: Position[] = []
    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance <= range) {
          positions.push({ x: center.x + dx, y: center.y + dy })
        }
      }
    }
    return positions
  }

  function getAdjacentPositions(center: Position, includeDiagonal: boolean): Position[] {
    const deltas = includeDiagonal
      ? [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
      : [[-1, 0], [0, -1], [0, 1], [1, 0]]

    return deltas.map(([dx, dy]) => ({
      x: center.x + dx,
      y: center.y + dy
    }))
  }

  return {
    getAvailableActions,
    getValidTargets,
    validateTarget,
    getHighlightLayersForState,
    getPositionsByPattern
  }
}
