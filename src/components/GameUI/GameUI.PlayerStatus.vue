<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';


const gameStore = useGameStore()

</script>

<template>
	<div class="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-4">
		<h3 class="text-primary font-bold text-sm mb-3 uppercase">Статус игры</h3>

		<div class="space-y-2">
			<div 
				v-for="player in gameStore.players" 
				:key="player.playerId"
				class="bg-gray-800 p-2 rounded text-sm"
			>
				<div class="flex justify-between">
					<span :class="player.playerId === 0 ? 'text-primary' : 'text-secondary'" class="font-semibold">
						{{ player.playerName }} &hairsp;  {{ player.playerId === gameStore.myPlayerId ? "⭐": "" }}
					</span>

					<span v-if="player.isReady" class="text-green-400 text-ms">✓</span>
				</div>

			</div>
		</div>

	</div>
</template>