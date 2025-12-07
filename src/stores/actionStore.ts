import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ActionDefinition, ScheduledAction, ActionState } from '@/types/action'
import type { Position } from '@/types/unit'
import { useGameStore } from './gameStore'

export const useActionStore = defineStore('action', () => {
  /// State
  const actionDefinitions = ref<Map<string, ActionDefinition>>(new Map())


  const scheduledActions =  ref<Map<number, ScheduledAction>>(new Map())  
  const hoverPosition =     ref<Position | null>(null)

  // State for selected unit
  const availableActions =  ref<ActionDefinition[]>([])
  const selectedActionId =  ref<string | null>(null)
  ///

  /// Computed
  const selectedAction = computed(() => {
    if (!selectedActionId.value) return null
    return availableActions.value.find(a => a.id === selectedActionId.value)
  })

  const unitHasAction = computed(() => {
    return (unitId: number) => scheduledActions.value.has(unitId)
  })

  const getUnitAction = computed(() => {
    return (unitId: number) => scheduledActions.value.get(unitId)
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

    const action = getActionById(actionId)
    if (!action) {
      console.warn(`Action ${actionId} not found in definitions`)
      return
    }

    const unit = gameStore.getUnitById(unitId)
    if (!unit?.actionIds.includes(actionId)) {
      console.warn(`Unit ${unitId} cannot use action ${actionId}`)
      return
    }

    scheduledActions.value.set(unitId, {
      unitId,
      actionId,
      state: 'Selecting',
      target: undefined
    })
  }

  // Update target for scheduled action for unit
  function updateActionTarget(
    unitId: number,
    target: { cell?: Position; unitIds?: number[] }
  ) {
    const scheduled = scheduledActions.value.get(unitId)
    if (!scheduled) return

    scheduled.target = target
  }

  
  function setAvailableActions(actions: ActionDefinition[]) {
    availableActions.value = actions
  }

  function selectAction(actionId: string) {
    selectedActionId.value = actionId
  }

  function deselectAction() {
    selectedActionId.value = null
  }

  // Confimed action
  function confirmAction(unitId: number) {
    const scheduled = scheduledActions.value.get(unitId)
    if (!scheduled) return

    scheduled.state = 'Confirmed'
  }

  // Remove action from scheduling process
  function cancelAction(unitId: number) {
    scheduledActions.value.delete(unitId)
    if (selectedActionId.value) {
      selectedActionId.value = null
    }
  }

  function setHoverPosition(pos: Position | null) {
    hoverPosition.value = pos
  }

  function submitActions(): ScheduledAction[] {
    return Array.from(scheduledActions.value.values())
                .filter((u) => u.state === 'Confirmed')
  }

  function reset() {
    availableActions.value =  []
    scheduledActions.value =  new Map()
    selectedActionId.value =  null
  }


  return {
    availableActions, 
    
    // Computed
    selectedAction,
    unitHasAction,
    getUnitAction,

    // Actions
    registerActions,
    getActionById,
    getActionsByIds,
    getActionsForUnit,
    setAvailableActions,
    selectAction,
    deselectAction,
    scheduleAction,
    updateActionTarget,
    confirmAction,
    cancelAction,
    setHoverPosition,
    submitActions,
    reset
  }
})
