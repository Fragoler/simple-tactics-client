import { ConnectionStatus } from '@/types/game'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'


export const useConnectionStore = defineStore('connection', () => {

	// States
	const gameToken = ref<string>('')
	const playerToken = ref<string>('')

	const connectionStatus = ref<ConnectionStatus>('disconnected')


	// Computed
	const isConnected = computed(() => connectionStatus.value == 'connected')
	

	// Actions
  function updateTokens(_gameToken: string, _playerToken: string)
  {
    gameToken.value = _gameToken
    playerToken.value = _playerToken
  }

	function setConnectionStatus(status: ConnectionStatus) {
    connectionStatus.value = status
  }

	return {
		// State
		gameToken,
		playerToken,
		connectionStatus,

		// Computed
		isConnected,

		// Actions
		updateTokens,
		setConnectionStatus,
	}
})