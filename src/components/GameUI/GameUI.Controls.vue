<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore()


async function endTurn() {
  if (!gameStore.isPlanningPhase) return
	
  try {
    gameStore.deselectUnit()
  } catch (error) {
    console.error('End turn error:', error)
  }
}

</script>

<template>
	<div class="bg-gray-900 p-4 rounded-lg border border-gray-700 flex gap-2">
		<button 
			@click="endTurn"
			:disabled="!gameStore.isPlanningPhase"
			class="bg-primary text-black text-xs font-bold px-4 py-2 rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
		>
				✓&nbsp;Завершить ход
		</button>
		<button 
			class="bg-gray-700 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gray-600 transition-all"
		>
				↶&nbsp;Отменить действие
			</button>
	</div>
</template>