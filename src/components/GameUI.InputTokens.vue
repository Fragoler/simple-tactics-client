<script setup lang="ts">
import { useSignalR } from '@/composables/useSignalR'
import { useGameStore } from '@/stores/gameStore'
import { ref } from 'vue'


const gameToken = ref('')
const playerToken = ref('')
const isInputVisible = ref(false)

const gameStore = useGameStore()
const { connect } = useSignalR()


async function handleClick() 
{
  if (isInputVisible.value) {
    gameStore.updateTokens(gameToken.value, playerToken.value)
		
		await connect(gameStore.gameToken, gameStore.playerToken)

		if (gameStore.isConnected)
    	isInputVisible.value = false
  } else {
    isInputVisible.value = true
  }
}


</script>


<template>
	<div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
		<div v-if="isInputVisible" class="space-y-3">
			<div>
				<label class="block text-sm font-medium text-gray-300 mb-1">
					Game Token
				</label>
				<input
					v-model="gameToken"
					type="text"
					placeholder="Введите game token"
					class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
				/>
			</div>
			
			<div>
				<label class="block text-sm font-medium text-gray-300 mb-1">
					Player Token
				</label>
				<input
					v-model="playerToken"
					type="text"
					placeholder="Введите player token"
					class="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
				/>
			</div>
		</div>
		
		<br v-show="isInputVisible"/>
		
		<button
			@click="handleClick"
			class="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
		>
			{{ isInputVisible ? 'Подключиться' : 'Ввести токены' }}
		</button>
	</div>
</template>