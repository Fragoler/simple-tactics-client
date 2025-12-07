<script setup lang="ts">

import { computed } from 'vue'
import { useConnectionStore } from '@/stores/connectionStore'

const conStore = useConnectionStore()


const statusColor = computed(() => {
  const colors = {
    connecting: 'text-yellow-400 bg-yellow-900/20',
    connected: 'text-green-400 bg-green-900/20',
    disconnected: 'text-red-400 bg-red-900/20',
    reconnecting: 'text-orange-400 bg-orange-900/20'
  }
  return colors[conStore.connectionStatus]
})

const statusIcon = computed(() => {
  const icons = {
    connecting: '◌',
    connected: '●',
    disconnected: '✕',
    reconnecting: '↻'
  }
  return icons[conStore.connectionStatus]
})

</script>


<template>
	<div :class="statusColor" class="flex items-center justify-center gap-2 px-3 py-2 rounded-full text-sm font-semibold">
		<span>{{ statusIcon }}</span>
		<span>{{ conStore.connectionStatus }}</span>
	</div>
</template>