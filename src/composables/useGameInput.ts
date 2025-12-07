import { watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import type { Position, Unit } from '@/types/unit'
import { FederatedPointerEvent } from 'pixi.js'
import { usePixiGame } from './usePixiGame'



export function useGameInput() {

  function setupInputHandlers() {
    const { app } = usePixiGame()

    if (!app.value) return

    app.value.stage.on('pointerdown', handleStageClick)
    app.value.stage.on('rightclick', handleRightClick)
    app.value.stage.on('pointermove', handlePointerMove)
  }

  function handleStageClick(event: FederatedPointerEvent) {
    const { screenToGrid } = usePixiGame()

    const pos = screenToGrid(event.globalX, event.globalY)
    const unit = findUnitAt(pos)
    
    if (unit) {
      onUnitClick(unit)
    } else {
      onEmptyCellClick(pos)
    }
  }

  function handleRightClick(event: FederatedPointerEvent) {
    const { screenToGrid } = usePixiGame()
    const gameStore = useGameStore()

    event.preventDefault()
    
    const pos = screenToGrid(event.globalX, event.globalY)
    const unit = findUnitAt(pos)
    
    if (unit && gameStore.selectedUnit) {
      // Атака
      console.log('Attack', unit.unitId)
    }
  }

  function handlePointerMove(event: FederatedPointerEvent) {
    const { screenToGrid } = usePixiGame()

    const pos = screenToGrid(event.globalX, event.globalY)
    
    //TODO: Show action preview
  }

  function findUnitAt(pos: Position): Unit | null {
    const gameStore = useGameStore()
    return gameStore.units.find(u => 
      u.coords.x === pos.x && u.coords.y === pos.y
    ) || null
  }

  function onUnitClick(unit: Unit) {
    const gameStore = useGameStore()
    if (gameStore.selectedUnit?.unitId === unit.unitId) {
      gameStore.deselectUnit()
    } else {
      gameStore.selectUnit(unit.unitId)
    }
  }

  function onEmptyCellClick(pos: Position) {
    const gameStore = useGameStore()
    const selectedUnit = gameStore.selectedUnit
    
    if (!selectedUnit) {
      return
    }
    
    const distance = Math.abs(selectedUnit.coords.x - pos.x) + 
                    Math.abs(selectedUnit.coords.y - pos.y)
    
    // if (distance > 0 && distance <= (selectedUnit. || 2)) {
    //   // Валидное перемещение
    //   //gameStore.moveUnit(selectedUnit.unitId, pos)
    // } else {
    //   // Клик вне досягаемости - сбрасываем выбор
    //   gameStore.deselectUnit()
    // }
  }

  function removeInputHandlers() {
    const { app } = usePixiGame()

    if (!app.value) return
    
    app.value.stage.off('pointerdown', handleStageClick)
    app.value.stage.off('rightclick', handleRightClick)
    app.value.stage.off('pointermove', handlePointerMove)
  }

  return {
    setupInputHandlers,
    removeInputHandlers
  }
}
