import { Graphics } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { state } from './index'
import { GameColors, getCellColor } from './colors'

export function drawBackground() {
  const gameStore = useGameStore()
  if (!gameStore.map || !state.backgroundLayer.value) return

  const bg = new Graphics()
  bg.rect(
    0,
    0,
    gameStore.map.width * state.cellSize,
    gameStore.map.height * state.cellSize
  ).fill({ color: GameColors.background })

  state.backgroundLayer.value.addChild(bg)
}

export function drawGrid() {
  const gameStore = useGameStore()
  if (!gameStore.map || !state.gridLayer.value) return

  const grid = new Graphics()
  const gridStrokeWidth = Math.max(1, state.cellSize * 0.02)

  // Вертикальные линии
  for (let x = 0; x <= gameStore.map.width; x++) {
    const xPos = x * state.cellSize
    grid.moveTo(xPos, 0)
    grid.lineTo(xPos, gameStore.map.height * state.cellSize)
  }

  // Горизонтальные линии
  for (let y = 0; y <= gameStore.map.height; y++) {
    const yPos = y * state.cellSize
    grid.moveTo(0, yPos)
    grid.lineTo(gameStore.map.width * state.cellSize, yPos)
  }

  grid.stroke({ width: gridStrokeWidth, color: GameColors.grid, alpha: 0.5 })
  state.gridLayer.value.addChild(grid)
}

export function drawBorder() {
  const gameStore = useGameStore()
  if (!gameStore.map || !state.gridLayer.value) return

  const border = new Graphics()
  const borderWidth = Math.max(3, state.cellSize * 0.06)

  border.rect(
    0,
    0,
    gameStore.map.width * state.cellSize,
    gameStore.map.height * state.cellSize
  ).stroke({ 
    width: borderWidth, 
    color: GameColors.player1, // Или другой цвет
    alpha: 1 
  })

  state.gridLayer.value.addChild(border)
}

export function drawMapCells() {
  const gameStore = useGameStore()
  if (!gameStore.map || !state.backgroundLayer.value) return

  const mapState = gameStore.map

  for (let y = 0; y < mapState.height; y++) {
    for (let x = 0; x < mapState.width; x++) {
      const cellValue = 0

      if (cellValue !== 0) {
        const cellGraphics = new Graphics()
        const cellColor = getCellColor(cellValue)

        cellGraphics
          .rect(
            x * state.cellSize,
            y * state.cellSize,
            state.cellSize,
            state.cellSize
          )
          .fill({ color: cellColor, alpha: 0.5 })

        state.backgroundLayer.value.addChild(cellGraphics)
      }
    }
  }
}
