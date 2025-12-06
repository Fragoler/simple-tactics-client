import { ref, onUnmounted, watch } from 'vue'
import type { Position, Unit } from '@/types/unit'
import { Application, Container } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { initializeLayers } from './layers'
import { drawBackground, drawGrid, drawMapCells, drawBorder } from './rendering'
import { syncUnits } from './units'
import { highlightUnit, unhighlightUnit, showMovementRange, clearHighlights } from './highlights'
import { screenToGrid } from './utils'
import { GameColors } from './colors'

export const state = {
  app: ref<Application | null>(null),
  unitContainers: ref(new Map<number, Container>()),
  highlightLayer: ref<Container>(),
  gridLayer: ref<Container>(),
  backgroundLayer: ref<Container>(),
  unitLayer: ref<Container>(),
  cellSize: 50, 
  isFieldInitialized: false
}

export function usePixiGame() {
  const gameStore = useGameStore()

  async function initApp(canvasElement: HTMLCanvasElement) {
    if (state.app.value) return

    console.log('Background color:', GameColors.background)

    if (isNaN(GameColors.background)) {
      console.error('CSS colors not loaded properly!')
      return
    }

    state.app.value = new Application()

    await state.app.value.init({
      canvas: canvasElement,
      width: 100,
      height: 100,
      backgroundColor: GameColors.background,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })

    state.app.value.stage.interactive = true
    state.app.value.stage.hitArea = state.app.value.screen

    setupWatchers(gameStore)
  }

  function setupWatchers(gameStore: any) {
    watch(
      () => gameStore.map,
      (newMapState) => {
        console.log('Map changed:', newMapState)
        if (newMapState && !state.isFieldInitialized) {
          initializeField()
        } else if (newMapState && state.isFieldInitialized) {
          redrawField()
        }
      },
      { deep: true, immediate: true }
    )

    watch(
      () => gameStore.units,
      (newUnits) => {
        console.log('Units changed:', newUnits)
        if (state.isFieldInitialized) {
          syncUnits(newUnits, gameStore)
        }
      },
      { deep: true, immediate: true }
    )
  }

  function initializeField() {
    if (!state.app.value || !gameStore.map) return

    console.log('Initializing field')

    initializeLayers(state.app.value as Application)
    resize()
    drawMap()

    state.isFieldInitialized = true
  }

  function redrawField() {
    if (!state.isFieldInitialized) return

    console.log('Redrawing field')
    resize()
    
    if (state.backgroundLayer.value) state.backgroundLayer.value.removeChildren()
    if (state.gridLayer.value) state.gridLayer.value.removeChildren()
    
    drawMap()
  }

  function resize() {
    if (!state.app.value || !gameStore.map) return

    // ✅ Просто устанавливаем размер на основе карты и фиксированного cellSize
    const newWidth = gameStore.map.width * state.cellSize
    const newHeight = gameStore.map.height * state.cellSize

    console.log('Canvas size:', newWidth, 'x', newHeight)

    state.app.value.renderer.resize(newWidth, newHeight)
    state.app.value.stage.hitArea = state.app.value.screen
  }

  function drawMap() {
    if (!state.backgroundLayer.value || !state.gridLayer.value || !gameStore.map) {
      console.log('Cannot draw map - missing dependencies')
      return
    }

    console.log('Drawing map')

    drawBackground()
    drawGrid()
    drawBorder()
    drawMapCells()
  }

  function onStageClick(callback: (pos: Position) => void) {
    if (!state.app.value) return

    state.app.value.stage.on('pointerdown', (event) => {
      const pos = event.data.global
      const gridPos = screenToGrid(pos.x, pos.y)
      callback(gridPos)
    })
  }

  function destroy() {
    if (state.app.value) {
      state.app.value.destroy(true)
      state.app.value = null
    }
    
    state.unitContainers.value.clear()
    state.isFieldInitialized = false
  }

  onUnmounted(() => {
    destroy()
  })

  return {
    app: state.app,
    initApp,
    drawMap,
    highlightUnit,
    unhighlightUnit,
    showMovementRange,
    clearHighlights,
    screenToGrid,
    onStageClick,
    destroy
  }
}
