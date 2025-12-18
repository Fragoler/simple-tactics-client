import { ref } from 'vue'
import * as signalR from '@microsoft/signalr'
import { useGameStore } from '@/stores/gameStore'
import type { GameState, Player } from '@/types/game'
import { useConnectionStore } from '@/stores/connectionStore'
import { useActionStore } from '@/stores/actionStore'
import { ActionDefinition, ScheduledAction } from '@/types/action'
import { useEffectSystem } from './useEffectSystem'

const connection = ref<signalR.HubConnection | null>(null)


async function buildConnection() {
  connection.value = new signalR.HubConnectionBuilder()
    .withUrl('/game')
    .withAutomaticReconnect([0, 0, 0, 1000, 3000, 5000])
    .configureLogging(signalR.LogLevel.Debug)
    .build()

  await connection.value.start()
}

async function addHandelers() {
  if (connection.value === null)
    throw Error("Connection is null");

  connection.value.on('joinedGame', async () => {
      const conStore = useConnectionStore()
      conStore.setConnectionStatus('connected')

      await loadGameState()
      await requestMyPlayer()
      await requestGameActions()
  })

  connection.value.on('gameState', (state: GameState) => {
    console.log('Game state received:', state)

    const gameStore = useGameStore()
    gameStore.updateGameState(state)
  })

  connection.value.on('yourPlayer', (player: Player) => {
    console.log('My player received:', player)

    const gameStore = useGameStore()
    gameStore.myPlayerId = player.playerId
  })

  connection.value.on('playersState', (players: Player[]) => {
    console.log('Players updated:', players)

    const gameStore = useGameStore()
    gameStore.updatePlayers(players)
  })

  connection.value.on('gameActions', (actions: ActionDefinition[]) => {
    console.log('Action definitions received:', actions)

    const actionStore = useActionStore()
    actionStore.registerActions(actions)
  })

  connection.value.on('actionResults', (effectDtos: any[]) => {
    console.log('Action results received:', effectDtos)

    try {
      const effectSystem = useEffectSystem()
      effectSystem.addEffects(effectDtos)
    } catch (error) {
      console.error('Failed to process action results:', error)
    }
  })

  // server error 
  connection.value.on('error', (message: string) => {
    console.error('Server error:', message)
  })


  // Connection events
  connection.value.onreconnecting(() => {
    const conStore = useConnectionStore()

    conStore.setConnectionStatus('reconnecting')
  })

  connection.value.onreconnected(() => {
    const conStore = useConnectionStore()
    
    conStore.setConnectionStatus('connected')
  })

  connection.value.onclose(() => {
    const conStore = useConnectionStore()

    conStore.setConnectionStatus('disconnected')
  })
}

// Send
async function joinGame() {
  if (connection.value === null)
    throw Error("Connection is null");

  const conStore = useConnectionStore()
  await connection.value.invoke('JoinGame', conStore.gameToken, conStore.playerToken)
}

async function loadGameState() {
  if (connection.value === null)
    throw Error("Connection is null");

  await connection.value.invoke('RequestGameState')
}

async function requestMyPlayer() {

  if (connection.value === null)
    throw Error("Connection is null");

  await connection.value.invoke("RequestPlayerId")
}

async function requestGameActions() {
  if (connection.value === null)
    throw Error("Connection is null");

  await connection.value.invoke("RequestGameActions")
}
//



export function useSignalR() {
  
  async function connect() {
    const conStore = useConnectionStore()    
    
    try {
      conStore.setConnectionStatus('connecting')

      await buildConnection()
      await addHandelers()
      
      await joinGame()
    } catch (error) {
      console.error('Connection error:', error)
      conStore.setConnectionStatus('disconnected')
      throw error
    }

  }

  async function disconnect() {
    const conStore = useConnectionStore()

    if (connection.value) {
      await connection.value.stop()
      connection.value = null
      conStore.setConnectionStatus('disconnected')
    }
  }

  async function endTurn(actions: ScheduledAction[]) {
    if (connection.value === null)
      throw Error("Connection is null");

    await connection.value.invoke("RequestTurnEnd", actions)
  }

  return {
    connect,
    disconnect,
    endTurn,
  }
}
