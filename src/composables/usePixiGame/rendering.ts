import { Graphics, Container } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { state } from './index'

export function drawBackground() {
  const gameStore = useGameStore()
  if (!state.config || !gameStore.map || !state.backgroundLayer.value) return

  const bg = new Graphics()
  bg.rect(
    0,
    0,
    gameStore.map.width * state.config.cellSize,
    gameStore.map.height * state.config.cellSize
  ).fill({ color: 0x1a1a2e })

  state.backgroundLayer.value.addChild(bg)
}

export function drawGrid() {
  const gameStore = useGameStore()
  if (!state.config || !gameStore.map || !state.gridLayer.value) return

  const grid = new Graphics()

  for (let x = 0; x <= gameStore.map.width; x++) {
    const xPos = x * state.config.cellSize
    grid.moveTo(xPos, 0)
    grid.lineTo(xPos, gameStore.map.height * state.config.cellSize)
  }

  for (let y = 0; y <= gameStore.map.height; y++) {
    const yPos = y * state.config.cellSize
    grid.moveTo(0, yPos)
    grid.lineTo(gameStore.map.width * state.config.cellSize, yPos)
  }

  grid.stroke({ width: 1, color: state.config.colors.grid, alpha: 0.5 })
  state.gridLayer.value.addChild(grid)
}

export function drawMapCells() {
  const gameStore = useGameStore()
  if (!gameStore.map || !state.config || !state.backgroundLayer.value) return

  const mapState = gameStore.map

  for (let y = 0; y < mapState.height; y++) {
    for (let x = 0; x < mapState.width; x++) {
      const cellValue = 0

      if (cellValue !== 0) {
        const cellGraphics = new Graphics()
        const cellColor = getCellColor(cellValue)

        cellGraphics
          .rect(
            x * state.config.cellSize,
            y * state.config.cellSize,
            state.config.cellSize,
            state.config.cellSize
          )
          .fill({ color: cellColor, alpha: 0.5 })

        state.backgroundLayer.value.addChild(cellGraphics)
      }
    }
  }
}

function getCellColor(value: number): number {
  switch (value) {
    case 1:
      return 0x2d4a2b
    case 2:
      return 0x4a2d2d
    case 3:
      return 0x2d3a4a
    default:
      return 0x1a1a2e
  }
}
