import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ActionDefinition, ScheduledAction } from '@/types/action'
import type { Position } from '@/types/unit'
import { useGameStore } from './gameStore'
import { usePixiGame } from '@/composables/usePixiGame'
import { useActionHighlight } from '@/composables/useActionHighlight'

export const useActionStore = defineStore('action', () => {
  /// State
  const actionDefinitions = ref<Map<string, ActionDefinition>>(new Map())

  const scheduledActions =  ref<Map<number, ScheduledAction>>(new Map())  
  const hoverPosition =     ref<Position | null>(null)
  ///

  /// Computed
  const selectedAction = computed((): ActionDefinition | undefined => {
    const gameStore = useGameStore()
    
    if (!gameStore.selectedUnit)
      return undefined

    const id = getUnitAction.value(gameStore.selectedUnit.unitId)?.actionId
    return id ? getActionById(id) : undefined
  })

  const isSelectedActionConfirmed = computed((): boolean => {
    const gameStore = useGameStore()
    return gameStore.selectedUnit !== undefined && isUnitActionConfirmed(gameStore.selectedUnit.unitId)
  })

  const availableActions = computed((): ActionDefinition[] => {
    const gameStore = useGameStore()
    
    if (!gameStore.selectedUnit)
      return []

    return getActionsForUnit(gameStore.selectedUnit.unitId)
  })

  const unitHasAction = computed(() => {
    return (unitId: number): boolean => scheduledActions.value.has(unitId)
  })

  const getUnitAction = computed(()  => {
    return (unitId: number): ScheduledAction | undefined => scheduledActions.value.get(unitId)
  })
  ///

  /// Actions
  function registerActions(actions: ActionDefinition[]) {
    actions.forEach(action => {
      actionDefinitions.value.set(action.id, action)
    })

    console.log("New action registered. Actions definitions: ", actionDefinitions.value)
  }
  
  function getActionById(id: string): ActionDefinition | undefined {
    return actionDefinitions.value.get(id)
  }

  function getActionsByIds(ids: string[]): ActionDefinition[] {
    return ids
      .map(id => actionDefinitions.value.get(id))
      .filter((def): def is ActionDefinition => !!def)
  }

  function isUnitActionConfirmed(unitId: number): boolean {
    const scheduled = scheduledActions.value.get(unitId)
    return scheduled ? scheduled.confirmed : false
  }

  // Get Actions unit can use
  function getActionsForUnit(unitId: number): ActionDefinition[] {
    const gameStore = useGameStore()

    const unit = gameStore.getUnitById(unitId)
    if (!unit?.actionIds?.length) return []
    
    return getActionsByIds(unit.actionIds)
  }

  // Add action to scheduling process
  function scheduleAction(unitId: number, actionId: string) {
    const gameStore = useGameStore()

    const unit = gameStore.getUnitById(unitId)
    if (!unit)
      return 

    if (unit.playerId !== gameStore.myPlayerId)
    {
      console.warn("Couldnt schedule another player unit's action")
      return
    }

    const action = getActionById(actionId)
    if (!action) {
      console.warn(`Action ${actionId} not found in definitions`)
      return
    }

    
    if (!unit?.actionIds.includes(actionId)) {
      console.warn(`Unit ${unitId} cannot use action ${actionId}`)
      return
    }

    scheduledActions.value.set(unitId, {
      unitId,
      actionId,
      confirmed: false,
      target: undefined
    })
  }

  // Update target for scheduled action for unit
  function updateActionTarget(
    unitId: number,
    target: Position 
  ) {
    const highlight = useActionHighlight()

    const scheduled = getUnitAction.value(unitId)
    if (!scheduled || scheduled.target === target) 
      return

    scheduled.target = target
    highlight.highlightForTarget(scheduled.unitId)
  }

  // Confimed action
  function confirmAction(unitId: number) {
    const highlight = useActionHighlight()
    const gameStore = useGameStore()

    const unit = gameStore.getUnitById(unitId)
    const scheduled = scheduledActions.value.get(unitId)
    if (!scheduled || !unit) return

    scheduled.confirmed = true

    highlight.renderActionHighlights(unitId)
    console.debug("Action confirmed: ", scheduled.actionId)
  }

  // Remove action from scheduling process
  function cancelAction(unitId: number) {
    const actionHighlight = useActionHighlight()
    const pixi = usePixiGame()

    scheduledActions.value.delete(unitId)
    pixi.requestAllUnitsUpdate()
    actionHighlight.clearActionHighlights()
  }

  function setHoverPosition(pos: Position | null) {
    hoverPosition.value = pos
  }

  function submitedActions(): ScheduledAction[] {
    return Array.from(scheduledActions.value.values())
                .filter((u) => u.confirmed)
  }

  function reset() {
    scheduledActions.value =  new Map()
  }


  return {
    // Computed
    availableActions,
    selectedAction,
    isSelectedActionConfirmed,
    unitHasAction,
    getUnitAction,

    // Actions
    registerActions,
    isUnitActionConfirmed,
    getActionById,
    getActionsByIds,
    getActionsForUnit,
    scheduleAction,
    updateActionTarget,
    confirmAction,
    cancelAction,
    setHoverPosition,
    submitedActions,
    reset
  }
})
