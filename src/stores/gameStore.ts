import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, Player, MapState } from '@/types/game'
import type { Unit } from '@/types/unit'
import { useActionStore } from './actionStore'
import { useSignalR } from '@/composables/useSignalR'

export const useGameStore = defineStore('game', () => {
  
  // State
  const map = ref<MapState | null>()
  const units = ref<Unit[]>([])
  
  const players = ref<Player[]>([])
	const myPlayerId = ref<number>()

  const selectedUnitId = ref<number | null>(null)
  const isPlanningPhase = ref<boolean>(true)

  // Computed
  const selectedUnit = computed((): Unit | null => {
    return units.value.find((u) => u.unitId === selectedUnitId.value) ?? null
  })

  const myPlayer = computed((): Player | null => {
    return players.value.find(p => p.playerId === myPlayerId.value) ?? null
  })

  const isMyUnitSelected = computed((): boolean => {
    if (!selectedUnit.value)
      return false

    return selectedUnit.value.playerId === myPlayerId.value
  })


  // Actions
  function isPlayerReady(playerId: number)
  {
    const player = players.value.find(p => p.playerId === playerId)
    if (!player)
      throw Error("Unknown player id")

    return player.isReady
  }

  function getUnitById(unitId: number): Unit | undefined
  {
    return units.value.find((u) => (u.unitId === unitId))
  }

  function updateGameState(state: Partial<GameState>) {
    if (state.players) players.value = state.players
    if (state.map) map.value = state.map
    if (state.units) units.value = state.units
  }

  function updatePlayers(_players: Player[])
  {
    players.value = _players
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

  function prepareEndTurn() {
    const actionStore = useActionStore()
    const signal = useSignalR()

    const actions = actionStore.submitedActions()

    signal.endTurn(actions)
    
    // deselectUnit()
    // actionStore.reset()
    // highlight.clearActionHighlights()
    // isPlanningPhase.value = false
  }

  return {
    // State
    units,
    players,
    map,
    isPlanningPhase,
    myPlayerId,

    // Computed
    selectedUnit,
    myPlayer,
    isMyUnitSelected,
        
    // Actions
    isPlayerReady,
    getUnitById,
    updateGameState,
    updatePlayers,
    selectUnit,
    deselectUnit,
    updateUnit,
    prepareEndTurn,
  }
})
