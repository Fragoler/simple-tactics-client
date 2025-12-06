<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { usePixiGame } from '@/composables/usePixiGame'
import type { Position } from '@/types/unit'

const emit = defineEmits<{
  unitClick: [unitId: number]
  cellClick: [pos: Position]
}>()

const gameStore = useGameStore()
const canvasRef = ref<HTMLCanvasElement>()

const { 
  initApp,
  highlightUnit, 
  unhighlightUnit,
  showMovementRange,
  clearHighlights,
  onStageClick 
} = usePixiGame()

onMounted(async () => {
  if (!canvasRef.value) return
  
  await initApp(canvasRef.value)

  onStageClick((pos) => {
    emit('cellClick', pos)
  })
})

watch(() => gameStore.selectedUnit?.unitId, (newId, oldId) => {
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
  <div class="game-container">
    <canvas 
      ref="canvasRef" 
      class="game-canvas"
    ></canvas>
  </div>
</template>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  background-color: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.game-canvas {
  display: block;

  max-width: 100%;
  max-height: 100%;

  width: auto;
  height: auto;

  object-fit: contain;
}
</style>
