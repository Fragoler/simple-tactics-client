import { ref, onUnmounted, watch } from 'vue'
import type { Position } from '@/types/unit'
import { Application, Container } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { initializeLayers } from './layers'
import { drawMap } from './rendering'
import { syncUnits } from './units'
import { highlightUnit, unhighlightUnit, showMovementRange, clearHighlights } from './highlights'
import { screenToGrid } from './utils'
import { GameColors } from '@/assets/colors'
import { CellSize } from './constants'

export const state = {
  app:             ref<Application | null>(null),
  unitContainers:  ref(new Map<number, Container>()),
  highlightLayer:  ref<Container>(),
  gridLayer:       ref<Container>(),
  backgroundLayer: ref<Container>(),
  unitLayer:       ref<Container>(), 
  isLayersInitialized: false
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
        if (state.app.value == null)
          return 

        console.log('Map changed:', newMapState)
        
        if (!state.isLayersInitialized) {
          initializeLayers(state.app.value as Application)
          state.isLayersInitialized = true
        }
        
        updateField()
      },
      { deep: true, immediate: true }
    )

    watch(
      () => gameStore.units,
      (newUnits) => {
        console.log('Units changed:', newUnits)
        if (state.isLayersInitialized) {
          syncUnits(newUnits, gameStore)
        }
      },
      { deep: true, immediate: true }
    )
  }

  function updateField() {
    console.log('Update field')
    
    resize()
    drawMap()
  }

  function resize() {
    if (!state.app.value || !gameStore.map) return

    const newWidth = gameStore.map.width * CellSize
    const newHeight = gameStore.map.height * CellSize

    console.log('Canvas size:', newWidth, 'x', newHeight)

    state.app.value.renderer.resize(newWidth, newHeight)
    state.app.value.stage.hitArea = state.app.value.screen
  }

  function onStageClick(callback: (pos: Position) => void) {
    if (!state.app.value) return

    state.app.value.stage.on('pointerdown', (event) => {
      callback(screenToGrid(event.globalX, event.globalY))
    })
  }

  function destroy() {
    if (state.app.value) {
      state.app.value.destroy(true)
      state.app.value = null
    }
    
    state.unitContainers.value.clear()
    state.isLayersInitialized = false
  }

  onUnmounted(() => {
    destroy()
  })

  return {
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
