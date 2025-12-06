import { Graphics } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { state } from './index'
import { GameColors, getCellColor } from './colors'
import { CellSize } from './constants'

export function drawMap() {
  const gameStore = useGameStore()

  if (!state.backgroundLayer.value || !state.gridLayer.value) {
    console.log('Cannot draw map - missing dependencies')
    return
  }

  if (state.backgroundLayer.value) state.backgroundLayer.value.removeChildren()
  if (state.gridLayer.value) state.gridLayer.value.removeChildren()


  if (!gameStore.map)
    return

  console.log('Drawing map')

  drawBackground()
  drawGrid()
  drawBorder()
  drawMapCells()
}

function drawBackground() {
  const gameStore = useGameStore()

  if (!gameStore.map || !state.backgroundLayer.value) return

  const bg = new Graphics()
  bg.rect(
    0,
    0,
    gameStore.map.width * CellSize,
    gameStore.map.height * CellSize
  ).fill({ color: GameColors.background })

  state.backgroundLayer.value.addChild(bg)
}

function drawGrid() {
  const gameStore = useGameStore()
  
  if (!gameStore.map || !state.gridLayer.value) return

  const grid = new Graphics()
  const gridStrokeWidth = Math.max(1, CellSize * 0.02)

  // Vertical lines
  for (let x = 0; x <= gameStore.map.width; x++) {
    const xPos = x * CellSize
    grid.moveTo(xPos, 0)
    grid.lineTo(xPos, gameStore.map.height * CellSize)
  }

  // Horisontal lines
  for (let y = 0; y <= gameStore.map.height; y++) {
    const yPos = y * CellSize
    grid.moveTo(0, yPos)
    grid.lineTo(gameStore.map.width * CellSize, yPos)
  }

  grid.stroke({ width: gridStrokeWidth, color: GameColors.grid, alpha: 0.5 })
  state.gridLayer.value.addChild(grid)
}

function drawBorder() {
  const gameStore = useGameStore()
  if (!gameStore.map || !state.gridLayer.value) return

  const border = new Graphics()
  const borderWidth = Math.max(3, CellSize * 0.06)

  border.rect(
    0,
    0,
    gameStore.map.width * CellSize,
    gameStore.map.height * CellSize
  ).stroke({ 
    width: borderWidth, 
    color: GameColors.nonplayer, 
    alpha: 1 
  })

  state.gridLayer.value.addChild(border)
}

function drawMapCells() {
  const gameStore = useGameStore()
  if (!gameStore.map || !state.backgroundLayer.value) return

  const mapState = gameStore.map

  for (let y = 0; y < mapState.height; y++) {
    for (let x = 0; x < mapState.width; x++) {
      const cellValue = mapState.terrain[x][y]

      if (cellValue !== 0) {
        const cellGraphics = new Graphics()
        const cellColor = getCellColor(cellValue)

        cellGraphics
          .rect(
            x * CellSize,
            y * CellSize,
            CellSize,
            CellSize
          )
          .fill({ color: cellColor, alpha: 0.5 })

        state.backgroundLayer.value.addChild(cellGraphics)
      }
    }
  }
}
