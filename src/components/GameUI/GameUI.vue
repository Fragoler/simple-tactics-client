<script setup lang="ts">

import PlayerStatus from './GameUI.PlayerStatus.vue'
import Controls from './GameUI.Controls.vue'
import ConnectionStatus from './GameUI.ConnectionStatus.vue';
import InputTokens from './GameUI.InputTokens.vue';
import UnitInfo from './GameUI.UnitInfo.vue'
import { useConnectionStore } from '@/stores/connectionStore';
import { computed } from 'vue';

const conStore = useConnectionStore() 

const isConnected = computed((): boolean => {
  return conStore.connectionStatus === 'connected'
})

</script>

<template>
  <div class="flex flex-col gap-3 h-full">

    <div class="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-4">
      <InputTokens />
      <ConnectionStatus />
    </div>

    <PlayerStatus v-if="isConnected" />
    <Controls v-if="isConnected" />

    <UnitInfo v-if="isConnected" />
    
  </div>
</template>
