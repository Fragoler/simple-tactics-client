import { Container, Graphics } from 'pixi.js'
import type { Unit } from '@/types/unit'
import { state } from './index'
import { getPolygonPoints } from './utils'
import { getPlayerColor, ColorVars, getCSSColor } from '@/assets/colors'
import { CellSize, UnitParams } from './constants'
import { useActionStore } from '@/stores/actionStore'

export function addUnit(unit: Unit) {
  if (!state.isLayersInitialized) return
  
  const container = new Container()

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
  const actionStore = useActionStore()

  const container = state.unitContainers.value.get(unit.unitId) as Container<any>
  const unitOutline = container.children[childId] as Graphics
  unitOutline.clear()

  const radius = UnitParams.radius
  const strokeWidth = UnitParams.strokeWidth

  const color = actionStore.unitHasAction(unit.unitId) 
    ? getPlayerColor(unit.playerId)
    : getCSSColor(ColorVars.general.nonplayer)     

  // TODO: REFACTOR THIS!!!
  if (unit.sprite === 'circle') {
    unitOutline
      .circle(0, 0, radius)
      .stroke({ width: strokeWidth, color: color })
  } else {
    const sides = unit.sprite === 'triangle' ? UnitParams.triangleSides : UnitParams.squareSides
    const points = getPolygonPoints(sides, radius)
    unitOutline
      .poly(points)
      .stroke({ width: strokeWidth, color: color })
  }

  return unitOutline
}

function updateUnitFill(unit: Unit, childId: number = 0): Graphics {
  const container = state.unitContainers.value.get(unit.unitId) as Container<any>
  const unitFill = container.children[childId] as Graphics
  unitFill.clear()

  const healthPercent = Math.max(0, Math.min(1, unit.curHealth / unit.maxHealth))
  const radius = UnitParams.radius
  const fillRadius = radius * healthPercent
  const color = getPlayerColor(unit.playerId)

  // TODO: REFACTOR THIS!!!
  if (unit.sprite === 'circle') {
    unitFill
      .circle(0, 0, fillRadius)
      .fill({ color: color })
  } else {
    const sides = unit.sprite === 'triangle' ? UnitParams.triangleSides : UnitParams.squareSides
    const points = getPolygonPoints(sides, fillRadius)
    unitFill
      .poly(points)
      .fill({ color: color })
  }

  return unitFill
}

export function updateUnit(unit: Unit) {
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

export function removeUnit(unitId: number) {
  const container = state.unitContainers.value.get(unitId) as Container<any>
  if (!container)
    return 
  
  state.unitContainers.value.delete(unitId)

  if (!container.destroyed)
  {
    container.removeFromParent()
    container.destroy(true)
  }
}

export function syncUnits(newUnits: Unit[]) {
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
