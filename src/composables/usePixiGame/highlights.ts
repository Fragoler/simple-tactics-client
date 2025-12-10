// highlights.ts
import { FillGradient, Graphics } from 'pixi.js'
import { HighlightType } from '@/types/action'
import { state } from './index'
import { useColorSystem, ColorConfig } from '@/composables/useColorSystem'
import { CellSize, UnitParams } from './constants'
import { Position } from '@/types/unit'

const targetGraph = new Map<string, Graphics[]>()
const executorGraph = new Map<string, Graphics[]>()
const selectedGraph = new Graphics()

export function initHighlight()
{
  state.highlightLayer.value?.addChild(selectedGraph)
}

export function highlightUnit(unitId: number) {
  const container = state.unitContainers.value.get(unitId)
  if (!container || container.destroyed) {
    console.error("Container is invalid")
    return
  }

  unhighlightUnit()

  const outerRadius = UnitParams.radius * 2 

  const gradient = new FillGradient({
    type: 'radial',
    center: { x: 0.5, y: 0.5 },       
    innerRadius: 0.0,                    
    outerCenter: { x: 0.5, y: 0.5 },   
    outerRadius: 0.5,                  
    colorStops: [
        { offset: 0,   color: '#00ff00f0' }, 
        { offset: 0.3, color: '#00ff0090' },  
        { offset: 0.7, color: '#00ff0050' },  
        { offset: 1,   color: '#00ff0000' }
    ],
    textureSpace: 'local'
  })

  selectedGraph.circle(0, 0, outerRadius)
               .fill(gradient)

  selectedGraph.x = container.x
  selectedGraph.y = container.y

}

export function unhighlightUnit() {
  selectedGraph.clear()
}

export function drawHighlights(positions: Position[], type: HighlightType, target: boolean) {
  const colors = useColorSystem()

  const color = colors.getActionHighlightColor(type)
  if (!color) return
  if (!state.highlightLayer.value) return

  const graphs: Map<string, Graphics[]> = target ? targetGraph : executorGraph

  for (const pos of positions) {
    const highlight = drawHighlightCell(pos, color, type)

    state.highlightLayer.value.addChild(highlight)
    
    const key = `${pos.x}-${pos.y}-${type}`
    const existing = graphs.get(key) || []
    graphs.set(key, [...existing, highlight])
  }
}

export function clearTargetHighlights() {
  for (const [, highlights] of targetGraph) {
    highlights.forEach(highlight => {
      try {
      highlight.removeFromParent()
      highlight.destroy()
    } catch {}
    })
  }

  targetGraph.clear()
}

export function clearHighlights() {
  for (const [, highlights] of targetGraph) {
    highlights.forEach(highlight => {
      try {
      highlight.removeFromParent()
      highlight.destroy()
    } catch {}
    })
  }

  for (const [, highlights] of executorGraph) {
    highlights.forEach(highlight => {
      try {
      highlight.removeFromParent()
      highlight.destroy()
      } catch {}
    })
  }

  executorGraph.clear()
  targetGraph.clear()
}

function drawHighlightCell(pos: Position, color: ColorConfig, type: HighlightType): Graphics
{
  const highlight = new Graphics()

  if (type === 'Movement')
    return highlight
           .rect(
             (pos.x + 0.375) * CellSize,
             (pos.y + 0.375) * CellSize,
             CellSize * 0.25,
             CellSize * 0.25
           )
           .fill(color)

  else
  {
    return highlight
           .rect(
             (pos.x + 0.1) * CellSize,
             (pos.y + 0.1) * CellSize,
             CellSize * 0.8,
             CellSize * 0.8
           )
           .stroke({alpha: color.alpha, color: color.color, width: CellSize * 0.02})
  }



}