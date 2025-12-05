<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { usePixiGame } from '@/composables/usePixiGame'
import type { GameConfig } from '@/types/game'
import type { Position } from '@/types/unit'

const emit = defineEmits<{
  unitClick: [unitId: number]
  cellClick: [pos: Position]
}>()

const gameStore = useGameStore()
const canvasRef = ref<HTMLCanvasElement>()

const config: GameConfig = {
  cellSize: 50,
  colors: {
    grid: 0x333333,
    player1: 0x00CED1,
    player2: 0xFF8C00,
    highlight: 0xFFFF00,
    selected: 0x00FF00
  },
  unitSprites: {
    triangle: { sides: 3, radius: 20 },
    square: { sides: 4, radius: 20 },
    circle: { sides: 32, radius: 20 }
  }
}

const { 
  initApp,
  setConfig,
  highlightUnit, 
  unhighlightUnit,
  showMovementRange,
  clearHighlights,
  onStageClick 
} = usePixiGame()

onMounted(async () => {
  if (!canvasRef.value) return
  
  await initApp(canvasRef.value)
  setConfig(config) 

  onStageClick((pos) => {
    emit('cellClick', pos)
  })
})


watch(() => gameStore.selectedUnitId, (newId, oldId) => {
  if (oldId) {
    unhighlightUnit(oldId)
    clearHighlights()
  }
  
  if (newId) {
    highlightUnit(newId)
    const unit = gameStore.units.find(u => u.unitId === newId)
    if (unit) {
      showMovementRange(unit.coords.x, unit.coords.y, 2)
    }
  }
})
</script>

<template>
  <div class="relative w-full h-full overflow-hidden bg-gray-900">
    <canvas 
      ref="canvasRef" 
      class="block"
    ></canvas>
  </div>
</template>

<style scoped>
canvas {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
