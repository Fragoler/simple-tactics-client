import { ref } from 'vue'
import * as signalR from '@microsoft/signalr'
import { useGameStore } from '@/stores/gameStore'
import type { GameState, Player } from '@/types/game'
import { useConnectionStore } from '@/stores/connectionStore'
import { useActionStore } from '@/stores/actionStore'
import { ActionDefinition } from '@/types/action'

const connection = ref<signalR.HubConnection | null>(null)


async function buildConnection() {
  connection.value = new signalR.HubConnectionBuilder()
    .withUrl('/game')
    .withAutomaticReconnect([0, 0, 0, 1000, 3000, 5000])
    .configureLogging(signalR.LogLevel.Debug)
    .build()
}

async function addHandelers() {
  if (connection.value === null)
    throw Error("Connection is null");

  connection.value.on('gameState', (state: GameState) => {
    console.log('Game state received:', state)

    const gameStore = useGameStore()
    gameStore.updateGameState(state)
  })

  connection.value.on('playerId', (player: Player) => {
    console.log('My player received:', player)

    const gameStore = useGameStore()
    gameStore.myPlayerId = player.playerId
  })

  connection.value.on('gameActions', (actions: ActionDefinition[]) => {
    console.log('Action definitions received:', actions)

    const actionStore = useActionStore()
    actionStore.registerActions(actions)
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



export function useSignalR() {
  
  async function connect(gameToken: string, playerToken: string) {
    const conStore = useConnectionStore()    
    
    try {
      conStore.setConnectionStatus('connecting')

      await buildConnection()
      await addHandelers()
      
      await joinGame(gameToken, playerToken)
      await loadGameState(gameToken, playerToken)
      await requestMyPlayer(gameToken, playerToken)
      await requestGameActions(gameToken, playerToken)
      
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


  // Send
  async function joinGame(gameToken: string, playerToken: string) {
    const conStore = useConnectionStore()

    if (connection.value === null)
      throw Error("Connection is null");

    await connection.value.start()
    conStore.setConnectionStatus('connected')
    await connection.value.invoke('JoinGame', gameToken, playerToken)
  }

  async function loadGameState(gameToken: string, playerToken: string) {
    if (connection.value === null)
      throw Error("Connection is null");

    await connection.value.invoke('RequestGameState', gameToken, playerToken)
  }

  async function requestMyPlayer(gameToken: string, playerToken: string) {
    if (connection.value === null)
      throw Error("Connection is null");

    await connection.value.invoke("RequestPlayerId", gameToken, playerToken)
  }

  async function requestGameActions(gameToken: string, playerToken: string) {
    if (connection.value === null)
      throw Error("Connection is null");

    await connection.value.invoke("RequestGameActions", gameToken, playerToken)
  }

  return {
    connect,
    disconnect,
    loadGameState
  }
}
