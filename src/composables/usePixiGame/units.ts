import { Container, Graphics } from 'pixi.js'
import type { Unit } from '@/types/unit'
import { state } from './index'
import { getPolygonPoints } from './utils.ts'

export function addUnit(unit: Unit, onClick: (unit: Unit) => void) {
  if (!state.app.value || !state.config || !state.isFieldInitialized) return

  const color = unit.playerId === 1 ? state.config.colors.player1 : state.config.colors.player2
  const container = new Container()

  container.x = (unit.coords.x + 0.5) * state.config.cellSize
  container.y = (unit.coords.y + 0.5) * state.config.cellSize
  container.interactive = true
  container.cursor = 'pointer'

  // Внешний контур
  const unitOutline = createUnitOutline(unit, color)
  // Внутренняя заполненная часть
  const unitFill = createHealthFill(unit, color)

  container.addChild(unitOutline)
  container.addChild(unitFill)

  container.on('pointerdown', (e) => {
    e.stopPropagation()
    onClick(unit)
  })

  state.unitLayer.value?.addChild(container)
  state.unitContainers.value.set(unit.unitId, container)
}

function createUnitOutline(unit: Unit, color: number): Graphics {
  const unitOutline = new Graphics()

  if (unit.sprite === 'circle') {
    unitOutline
      .circle(0, 0, 20)
      .stroke({ width: 2, color: color })
      .fill({ color: color, alpha: 0.2 })
  } else {
    const unitConfig = state.config!.unitSprites[unit.sprite]
    const points = getPolygonPoints(unitConfig.sides, unitConfig.radius)
    unitOutline
      .poly(points)
      .stroke({ width: 2, color: color })
      .fill({ color: color, alpha: 0.2 })
  }

  return unitOutline
}

function createHealthFill(unit: Unit, color: number): Graphics {
  const healthFill = new Graphics()
  const healthPercent = unit.health / unit.maxHealth

  if (unit.sprite === 'circle') {
    const radius = 20 * healthPercent
    healthFill.circle(0, 0, radius).fill({ color: color, alpha: 0.8 })
  } else {
    const unitConfig = state.config!.unitSprites[unit.sprite]
    const scaledRadius = unitConfig.radius * healthPercent
    const points = getPolygonPoints(unitConfig.sides, scaledRadius)
    healthFill.poly(points).fill({ color: color, alpha: 0.8 })
  }

  return healthFill
}

export function updateUnit(unit: Unit) {
  if (!state.config) return

  const container = state.unitContainers.value.get(unit.unitId) as Container<any>
  if (!container) return

  const targetX = (unit.coords.x + 0.5) * state.config.cellSize
  const targetY = (unit.coords.y + 0.5) * state.config.cellSize

  animateMove(container, targetX, targetY)

  // Обновляем заполнение HP
  const oldFill = container.children[1] as Graphics
  const color = unit.playerId === 1 ? state.config.colors.player1 : state.config.colors.player2

  container.removeChild(oldFill)
  oldFill.destroy()

  const newFill = createHealthFill(unit, color)
  container.addChildAt(newFill, 1)
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
  if (!state.config || !state.isFieldInitialized) return

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
