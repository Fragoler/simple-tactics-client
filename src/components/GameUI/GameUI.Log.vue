<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore'


const gameStore = useGameStore()



const formatTime = (date: Date) => {
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const getLogColor = (type: string) => {
	const colors = {
			info: 'border-primary text-primary',
			success: 'border-green-400 text-green-400',
			warning: 'border-orange-400 text-orange-400',
			error: 'border-red-400 text-red-400'
	}
	return colors[type as keyof typeof colors] || colors.info
}
</script>

<template>
	<div class="bg-gray-900 p-4 rounded-lg border border-gray-700 flex-1 overflow-hidden flex flex-col">
		<h3 class="text-primary font-bold text-sm mb-3 uppercase">Лог событий</h3>
		<div class="overflow-y-auto flex-1 space-y-1 text-xs font-mono">
			<div 
				v-for="(log, i) in gameStore.logs" 
				:key="i"
				:class="getLogColor(log.type)"
				class="border-l-2 pl-2 py-1"
			>
				<span class="text-gray-500">[{{ formatTime(log.timestamp) }}]</span>
				{{ log.message }}
			</div>
		</div>
	</div>
</template>