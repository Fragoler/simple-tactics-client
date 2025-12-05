import { ref, onUnmounted, watch } from 'vue'
import type { GameConfig } from '@/types/game'
import type { Position, Unit } from '@/types/unit'
import { Application, Container, Graphics } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'

const app = ref<Application | null>(null)
const unitContainers = ref(new Map<number, Container>())
const highlightLayer = ref<Container>()
const gridLayer = ref<Container>()
const backgroundLayer = ref<Container>()
const unitLayer = ref<Container>()

let config: GameConfig | null = null
let isFieldInitialized = false

export function usePixiGame() {
  const gameStore = useGameStore()

  async function initApp(canvasElement: HTMLCanvasElement) {
    if (app.value) return

    app.value = new Application()

    await app.value.init({
      canvas: canvasElement,
      width: 100, 
      height: 100,
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })

    app.value.stage.interactive = true
    app.value.stage.hitArea = app.value.screen


    watch(
      () => gameStore.map,
      (newMapState) => {
        console.log('Map changed:', newMapState)
        if (newMapState && config && !isFieldInitialized) {
          initializeField()
        } else if (newMapState && config && isFieldInitialized) {
          redrawField() 
        }
      },
      { deep: true, immediate: true }
    )

    watch(
      () => gameStore.units,
      (newUnits) => {
        console.log('Units changed:', newUnits)
        if (isFieldInitialized) {
          syncUnits(newUnits)
        }
      },
      { deep: true, immediate: true }
    )
  }

  function setConfig(newConfig: GameConfig) {
    config = newConfig
    console.log('Config set:', config)

    if (app.value && config && gameStore.map && !isFieldInitialized) {
      initializeField()
    }
  }
  
  function initializeField() {
    if (!app.value || !config || !gameStore.map) return

    console.log('Initializing field')

    // Создаём слои
    backgroundLayer.value = new Container()
    gridLayer.value = new Container()
    highlightLayer.value = new Container()
    unitLayer.value = new Container()

    app.value.stage.addChild(backgroundLayer.value)
    app.value.stage.addChild(gridLayer.value)
    app.value.stage.addChild(highlightLayer.value)
    app.value.stage.addChild(unitLayer.value)

    resize()
    drawMap()
    
    isFieldInitialized = true
  }

  function redrawField() {
    if (!isFieldInitialized) return
    
    console.log('Redrawing field')
    resize()
    drawMap()
  }

  function resize() {
    if (app.value == null || gameStore.map == null || config == null)
      return

    console.log('Resizing to:', gameStore.map.width, gameStore.map.height)
    
    app.value.renderer.resize(
      gameStore.map.width * config.cellSize,
      gameStore.map.height * config.cellSize
    )
    app.value.stage.hitArea = app.value.screen
  }

  function drawMap() {
    if (!config || !backgroundLayer.value || !gridLayer.value || !gameStore.map) {
      console.log('Cannot draw map - missing dependencies')
      return
    }

    console.log('Drawing map')

    backgroundLayer.value.removeChildren()
    gridLayer.value.removeChildren()

    drawBackground(backgroundLayer.value)
    drawGrid(gridLayer.value)
    drawMapCells()
  }

  function drawMapCells() {
    if (!gameStore.map || !config || !backgroundLayer.value) return

    const mapState = gameStore.map

    for (let y = 0; y < mapState.height; y++) {
      for (let x = 0; x < mapState.width; x++) {
        const cellValue = 0
        
        if (cellValue !== 0) {
          const cellGraphics = new Graphics()
          const cellColor = getCellColor(cellValue)
          
          cellGraphics
            .rect(
              x * config.cellSize,
              y * config.cellSize,
              config.cellSize,
              config.cellSize
            )
            .fill({ color: cellColor, alpha: 0.5 })

          backgroundLayer.value.addChild(cellGraphics)
        }
      }
    }
  }

  function syncUnits(newUnits: Unit[]) {
    if (!config || !isFieldInitialized) return

    const currentIds = new Set(newUnits.map(u => u.unitId))
    for (const [id] of unitContainers.value) {
      if (!currentIds.has(id)) {
        removeUnit(id)
      }
    }

    for (const unit of newUnits) {
      if (unitContainers.value.has(unit.unitId)) {
        updateUnit(unit)
      } else {
        addUnit(unit, (clickedUnit) => {
          gameStore.selectUnit(clickedUnit.unitId)
        })
      }
    }
  }

  function getCellColor(value: number): number {
    switch (value) {
      case 1: return 0x2d4a2b
      case 2: return 0x4a2d2d
      case 3: return 0x2d3a4a
      default: return 0x1a1a2e
    }
  }

  function drawBackground(container: Container) {
    if (!config || gameStore.map == null) return

    const bg = new Graphics()
    bg.rect(0, 0, 
            gameStore.map.width * config.cellSize, 
            gameStore.map.height * config.cellSize)
      .fill({ color: 0x1a1a2e })
      
    container.addChild(bg)
  }

  function drawGrid(container: Container) {
    if (!config || gameStore.map == null) return

    const grid = new Graphics()
    
    for (let x = 0; x <= gameStore.map.width; x++) {
      const xPos = x * config.cellSize
      grid.moveTo(xPos, 0)
      grid.lineTo(xPos, gameStore.map.height * config.cellSize)
    }

    for (let y = 0; y <= gameStore.map.height; y++) {
      const yPos = y * config.cellSize
      grid.moveTo(0, yPos)
      grid.lineTo(gameStore.map.width * config.cellSize, yPos)
    }

    grid.stroke({ width: 1, color: config.colors.grid, alpha: 0.5 })
    container.addChild(grid)
  }

  function addUnit(unit: Unit, onClick: (unit: Unit) => void) {
  if (!app.value || !config || !isFieldInitialized) return

  const color = unit.playerId === 1 ? config.colors.player1 : config.colors.player2
  const container = new Container()
  
  container.x = (unit.coords.x + 0.5) * config.cellSize
  container.y = (unit.coords.y + 0.5) * config.cellSize
  container.interactive = true
  container.cursor = 'pointer'

  // ✅ Внешний контур (полупрозрачный)
  const unitOutline = new Graphics()
  
  if (unit.sprite === 'circle') {
    unitOutline
      .circle(0, 0, 20)
      .stroke({ width: 2, color: color })
      .fill({ color: color, alpha: 0.2 }) // Слабое заполнение
  } else {
    const unitConfig = config.unitSprites[unit.sprite]
    const points = getPolygonPoints(unitConfig.sides, unitConfig.radius)
    unitOutline
      .poly(points)
      .stroke({ width: 2, color: color })
      .fill({ color: color, alpha: 0.2 })
  }

  // ✅ Внутренняя заполненная часть (зависит от HP)
  const unitFill = createHealthFill(unit, color)

  container.addChild(unitOutline)
  container.addChild(unitFill)

  container.on('pointerdown', (e) => {
    e.stopPropagation()
    onClick(unit)
  })

  unitLayer.value?.addChild(container)
  unitContainers.value.set(unit.unitId, container)
}

// ✅ Создание заполненной части в зависимости от HP
function createHealthFill(unit: Unit, color: number): Graphics {
  const healthFill = new Graphics()
  const healthPercent = unit.health / unit.maxHealth
  
  if (unit.sprite === 'circle') {
    // Для круга - уменьшаем радиус
    const radius = 20 * healthPercent
    healthFill
      .circle(0, 0, radius)
      .fill({ color: color, alpha: 0.8 })
  } else {
    // Для многоугольников - уменьшаем размер
    const unitConfig = config!.unitSprites[unit.sprite]
    const scaledRadius = unitConfig.radius * healthPercent
    const points = getPolygonPoints(unitConfig.sides, scaledRadius)
    healthFill
      .poly(points)
      .fill({ color: color, alpha: 0.8 })
  }
  
  return healthFill
}

function updateUnit(unit: Unit) {
  if (!config) return

  const container = unitContainers.value.get(unit.unitId) as Container<any>
  if (!container) return

  const targetX = (unit.coords.x + 0.5) * config.cellSize
  const targetY = (unit.coords.y + 0.5) * config.cellSize
  
  animateMove(container, targetX, targetY)

  const oldFill = container.children[1] as Graphics
  const color = unit.playerId === 1 ? config.colors.player1 : config.colors.player2
  
  container.removeChild(oldFill)
  oldFill.destroy()

  const newFill = createHealthFill(unit, color)
  container.addChildAt(newFill, 1) 
}


  function getPolygonPoints(sides: number, radius: number): number[] {
    const points: number[] = []
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 2
      points.push(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius
      )
    }
    return points
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
    const container = unitContainers.value.get(unitId) as Container<any>
    if (container) {
      container.removeFromParent()
      container.destroy(true)
      unitContainers.value.delete(unitId)
    }
  }

  function highlightUnit(unitId: number) {
    const container = unitContainers.value.get(unitId) as Container<any>
    if (container) {
      container.scale.set(1.2)
    }
  }

  function unhighlightUnit(unitId: number) {
    const container = unitContainers.value.get(unitId) as Container<any>
    if (container) {
      container.scale.set(1)
    }
  }

  function showMovementRange(centerX: number, centerY: number, range: number) {
    if (!config || gameStore.map == null || !isFieldInitialized) return

    clearHighlights()
    if (!highlightLayer.value) return

    for (let dx = -range; dx <= range; dx++) {
      for (let dy = -range; dy <= range; dy++) {
        const distance = Math.abs(dx) + Math.abs(dy)
        if (distance > 0 && distance <= range) {
          const x = centerX + dx
          const y = centerY + dy

          if (x >= 0 && x < gameStore.map.width && y >= 0 && y < gameStore.map.height) {
            const highlight = new Graphics()

            highlight
              .rect(x * config.cellSize, y * config.cellSize, config.cellSize, config.cellSize)
              .fill({ color: config.colors.highlight, alpha: 0.3 })

            highlightLayer.value.addChild(highlight)
          }
        }
      }
    }
  }

  function clearHighlights() {
    highlightLayer.value?.removeChildren()
  }

  function screenToGrid(screenX: number, screenY: number): Position {
    if (!config) return { x: 0, y: 0 }

    return {
      x: Math.floor(screenX / config.cellSize),
      y: Math.floor(screenY / config.cellSize)
    }
  }

  function onStageClick(callback: (pos: Position) => void) {
    if (!app.value) return

    app.value.stage.on('pointerdown', (event) => {
      const pos = event.data.global
      const gridPos = screenToGrid(pos.x, pos.y)
      callback(gridPos)
    })
  }

  function destroy() {
    if (app.value) {
      app.value.destroy(true)
      app.value = null
    }
    unitContainers.value.clear()
    isFieldInitialized = false
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    app,
    initApp,
    setConfig,
    drawMap,
    addUnit,
    updateUnit,
    removeUnit,
    highlightUnit,
    unhighlightUnit,
    showMovementRange,
    clearHighlights,
    screenToGrid,
    onStageClick,
    destroy
  }
}
