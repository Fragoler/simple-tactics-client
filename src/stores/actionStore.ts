import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ActionDefinition, ScheduledAction } from '@/types/action'
import type { Position } from '@/types/unit'
import { useGameStore } from './gameStore'


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

    const id = getUnitScheduledAction.value(gameStore.selectedUnit.unitId)?.actionId
    return id ? getActionById(id) : undefined
  })

  const isSelectedActionConfirmed = computed((): boolean => {
    const gameStore = useGameStore()
    return gameStore.selectedUnit !== null && isUnitActionConfirmed(gameStore.selectedUnit.unitId)
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

  const getUnitScheduledAction = computed(()  => {
    return (unitId: number): ScheduledAction | null => scheduledActions.value.get(unitId) ?? null
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
    const scheduled = getUnitScheduledAction.value(unitId)
    if (!scheduled || scheduled.target === target) 
      return

    scheduled.target = target
  }

  // Confimed action
  function confirmAction(unitId: number) {
    const gameStore = useGameStore()

    const unit = gameStore.getUnitById(unitId)
    const scheduled = scheduledActions.value.get(unitId)
    if (!scheduled || !unit) return

    scheduled.confirmed = true

    console.debug("Action confirmed: ", scheduled.actionId)
  }

  // Remove action from scheduling process
  function cancelAction(unitId: number) {
    scheduledActions.value.delete(unitId)
  }

  function unconfirmAction(unitId: number) {
    const scheduled = getUnitScheduledAction.value(unitId)
    if (!scheduled)
      throw Error("Unconfirm not existing action")

    scheduled.confirmed = false
  }

  function setHoverPosition(pos: Position | null) {
    hoverPosition.value = pos
  }

  function submitedActions(): ScheduledAction[] {
    return Array.from(scheduledActions.value.values())
  }

  function reset() {
    scheduledActions.value =  new Map()
  }


  return {
    scheduledActions,

    // Computed
    availableActions,
    selectedAction,
    isSelectedActionConfirmed,
    unitHasAction,
    getUnitScheduledAction,

    // Actions
    registerActions,
    isUnitActionConfirmed,
    getActionById,
    getActionsByIds,
    getActionsForUnit,
    scheduleAction,
    updateActionTarget,
    confirmAction,
    unconfirmAction,
    cancelAction,
    setHoverPosition,
    submitedActions,
    reset
  }
})
