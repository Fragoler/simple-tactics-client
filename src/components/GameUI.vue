<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import GameUI from './GameUI.ConnectionStatus.vue'
import GameUIConnectionStatus from './GameUI.ConnectionStatus.vue';
import GameUIInputTokens from './GameUI.InputTokens.vue';

const emit = defineEmits<{
  endTurn: []
}>()

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
  <div class="flex flex-col gap-3 h-full">
    <!-- Unit Info -->
    <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 class="text-primary font-bold text-sm mb-3 uppercase">Информация о юните</h3>
      
      <div v-if="gameStore.selectedUnit" class="space-y-2 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-400">Тип:</span>
          <!-- <span class="text-white font-semibold">{{ gameStore.selectedUnit. }}</span> -->
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">HP:</span>
          <span class="text-primary font-semibold">
            {{ gameStore.selectedUnit.health }}/{{ gameStore.selectedUnit.maxHealth }}
          </span>
        </div>
        <div class="w-full bg-gray-700 h-2 rounded overflow-hidden">
          <div 
            :style="`width: ${(gameStore.selectedUnit.health / gameStore.selectedUnit.maxHealth) * 100}%`"
            :class="gameStore.selectedUnit.playerId === 1 ? 'bg-primary' : 'bg-secondary'"
            class="h-full transition-all duration-300"
          />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Позиция:</span>
          <span class="text-white">({{ gameStore.selectedUnit.coords.x }}, {{ gameStore.selectedUnit.coords.y }})</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400">Игрок:</span>
          <span 
            :class="gameStore.selectedUnit.playerId === 1 ? 'text-primary' : 'text-secondary'"
            class="font-semibold"
          >
            #{{ gameStore.selectedUnit.playerId }}
          </span>
        </div>
      </div>
      
      <div v-else class="text-gray-500 text-sm text-center py-4">
        Выберите юнита на поле
      </div>
    </div>

    <!-- Game Status -->
    <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 class="text-primary font-bold text-sm mb-3 uppercase">Статус игры</h3>
      <div class="space-y-2 text-sm">

        <!-- <div class="flex justify-between">
          <span class="text-gray-400">Раунд:</span>
          <span class="text-primary font-bold text-lg">{{ gameStore. }}</span>
        </div> -->
        
        <div v-if="gameStore.currentPlayer" class="flex justify-between">
          <span class="text-gray-400">Ход:</span>
          <span class="text-white font-semibold">{{ gameStore.currentPlayer.playerName }}</span>
        </div>
        <div 
          v-if="gameStore.isMyTurn"
          class="bg-primary/20 text-primary border border-primary rounded px-2 py-1 text-center font-semibold"
        >
          🎯 Ваш ход!
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="bg-gray-900 p-4 rounded-lg border border-gray-700 space-y-2">
      <button 
        @click="emit('endTurn')"
        :disabled="!gameStore.isMyTurn"
        class="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        ✓ Завершить ход
      </button>
      <button 
        class="w-full bg-gray-700 text-white font-semibold py-2 rounded-lg hover:bg-gray-600 transition-all"
      >
        ↶ Отменить действие
      </button>
    </div>

    <!-- Players -->
    <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h3 class="text-primary font-bold text-sm mb-3 uppercase">Игроки</h3>
      <div class="space-y-2">
        <div 
          v-for="player in gameStore.players" 
          :key="player.playerId"
          class="bg-gray-800 p-2 rounded text-sm"
        >
          <div class="flex items-center justify-between">
            <span :class="player.playerId === 1 ? 'text-primary' : 'text-secondary'" class="font-semibold">
              {{ player.playerName }}
            </span>
            <span v-if="player.isReady" class="text-green-400 text-xs">✓ Готов</span>
          </div>

          <!-- <div class="text-gray-400 text-xs mt-1">
            Юнитов: {{ player }}
          </div> -->

        </div>
      </div>
    </div>


    <!-- Connection menu -->
    <div class="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <div class="space-y-4">
        <GameUIInputTokens />
        <GameUIConnectionStatus />
      </div>
    </div>

    <!-- Logs -->
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
  </div>
</template>
