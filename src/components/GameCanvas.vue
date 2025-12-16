<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { usePixiGame } from '@/composables/usePixiGame'
import { useActionSystem } from '@/composables/useActionSystem'
import { useActionHighlight } from '@/composables/useActionHighlight'
import { useEffectSystem } from '@/composables/useEffectSystem'

const canvasRef = ref<HTMLCanvasElement>()
const pixi = usePixiGame()
const actions = useActionSystem()
const highlights = useActionHighlight()
const effects = useEffectSystem()

onMounted(async () => {
  if (!canvasRef.value) return

  highlights.init()
  actions.init()
  effects.init()
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
