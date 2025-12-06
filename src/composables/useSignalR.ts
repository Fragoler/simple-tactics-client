import { ref } from 'vue'
import * as signalR from '@microsoft/signalr'
import { useGameStore } from '@/stores/gameStore'
import type { GameState, Player } from '@/types/game'

const connection = ref<signalR.HubConnection | null>(null)


export function useSignalR() {
  
  const gameStore = useGameStore()

  async function connect(gameToken: string, playerToken: string) {
    try {
      gameStore.setConnectionStatus('connecting')
      gameStore.addLog('🔗 Подключение к серверу...', 'info')
      
      await buildConnection()

      gameStore.addLog('✅ Подключено к серверу', 'success')

      await addHandelers()
      
      await joinGame(gameToken, playerToken)
      await loadGameState(gameToken, playerToken)
      await requestMyPlayer(gameToken, playerToken)
      
    } catch (error) {
      console.error('Connection error:', error)
      gameStore.setConnectionStatus('disconnected')
      gameStore.addLog(`❌ Ошибка подключения: ${error}`, 'error')
      throw error
    }

  }

  async function buildConnection() {
    connection.value = new signalR.HubConnectionBuilder()
      .withUrl('/game')
      .withAutomaticReconnect([0, 0, 0, 1000, 3000, 5000])
      .configureLogging(signalR.LogLevel.Information)
      .build()
  }

  async function addHandelers() {
    if (connection.value === null)
      throw Error("Connection is null");

    connection.value.on('gameState', (state: GameState) => {
      console.log('📊 Game state received:', state)
      gameStore.updateGameState(state)
    })

    connection.value.on('playerId', (player: Player) => {
      console.log('📊 My player received:', player)
      gameStore.myPlayerId = player.playerId
    })

    // server error 
    connection.value.on('error', (message: string) => {
      console.error('❌ Server error:', message)
      gameStore.addLog(`❌ Ошибка: ${message}`, 'error')
    })


    // Connection events
    connection.value.onreconnecting(() => {
      gameStore.setConnectionStatus('reconnecting')
      gameStore.addLog('🔄 Переподключение...', 'warning')
    })

    connection.value.onreconnected(() => {
      gameStore.setConnectionStatus('connected')
      gameStore.addLog('✅ Переподключено', 'success')
    })

    connection.value.onclose(() => {
      gameStore.setConnectionStatus('disconnected')
      gameStore.addLog('❌ Соединение закрыто', 'error')
    })
  }


  // Send
  async function joinGame(gameToken: string, playerToken: string) {
    if (connection.value === null)
      throw Error("Connection is null");

    await connection.value.start()
    gameStore.setConnectionStatus('connected')
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

  async function disconnect() {
    if (connection.value) {
      await connection.value.stop()
      connection.value = null
      gameStore.setConnectionStatus('disconnected')
      gameStore.addLog('👋 Отключено от сервера', 'info')
    }
  }

  return {
    connect,
    disconnect,
    loadGameState
  }
}
