import { ref, watch } from 'vue'
import { Application, Container } from 'pixi.js'
import { useGameStore } from '@/stores/gameStore'
import { initializeLayers } from './layers'
import { drawMap } from './rendering'
import { requestAllUnitsUpdate, requestUnitsUpdate } from './units'
import { clearHighlights, clearTargetHighlights, drawHighlights } from './highlights'
import { screenToGrid } from './utils'
import { useColorSystem } from '@/composables/useColorSystem'
import { CellSize } from './constants'
import { useGameInput } from '../useGameInput'
import { Unit } from '@/types/unit'

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

  async function initApp(canvasElement: HTMLCanvasElement) {
    const colors = useColorSystem()
    const input = useGameInput()

    if (state.app.value) return

    state.app.value = new Application()

    await state.app.value.init({
      canvas: canvasElement,
      width: 100,
      height: 100,
      backgroundColor: colors.getCSSColor(colors.ColorVars.general.background),
      antialias: true,
      resolution: window.devicePixelRatio || 1,
    })

    state.app.value.stage.interactive = true
    state.app.value.stage.hitArea = state.app.value.screen

    setupWatchers()
    input.setupInputHandlers()
  }

  function setupWatchers() {
    const gameStore = useGameStore()

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
      (newUnits: Unit[]) => {
        console.log('Units changed:', newUnits)
        requestUnitsUpdate(newUnits)
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
    const gameStore = useGameStore()
  
    if (!state.app.value || !gameStore.map) return

    const newWidth = gameStore.map.width * CellSize
    const newHeight = gameStore.map.height * CellSize

    console.log('Canvas size:', newWidth, 'x', newHeight)

    state.app.value.renderer.resize(newWidth, newHeight)
    state.app.value.stage.hitArea = state.app.value.screen
  }

  function destroy() {
    const input = useGameInput()

    if (state.app.value) {
      state.app.value.destroy(true)
      state.app.value = null
    }
    
    state.unitContainers.value.clear()
    state.isLayersInitialized = false
    input.removeInputHandlers()
  }

  return {
    app: state.app,
    initApp,
    drawMap,

    drawHighlights,
    clearHighlights,
    clearTargetHighlights,
    
    screenToGrid,
    destroy,

    requestUnitsUpdate,
    requestAllUnitsUpdate,
  }
}
