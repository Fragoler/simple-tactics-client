import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, Player, MapState } from '@/types/game'
import type { Unit } from '@/types/unit'
import { useConnectionStore } from './connectionStore'
import { useActionStore } from './actionStore'
import { useActionHighlight } from '@/composables/useActionHighlight'

export const useGameStore = defineStore('game', () => {
  
  // State
  const map = ref<MapState | null>()
  const units = ref<Unit[]>([])
  
  const players = ref<Player[]>([])
	const myPlayerId = ref<number>()

  const selectedUnitId = ref<number | null>(null)
  const isPlanningPhase = ref<boolean>(true)

  // Computed
  const selectedUnit = computed(() => {
    return units.value.find((u) => u.unitId === selectedUnitId.value)
  })


  // Actions
  function getUnitById(unitId: number): Unit | undefined
  {
    return units.value.find((u) => (u.unitId === unitId))
  }


  function updateGameState(state: Partial<GameState>) {
    if (state.players) players.value = state.players
    if (state.map) map.value = state.map
    if (state.units) units.value = state.units
  }

  function selectUnit(unitId: number) {
    selectedUnitId.value = unitId
  }

  function deselectUnit() {
    selectedUnitId.value = null
  }

  function updateUnit(unitId: number, updates: Partial<Unit>) {
    const unit = getUnitById(unitId)
    if (unit) {
      Object.assign(unit, updates)
    }
  }

  function endTurn() {
    const actionStore = useActionStore()
    const highlight = useActionHighlight()

    const actions = actionStore.submitActions()

    // TODO: Send to server
    
    actionStore.reset()
    highlight.clearActionHighlights()
    isPlanningPhase.value = false
  }

  function undoCurrentAction() {
    const actionStore = useActionStore()
    if (selectedUnitId.value) {
      actionStore.cancelAction(selectedUnitId.value)
    }
  }


  return {
    // State
    units,
    players,
    map,
    isPlanningPhase,
    
    // Computed
    selectedUnit,
    myPlayerId,
        
    // Actions
    getUnitById,
    updateGameState,
    selectUnit,
    deselectUnit,
    updateUnit,
    endTurn,
    undoCurrentAction,
  }
})
