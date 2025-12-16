<script setup lang="ts">
import { onUnmounted } from 'vue'
import { useSignalR } from './composables/useSignalR'
import GameCanvas from './components/GameCanvas.vue'
import GameUI from './components/GameUI/GameUI.vue';

const { disconnect } = useSignalR()

onUnmounted(() => {
  disconnect()
})

</script>

<template>
  <div class="flex h-screen bg-black p-5 gap-5">
    <!-- Canvas Container -->
    <div class="flex-1 flex items-center justify-center min-w-0 min-h-0">
      <div class="canvas-wrapper">
        <GameCanvas />
      </div>
    </div>
  
    <!-- UI Panel -->
    <div class="w-80 flex-shrink-0">
      <GameUI />
    </div>
  </div>
</template>

<style scoped>
.canvas-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: calc(100vw - 400px);
  max-height: calc(100vh - 40px);
  border: 2px solid rgb(var(--color-primary) / 1);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0 20px rgb(var(--color-primary) / 0.5);
}
</style>
