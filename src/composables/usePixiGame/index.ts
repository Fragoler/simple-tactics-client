import { ref, onUnmounted, watch } from 'vue'
import { Application, Container } from 'pixi.js'

import type { GameConfig } from '@/types/game'
import type { Position, Unit } from '@/types/unit'
import { useGameStore } from '@/stores/gameStore'

import { initializeLayers } from './layers.ts'
import { drawBackground, drawGrid, drawMapCells } from './rendering.ts'
import { addUnit, updateUnit, removeUnit, syncUnits } from './units.ts'
import { highlightUnit, unhighlightUnit, showMovementRange, clearHighlights } from './highlights.ts'
import { screenToGrid } from './utils.ts'


// Global canvas state
export const state = {
  app: ref<Application | null>(null),
  unitContainers: ref(new Map<number, Container>()),
  highlightLayer: ref<Container>(),
  gridLayer: ref<Container>(),
  backgroundLayer: ref<Container>(),
  unitLayer: ref<Container>(),
  config: null as GameConfig | null,
  isFieldInitialized: false
}


export function usePixiGame() {
  const gameStore = useGameStore()

  async function initApp(canvasElement: HTMLCanvasElement) {
    if (state.app.value) return

    state.app.value = new Application()

    await state.app.value.init({
      canvas: canvasElement,
      width: 100,
      height: 100,
      backgroundColor: 0x1a1a2e,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })

    state.app.value.stage.interactive = true
    state.app.value.stage.hitArea = state.app.value.screen

    setupWatchers(gameStore)
  }

  function setupWatchers(gameStore: any) {
    // Отслеживание карты
    watch(
      () => gameStore.map,
      (newMapState) => {
        console.log('Map changed:', newMapState)
        if (newMapState && state.config && !state.isFieldInitialized) {
          initializeField()
        } else if (newMapState && state.config && state.isFieldInitialized) {
          redrawField()
        }
      },
      { deep: true, immediate: true }
    )

    // Отслеживание юнитов
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

  function setConfig(newConfig: GameConfig) {
    state.config = newConfig
    console.log('Config set:', state.config)

    if (state.app.value && state.config && gameStore.map && !state.isFieldInitialized) {
      initializeField()
    }
  }

  function initializeField() {
    if (!state.app.value || !state.config || !gameStore.map) return

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
    drawMap()
  }

  function resize() {
    if (!state.app.value || !gameStore.map || !state.config) return

    console.log('Resizing to:', gameStore.map.width, gameStore.map.height)

    state.app.value.renderer.resize(
      gameStore.map.width * state.config.cellSize,
      gameStore.map.height * state.config.cellSize
    )
    state.app.value.stage.hitArea = state.app.value.screen
  }

  function drawMap() {
    if (!state.config || !state.backgroundLayer.value || !state.gridLayer.value || !gameStore.map) {
      console.log('Cannot draw map - missing dependencies')
      return
    }

    console.log('Drawing map')

    state.backgroundLayer.value.removeChildren()
    state.gridLayer.value.removeChildren()

    drawBackground()
    drawGrid()
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
    setConfig,
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
