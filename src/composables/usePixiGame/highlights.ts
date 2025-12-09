// highlights.ts
import { Graphics } from 'pixi.js'
import { HighlightType } from '@/types/action'
import { state } from './index'
import { useColorSystem, ColorConfig } from '@/composables/useColorSystem'
import { CellSize } from './constants'
import { Position } from '@/types/unit'

const actionHighlights = new Map<string, Graphics>()

export function drawActionLayer(positions: Position[], type: HighlightType) {
  const colors = useColorSystem()

  const color = colors.getActionHighlightColor(type)
  if (!color) return

  if (!state.highlightLayer.value) return

  console.debug("Draw highlight for positions ", positions)

  for (const pos of positions) {
    const highlight = drawHighlightCell(pos, color, type)

    state.highlightLayer.value.addChild(highlight)
    actionHighlights.set(`${pos.x}-${pos.y}-${type}`, highlight)
  }
}

export function clearActionHighlights() {
  for (const [, highlight] of actionHighlights) {
    try {
      highlight.removeFromParent()
      highlight.destroy()
    } catch {

    }
  }
  actionHighlights.clear()
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