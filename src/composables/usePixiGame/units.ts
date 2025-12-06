import { Container, Graphics } from 'pixi.js'
import type { Unit } from '@/types/unit'
import { state } from './index'
import { getPolygonPoints } from './utils'
import { getPlayerColor } from './colors'
import { UnitSizes } from './constants'

export function addUnit(unit: Unit, onClick: (unit: Unit) => void) {
  if (!state.app.value || !state.isFieldInitialized) return

  const color = getPlayerColor(unit.playerId)
  const container = new Container()

  container.x = (unit.coords.x + 0.5) * state.cellSize
  container.y = (unit.coords.y + 0.5) * state.cellSize
  container.interactive = true
  container.cursor = 'pointer'

  const unitFill = createHealthFill(unit, color)
  const unitOutline = createUnitOutline(unit, color)

  container.addChild(unitFill)
  container.addChild(unitOutline)

  container.on('pointerdown', (e) => {
    e.stopPropagation()
    onClick(unit)
  })

  state.unitLayer.value?.addChild(container)
  state.unitContainers.value.set(unit.unitId, container)
}

function createUnitOutline(unit: Unit, color: number): Graphics {
  const unitOutline = new Graphics()
  const radius = UnitSizes.radius
  const strokeWidth = UnitSizes.strokeWidth

  if (unit.sprite === 'circle') {
    unitOutline
      .circle(0, 0, radius)
      .stroke({ width: strokeWidth, color: color })
  } else {
    const sides = unit.sprite === 'triangle' ? UnitSizes.triangleSides : UnitSizes.squareSides
    const points = getPolygonPoints(sides, radius)
    unitOutline
      .poly(points)
      .stroke({ width: strokeWidth, color: color })
  }

  return unitOutline
}

function createHealthFill(unit: Unit, color: number): Graphics {
  const healthFill = new Graphics()
  const healthPercent = Math.max(0, Math.min(1, unit.curHealth / unit.maxHealth))
  const radius = UnitSizes.radius
  
  const maxFillRadius = radius - UnitSizes.strokeWidth
  const fillRadius = maxFillRadius * healthPercent + 1

  if (unit.sprite === 'circle') {
    healthFill
      .circle(0, 0, fillRadius)
      .fill({ color: color, alpha: 0.8 })
  } else {
    const sides = unit.sprite === 'triangle' ? UnitSizes.triangleSides : UnitSizes.squareSides
    const points = getPolygonPoints(sides, fillRadius)
    healthFill
      .poly(points)
      .fill({ color: color, alpha: 0.8 })
  }

  return healthFill
}

export function updateUnit(unit: Unit) {
  const container = state.unitContainers.value.get(unit.unitId) as Container<any>
  if (!container) return

  const targetX = (unit.coords.x + 0.5) * state.cellSize
  const targetY = (unit.coords.y + 0.5) * state.cellSize

  animateMove(container, targetX, targetY)

  const oldFill = container.children[0] as Graphics
  const oldOutline = container.children[1] as Graphics
  const color = getPlayerColor(unit.playerId)

  container.removeChild(oldFill)
  container.removeChild(oldOutline)
  oldFill.destroy()
  oldOutline.destroy()

  const newFill = createHealthFill(unit, color)
  const newOutline = createUnitOutline(unit, color)
  
  container.addChild(newFill)
  container.addChild(newOutline)
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
  if (container) {
    container.removeFromParent()
    container.destroy(true)
    state.unitContainers.value.delete(unitId)
  }
}

export function syncUnits(newUnits: Unit[], gameStore: any) {
  if (!state.isFieldInitialized) return

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
      addUnit(unit, (clickedUnit) => {
        gameStore.selectUnit(clickedUnit.unitId)
      })
    }
  }
}
