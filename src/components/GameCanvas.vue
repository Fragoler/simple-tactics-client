<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePixiGame } from '@/composables/usePixiGame'

const canvasRef = ref<HTMLCanvasElement>()

const pixi = usePixiGame()

onMounted(async () => {
  if (!canvasRef.value) return
  
  await pixi.initApp(canvasRef.value)
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
