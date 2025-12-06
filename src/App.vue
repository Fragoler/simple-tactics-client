<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore.ts'
import { useSignalR } from '@/composables/useSignalR.ts'
import GameCanvas from './components/GameCanvas.vue'
import GameUI from './components/GameUI/GameUI.vue';


const gameStore = useGameStore()
const { connect, disconnect } = useSignalR()

onMounted(async () => {
  
})

onUnmounted(() => {
  disconnect()
})

//#region handle player actions
function handleUnitClick(unitId: number) {
  const unit = gameStore.units.find((u: { unitId: number; }) => u.unitId === unitId)
  
  if (unit && unit.playerId === gameStore.myPlayerId) {
    if (gameStore.selectedUnit?.unitId === unitId) {
      gameStore.deselectUnit()
    } else {
      gameStore.selectUnit(unitId)
    }
  }
}

// async function handleCellClick(pos: Position) {
//   if (!gameStore.selectedUnit) return
//   if (!gameStore.isMyTurn) {
//     gameStore.addLog('⚠️ Сейчас не ваш ход!', 'warning')
//     return
//   }

//   try {
//     await sendUnitAction({
//       unitId: gameStore.selectedUnit.unitId,
//       actionType: 'move',
//       targetX: pos.x,
//       targetY: pos.y
//     })
    
//     gameStore.deselectUnit()
//   } catch (error) {
//     console.error('Move error:', error)
//   }
// }

// async function handleEndTurn() {
//   if (!gameStore.isMyTurn) return
  
//   try {
//     gameStore.deselectUnit()
//     await endTurn()
//   } catch (error) {
//     console.error('End turn error:', error)
//   }
// }
//#endregion
</script>

<template>
  <div class="flex h-screen bg-black p-5 gap-5">
    <!-- Canvas Container -->
    <div class="flex-1 flex items-center justify-center min-w-0 min-h-0">
      <div class="canvas-wrapper">
        <GameCanvas 
          @unit-click="handleUnitClick"
        />
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
  max-width: calc(100vw - 400px); /* 80 (UI panel) + отступы */
  max-height: calc(100vh - 40px); /* padding сверху и снизу */
  border: 2px solid rgb(var(--color-primary) / 1);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0 20px rgb(var(--color-primary) / 0.5);
}
</style>
