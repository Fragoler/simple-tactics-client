import { Container, Graphics } from 'pixi.js'
import type { Unit } from '@/types/unit'
import { state } from './index'
import { getPolygonPoints } from './utils'
import { useColorSystem } from '@/composables/useColorSystem'
import { CellSize, UnitParams } from './constants'
import { useGameStore } from '@/stores/gameStore'
import { markRaw } from 'vue'


function addUnit(unit: Unit) {
  if (!state.isLayersInitialized) return
  
  const container = markRaw(new Container())

  container.x = (unit.coords.x + 0.5) * CellSize
  container.y = (unit.coords.y + 0.5) * CellSize
  container.interactive = true
  container.cursor = 'pointer'

  container.addChild(new Graphics())
  container.addChild(new Graphics())

  state.unitLayer.value!.addChild(container)
  state.unitContainers.value.set(unit.unitId, container)

  updateUnitFill(unit)
  updateUnitOutline(unit)
}

function updateUnitOutline(unit: Unit, childId: number = 1): Graphics {
  const colors = useColorSystem()

  const container = state.unitContainers.value.get(unit.unitId) as Container<any>
  const unitOutline = container.children[childId] as Graphics
  unitOutline.clear()

  const radius = UnitParams.radius
  const strokeWidth = UnitParams.strokeWidth

  const color = colors.getUnitOutlineColor(unit.unitId)  

  // TODO: REFACTOR THIS!!!
  if (unit.sprite === 'Circle') {
    unitOutline
      .circle(0, 0, radius)
      .stroke({ width: strokeWidth, color: color })
  } else {
    const sides = unit.sprite === 'Triangle' ? UnitParams.triangleSides : UnitParams.squareSides
    const points = getPolygonPoints(sides, radius)
    unitOutline
      .poly(points)
      .stroke({ width: strokeWidth, color: color })
  }

  return unitOutline
}

function updateUnitFill(unit: Unit, childId: number = 0): Graphics {
  const colors = useColorSystem()

  const container = state.unitContainers.value.get(unit.unitId) as Container<any>
  const unitFill = container.children[childId] as Graphics
  unitFill.clear()

  const healthPercent = Math.max(0, Math.min(1, unit.curHealth / unit.maxHealth))
  const radius = UnitParams.radius
  const fillRadius = radius * healthPercent
  const color = colors.getPlayerColor(unit.playerId)

  // TODO: REFACTOR THIS!!!
  if (unit.sprite === 'Circle') {
    unitFill
      .circle(0, 0, fillRadius)
      .fill({ color: color })
  } else {
    const sides = unit.sprite === 'Triangle' ? UnitParams.triangleSides : UnitParams.squareSides
    const points = getPolygonPoints(sides, fillRadius)
    unitFill
      .poly(points)
      .fill({ color: color })
  }

  return unitFill
}

function updateUnit(unit: Unit) {
  const container = state.unitContainers.value.get(unit.unitId) as Container<any>
  if (!container) return

  const targetX = (unit.coords.x + 0.5) * CellSize
  const targetY = (unit.coords.y + 0.5) * CellSize

  animateMove(container, targetX, targetY)

  updateUnitFill(unit)
  updateUnitOutline(unit)
}

function animateMove(container: Container, targetX: number, targetY: number, duration = 300) {
  const startX = container.x
  const startY = container.y
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    container.x = startX + (targetX - startX) * progress
    container.y = startY + (targetY - startY) * progress

    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }

  animate()
}

function removeUnit(unitId: number) {
  console.log('[PixiJS removeUnit] Called for unit', unitId)


  const container = state.unitContainers.value.get(unitId) as Container<any>
  if (!container)
  {
    console.log('[PixiJS removeUnit] Container not found', unitId)
    return
  }
  
  state.unitContainers.value.delete(unitId)

  if (!container.destroyed)
  {
    console.log('[PixiJS removeUnit] Destroying container', unitId)
    container.removeFromParent()
    container.destroy(true)
  }
  else
  {
    console.log('[PixiJS removeUnit] Container already destroyed', unitId)
  }
}

function syncUnits(newUnits: Unit[]) {
  if (!state.isLayersInitialized) return

  const currentIds = new Set(newUnits.map((u) => u.unitId))
  for (const [id] of state.unitContainers.value) {
    if (!currentIds.has(id)) {
      removeUnit(id)
    }
  }

  for (const unit of newUnits) {
    if (state.unitContainers.value.has(unit.unitId)) {
      updateUnit(unit)
    } else {
      addUnit(unit)
    }
  }
}


export function requestAllUnitsUpdate()
{
  const gameStore = useGameStore()
  requestUnitsUpdate(gameStore.units)
}

export function requestUnitsUpdate(units: Unit[])
{
  if (state.isLayersInitialized) {
    syncUnits(units)
  }
}
