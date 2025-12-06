<script setup lang="ts">

import { useGameStore } from '@/stores/gameStore'

import PlayerStatus from './GameUI.PlayerStatus.vue'
import Controls from './GameUI.Controls.vue'
import ConnectionStatus from './GameUI.ConnectionStatus.vue';
import InputTokens from './GameUI.InputTokens.vue';
import UnitInfo from './GameUI.UnitInfo.vue'
import Log from './GameUI.Log.vue'


</script>

<template>
  <div class="flex flex-col gap-3 h-full">
    
    <UnitInfo />
    <PlayerStatus />
    <Controls />

    <!-- Connection menu -->
    <div class="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-4">
      <InputTokens />
      <ConnectionStatus />
    </div>

    <Log />
  </div>
</template>
