<script setup lang="ts">
import { useColorSystem } from '@/composables/useColorSystem'
import { useGameStore } from '@/stores/gameStore';
import { Unit } from '@/types/unit';


const gameStore = useGameStore()
const color = useColorSystem()


function getUnitControllerPlayer(unit : Unit)
{
	return gameStore.players.find((u) => u.playerId == unit.playerId)
}

</script>

<template>
	<div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
		<h3 class="text-primary font-bold text-sm mb-3 uppercase">Информация о юните</h3>
		
		<div v-if="gameStore.selectedUnit" class="space-y-2 text-sm">
			
			<div class="w-full bg-gray-700 h-2 rounded overflow-hidden">
				<div 
					:style="`width: ${(gameStore.selectedUnit.curHealth / gameStore.selectedUnit.maxHealth) * 100}%; 
							 background-color: var(${color.getPlayerStringColor(gameStore.selectedUnit.playerId)})`"
					class="h-full transition-all duration-300"
				/>
			</div>

			<div class="flex justify-between">
				<span class="text-gray-400">HP:</span>
				<span class="font-semibold">
					{{ gameStore.selectedUnit.curHealth }}/{{ gameStore.selectedUnit.maxHealth }}
				</span>
			</div>

			<div class="flex justify-between">
				<span class="text-gray-400">Позиция:</span>
				<span class="text-white">({{ gameStore.selectedUnit.coords.x }}, {{ gameStore.selectedUnit.coords.y }})</span>
			</div>

			<div v-if="gameStore.selectedUnit" 
				 class="flex justify-between">
				<span class="text-gray-400">Игрок:</span>
				<span 
					:color="`color: var(${color.getPlayerStringColor(gameStore.selectedUnit.playerId)})`"
					class="font-semibold"
				>
					{{ getUnitControllerPlayer(gameStore.selectedUnit)?.playerName }}
				</span>
			</div>
		</div>
		
		<div v-else class="text-gray-500 text-sm text-center py-4">
			Выберите юнита на поле
		</div>
	</div>
</template>