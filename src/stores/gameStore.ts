import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, Player, LogEntry, ConnectionStatus, MapState } from '@/types/game'
import type { Unit } from '@/types/unit'

export const useGameStore = defineStore('game', () => {
  // State
  const gameToken = ref<string>('')
  const playerToken = ref<string>('')

  const map = ref<MapState | null>()
  const units = ref<Unit[]>([])
  
  const players = ref<Player[]>([])
  const myPlayerId = ref<number>()

  const selectedUnitId = ref<number | null>(null)

  const isPlanningPhase = ref<boolean>(true)

  const connectionStatus = ref<ConnectionStatus>('disconnected')
  const logs = ref<LogEntry[]>([])

  // Computed
  const isConnected = computed(() => connectionStatus.value == 'connected')

  const selectedUnit = computed(() => {
    return units.value.find((u) => u.unitId === selectedUnitId.value)
  })


  // Actions
  function updateTokens(_gameToken: string, _playerToken: string)
  {
    gameToken.value = _gameToken
    playerToken.value = _playerToken
  }

  function updateGameState(state: Partial<GameState>) {
    if (state.players) players.value = state.players
    if (state.map) map.value = state.map
    if (state.units) units.value = state.units

    addLog(`📊 состояние обновлено`, 'success')
  }

  function selectUnit(unitId: number) {
    selectedUnitId.value = unitId
    addLog(`Выбран юнит #${unitId}`, 'info')
  }

  function deselectUnit() {
    selectedUnitId.value = null
  }
  function updateUnit(unitId: number, updates: Partial<Unit>) {
    const unit = units.value.find(u => u.unitId === unitId)
    if (unit) {
      Object.assign(unit, updates)
    }
  }

  function setConnectionStatus(status: ConnectionStatus) {
    connectionStatus.value = status
  }

  function addLog(message: string, type: LogEntry['type'] = 'info') {
    logs.value.unshift({
      message,
      type,
      timestamp: new Date()
    })
    
    if (logs.value.length > 50) {
      logs.value = logs.value.slice(0, 50)
    }
  }

  function reset() {
    gameToken.value = ''
    playerToken.value = ''
    units.value = []
    players.value = []
    selectedUnitId.value = null
    logs.value = []
  }

  return {
    // State
    gameToken,
    playerToken,
    units,
    players,
    logs,
    map,
    connectionStatus,
    isPlanningPhase,
    
    // Computed
    isConnected,
    selectedUnit,
    myPlayerId,
        
    // Actions
    updateTokens,
    updateGameState,
    selectUnit,
    deselectUnit,
    updateUnit,
    setConnectionStatus,
    addLog,
    reset
  }
})
