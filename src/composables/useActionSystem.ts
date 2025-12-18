import { useGameStore } from '@/stores/gameStore'
import { useActionStore } from '@/stores/actionStore'
import type { ActionDefinition, Pattern } from '@/types/action'
import type { Unit, Position } from '@/types/unit'
import { watch } from 'vue'
import { Player } from '@/types/game'


export function useActionSystem() {

  function init()
  {
    const gameStore = useGameStore()
    const actionStore = useActionStore()

    watch(
      gameStore.players,
      (players: Player[], oldPlayers: Player[]) => {
        const newMe = players.find(p => p.playerId === gameStore.myPlayerId)
        const oldMe = oldPlayers.find(p => p.playerId === gameStore.myPlayerId)
        if (!oldMe || !newMe)
          return

        if (!oldMe.isReady && newMe.isReady) {
          actionStore.reset()
        }
      }
    )
  }

  // Select - Confirm cyrcle
  function selectAction(actionId: string) {
    const gameStore = useGameStore()
    const actionStore = useActionStore()

    if (!gameStore.selectedUnit) return

    actionStore.scheduleAction(gameStore.selectedUnit.unitId, actionId)
  }

  function canBeConfirmedWithButton(actionId: string): boolean {
    const actionStore = useActionStore()

    const action = actionStore.getActionById(actionId)
    if (!action)
      return false

    return action.targetType === 'None' 
  }

  function canConfirmWithTarget(pos: Position): boolean
  {
    const gameStore = useGameStore()
    const actionStore = useActionStore()

    if (!actionStore.selectedAction ||
        !gameStore.selectedUnit)
      return false

    const scheduled = actionStore.getUnitScheduledAction(gameStore.selectedUnit.unitId)
    if (!scheduled || scheduled.confirmed)
      return false
    
    const action = actionStore.getActionById(scheduled.actionId)
    if (!action)
      throw Error("Scheduled action has wrong id")

    if (action.targetType !== 'Cell')
      return true

    const valids = getValidTargets(action, gameStore.selectedUnit)
    return valids.find(v => v.x === pos.x && v.y === pos.y) !== undefined 
  }

  function handleTargetFromPointer(pos: Position)
  {
    const gameStore = useGameStore()
    const actionStore = useActionStore()

    if (!actionStore.selectedAction ||
        !gameStore.selectedUnit)
      return 

    const scheduled = actionStore.getUnitScheduledAction(gameStore.selectedUnit.unitId)
    if (!scheduled || scheduled?.confirmed)
      return 
    
    const action = actionStore.getActionById(scheduled.actionId)
    if (!action)
      throw Error("Scheduled action has wrong id")

    if (action.targetType !== 'Cell')
      return

    // So, correct target
    const valids = getValidTargets(action, gameStore.selectedUnit)

    const distance = (a: Position, b: Position) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) 
    const closest = valids.reduce((best, current) => {
      return distance(best, pos) < distance(current, pos) ? best : current
    })
    if (!closest)
      return

    actionStore.updateActionTarget(gameStore.selectedUnit.unitId, closest)
  }

  //



  function getAvailableActions(): ActionDefinition[] {
    const actionStore = useActionStore()
    return actionStore.availableActions;
  }

  function getValidTargets(
    action: ActionDefinition,
    executor: Unit
  ): Position[] {
    const pattern = action.targetFilter.pattern
    const range = action.targetFilter.range ?? null

    return getPositionsByPattern(
      executor.coords,
      pattern,
      range,
      action.targetFilter
    )
  }

  function getPositionsByPattern(
    center: Position,
    pattern: Pattern,
    range: number | null,
    filter: ActionDefinition['targetFilter']
  ): Position[] {
    const positions: Position[] = []

    switch (pattern) {
      case 'Manhattan':
        if (!range)
          throw Error(`Range is unsetted for pattern ${pattern}`)

        positions.push(...getManhattanPositions(center, range))
        break
      case 'Circle':
        if (!range)
          throw Error(`Range is unsetted for pattern ${pattern}`)
        
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

    return filterPositions(positions, filter)
  }

  function filterPositions(positions: Position[], filter: ActionDefinition['targetFilter']): 
    Position[]
  {
    const gameStore = useGameStore()
    if (!gameStore.map) return []
   
    positions = positions.filter(pos =>
      pos.x >= 0 && pos.x < gameStore.map!.width &&
      pos.y >= 0 && pos.y < gameStore.map!.height)

    if (filter.requiredFreeSpace === true && gameStore.map)
    {
      positions = positions.filter(pos =>
        gameStore.map!.terrain[pos.x][pos.y] === 0
      )
    }

    return positions
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
    const maxRange: number = Math.ceil(range)
    for (let dx = -maxRange; dx <= maxRange; dx++) {
      for (let dy = -maxRange; dy <= maxRange; dy++) {
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance <= range && distance !== 0) {
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
    init,
    selectAction,
    canConfirmWithTarget,
    canBeConfirmedWithButton,
    handleTargetFromPointer,

    getAvailableActions,
    getValidTargets,
    getPositionsByPattern
  }
}
