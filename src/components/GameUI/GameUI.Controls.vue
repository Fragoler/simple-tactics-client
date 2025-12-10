<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useActionStore } from '@/stores/actionStore'
import { useActionSystem } from '@/composables/useActionSystem'
import { ActionDefinition } from '@/types/action'

const gameStore = useGameStore()
const actionStore = useActionStore()
const actionSystem = useActionSystem()

const actions = computed(() => {
  if (!gameStore.selectedUnit ||
      !gameStore.isMyUnitSelected) 
      return []
  
      return actionStore.getActionsForUnit(gameStore.selectedUnit.unitId)
})

const getButtonClass = (action : ActionDefinition) => {
  if (actionStore.selectedAction?.id !== action.id)
    return'bg-gray-700 text-white hover:bg-gray-600'
    
  if (!actionStore.isSelectedActionConfirmed)
    return 'bg-primary text-black ring-2 ring-cyan-400'

  return 'bg-secondary text-black ring-2 ring-cyan-400'
}

function onActionClick(actionId: string) {
  if (!gameStore.selectedUnit ||
      !gameStore.isMyUnitSelected)
    return

  const action = actionStore.getUnitScheduledAction(gameStore.selectedUnit.unitId)

  if (action?.actionId === actionId &&
      !actionStore.isUnitActionConfirmed(gameStore.selectedUnit.unitId) &&
      actionSystem.canBeConfirmedWithButton(actionId))
    actionStore.confirmAction(gameStore.selectedUnit.unitId)
  else
    actionSystem.selectAction(actionId)
}

const hasUnitsWithoutConfirmed = computed(() => {
  return gameStore.units.some(
    u => u.playerId === gameStore.myPlayerId &&
        (!actionStore.unitHasAction(u.unitId) || !actionStore.getUnitScheduledAction(u.unitId)?.confirmed)
  )
})



function undoAction() {
  if (!gameStore.selectedUnit) return

  actionStore.cancelAction(gameStore.selectedUnit.unitId)
}

function endTurn() {
  gameStore.prepareEndTurn()
}

</script>



<template>
  <div class="bg-gray-900 p-3 rounded-lg border border-gray-700">

    <!-- Row : Controls -->
    <div class="grid grid-cols-2 gap-2 mb-2">
      <button
        @click="undoAction"
        :disabled="!gameStore.selectedUnit || 
                   !actionStore.unitHasAction(gameStore.selectedUnit.unitId)"
        class="bg-gray-700 text-white text-xs font-semibold py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        ↶ Отменить
      </button>

      <button
        @click="endTurn"
        :disabled="hasUnitsWithoutConfirmed || gameStore.myPlayer?.isReady"
        :title="hasUnitsWithoutConfirmed ? 'Все юниты должны иметь действие' : ''"
        class="bg-primary text-black text-xs font-bold py-2 rounded hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        ✓ Завершить ход
      </button>
    </div>

    <!-- Row : Unit action -->
    <div v-if="!gameStore.myPlayer?.isReady"
      class="grid grid-cols-3 gap-2">
      <button
        v-for="action in actions"
        :key="action.id"
        @click="onActionClick(action.id)"
        :disabled="!gameStore.selectedUnit"
        :class="[
          'text-xs font-bold py-2 rounded transition-all', getButtonClass(action),
        ]"
      >
        {{ action.icon }} <!--{{ action.name }} -->
      </button>
    </div>
  </div>
</template>