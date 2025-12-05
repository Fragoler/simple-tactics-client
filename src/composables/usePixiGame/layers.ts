import { Container } from 'pixi.js'
import type { Application } from 'pixi.js'
import { state } from './index'

export function initializeLayers(app: Application) {
  state.backgroundLayer.value = new Container()
  state.gridLayer.value = new Container()
  state.highlightLayer.value = new Container()
  state.unitLayer.value = new Container()

  app.stage.addChild(state.backgroundLayer.value)
  app.stage.addChild(state.gridLayer.value)
  app.stage.addChild(state.highlightLayer.value)
  app.stage.addChild(state.unitLayer.value)
}
