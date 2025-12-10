import { useGameStore } from '@/stores/gameStore'
import type { Position, Unit } from '@/types/unit'
import { FederatedPointerEvent } from 'pixi.js'
import { usePixiGame } from './usePixiGame'
import { useActionSystem } from './useActionSystem'
import { useActionStore } from '@/stores/actionStore'



export function useGameInput() {

  function setupInputHandlers() {
    const pixi = usePixiGame()

    if (!pixi.app.value) return

    pixi.app.value.canvas.addEventListener('contextmenu', (e) => e.preventDefault())


    pixi.app.value.stage.on('pointerdown', handleStageClick)
    pixi.app.value.stage.on('pointermove', handlePointerMove)
  }

  function removeInputHandlers() {
    const { app } = usePixiGame()

    if (!app.value) return
    
    app.value.stage.off('click', handleStageClick)
    app.value.stage.off('pointermove', handlePointerMove)
  }

  function handleStageClick(event: FederatedPointerEvent) {
    event.preventDefault()
    
    const pixi = usePixiGame()
    const pos = pixi.screenToGrid(event.globalX, event.globalY)
    
    switch (event.button)
    {
      case 0:
        onLeftClick(pos)
        break
      case 1:
      case 2:
        onRightClick(pos)
        break
      default: 
        console.error("Unknown button clicked!", event.button)
    }
  }

  function handlePointerMove(event: FederatedPointerEvent) {
    const pixi = usePixiGame()
    const actionSystem = useActionSystem()

    const pos = pixi.screenToGrid(event.globalX, event.globalY)
    actionSystem.handleTargetFromPointer(pos)
  }

    function onLeftClick(pos: Position) {
    const gameStore = useGameStore()
    const actionStore = useActionStore()

    const selectedUnit = gameStore.selectedUnit
    
    if (!selectedUnit || 
        !actionStore.selectedAction || 
        actionStore.getUnitScheduledAction(selectedUnit.unitId)?.confirmed)
      unitSelection(pos)
    else 
      confirmAction(pos, selectedUnit)

  }

  function onRightClick(pos: Position) {
    const gameStore = useGameStore()
    const actionStore = useActionStore()
    const selectedUnit = gameStore.selectedUnit

    if (selectedUnit && 
        actionStore.getUnitScheduledAction(selectedUnit.unitId)?.confirmed)
      actionStore.unconfirmAction(selectedUnit.unitId)
    else
      unitSelection(pos)
  }

  function unitSelection(pos: Position)
  {
    const gameStore = useGameStore()

    const unit = findUnitAt(pos)
    if (!unit && gameStore.selectedUnit)
      gameStore.deselectUnit()
    else if (unit)
      selectUnit(pos)
  }

  function selectUnit(pos: Position) {
    const gameStore = useGameStore()

    const unit = findUnitAt(pos)
    if (unit)
      gameStore.selectUnit(unit.unitId)
  }

  function confirmAction(pos: Position, unit: Unit) {
    const actionSystem = useActionSystem()
    const actionStore = useActionStore()

    if (!actionSystem.canConfirmWithTarget(pos))
      return 

    actionStore.confirmAction(unit.unitId)
  }


  function findUnitAt(pos: Position): Unit | null {
    const gameStore = useGameStore()
    return gameStore.units.find(u => 
      u.coords.x === pos.x && u.coords.y === pos.y
    ) || null
  }

  return {
    setupInputHandlers,
    removeInputHandlers
  }
}
