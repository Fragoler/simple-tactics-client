export const CellSize = 50

export const UnitParams = {
  radius: CellSize * 0.4,
  strokeWidth: Math.max(2, CellSize * 0.04),

  triangleSides: 3,
  squareSides: 4,

  moveDuration: 300,
  fillAlpha: 0.8,
} as const


export const MoveRangeHighlightsParams = {
  CoordsOffset: 0.375,
  Side: CellSize * 0.25,
  Alpha: 0.3
}
