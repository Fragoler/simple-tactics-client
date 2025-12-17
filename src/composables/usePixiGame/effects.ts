import { Graphics } from 'pixi.js'
import { state } from './index'
import { CellSize } from './constants'
import type { Position } from '@/types/unit'


export async function drawProjectile(
  from: Position,
  to: Position,
  duration: number
): Promise<void> {
  if (!state.unitLayer.value) return

  const projectile = new Graphics()
  projectile.circle(0, 0, CellSize * 0.1).fill({ color: 0xffff00 })

  const startX = (from.x + 0.5) * CellSize
  const startY = (from.y + 0.5) * CellSize
  const endX = (to.x + 0.5) * CellSize
  const endY = (to.y + 0.5) * CellSize

  projectile.x = startX
  projectile.y = startY

  state.unitLayer.value.addChild(projectile)

  await animateProjectile(projectile, startX, startY, endX, endY, duration)

  projectile.removeFromParent()
  projectile.destroy()
}

async function animateProjectile(
  projectile: Graphics,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      projectile.x = startX + (endX - startX) * progress
      projectile.y = startY + (endY - startY) * progress

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        requestAnimationFrame(() => resolve())
      }
    }

    animate()
  })
}


export async function drawMeleeAttack(
  unitId: number,
  duration: number,
  targetUnitId: number
): Promise<void> {
  const container = state.unitContainers.value.get(targetUnitId)
  if (!container || container.destroyed) return

  const slashEffect = new Graphics()
  
  slashEffect
    .moveTo(-CellSize * 0.3, -CellSize * 0.3)
    .lineTo(CellSize * 0.3, CellSize * 0.3)
    .stroke({ width: CellSize * 0.1, color: 0xff0000 })

  slashEffect.x = container.x
  slashEffect.y = container.y
  slashEffect.alpha = 0

  state.unitLayer.value?.addChild(slashEffect)

  await animateMeleeSlash(slashEffect, duration)

  slashEffect.removeFromParent()
  slashEffect.destroy()
}

async function animateMeleeSlash(
  slash: Graphics,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      if (progress < 0.3) {
        slash.alpha = progress / 0.3
      } else {
        slash.alpha = 1 - ((progress - 0.3) / 0.7)
      }

      slash.rotation = progress * Math.PI

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        requestAnimationFrame(() => resolve())
      }
    }

    animate()
  })
}

export async function drawExplosion(
  center: Position,
  radius: number,
  duration: number
): Promise<void> {
  if (!state.unitLayer.value) return

  const explosion = new Graphics()
  
  const centerX = (center.x + 0.5) * CellSize
  const centerY = (center.y + 0.5) * CellSize

  explosion.x = centerX
  explosion.y = centerY

  state.unitLayer.value.addChild(explosion)

  await animateExplosion(explosion, radius * CellSize, duration)

  explosion.removeFromParent()
  explosion.destroy()
}

async function animateExplosion(
  explosion: Graphics,
  maxRadius: number,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const currentRadius = maxRadius * progress
      const alpha = 1 - progress

      explosion.clear()
      explosion
        .circle(0, 0, currentRadius)
        .fill({ color: 0xff4500, alpha: alpha * 0.8 })
      
      explosion
        .circle(0, 0, currentRadius * 0.6)
        .fill({ color: 0xffd700, alpha: alpha })

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        requestAnimationFrame(() => resolve())
      }
    }

    animate()
  })
}

export async function drawDamageHit(
  targetUnitId: number,
  duration: number
): Promise<void> {
  const container = state.unitContainers.value.get(targetUnitId)
  if (!container || container.destroyed) return


  const hitEffect = new Graphics()
  hitEffect
    .circle(0, 0, CellSize * 0.4)
    .fill({ color: 0xff0000, alpha: 0.5 })

  hitEffect.x = container.x
  hitEffect.y = container.y

  state.unitLayer.value?.addChild(hitEffect)

  await animateDamageEffect(hitEffect, duration)

  hitEffect.removeFromParent()
  hitEffect.destroy()
}

async function animateDamageEffect(
  effect: Graphics,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      effect.alpha = 1 - progress
      effect.scale.set(1 + progress * 0.5)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        requestAnimationFrame(() => resolve())
      }
    }

    animate()
  })
}


export async function drawHealEffect(
  targetUnitId: number,
  duration: number
): Promise<void> {
  const container = state.unitContainers.value.get(targetUnitId)
  if (!container || container.destroyed) return

  const healEffect = new Graphics()
  healEffect
    .circle(0, 0, CellSize * 0.4)
    .fill({ color: 0x00ff88, alpha: 0.5 })

  healEffect.x = container.x
  healEffect.y = container.y

  state.unitLayer.value?.addChild(healEffect)

  await animateHealEffect(healEffect, duration)

  healEffect.removeFromParent()
  healEffect.destroy()
}

async function animateHealEffect(
  effect: Graphics,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      effect.alpha = 0.7 - progress * 0.7
      effect.scale.set(1 + progress * 0.3)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        requestAnimationFrame(() => resolve())
      }
    }

    animate()
  })
}


export async function animateUnitDeath(
  unitId: number,
  duration: number
): Promise<void> {
  const container = state.unitContainers.value.get(unitId)
  if (!container || container.destroyed)
    return

  return new Promise((resolve) => {
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      container.alpha = 1 - progress
      container.scale.set(1 - progress * 0.5)
      container.rotation = progress * Math.PI * 2

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        requestAnimationFrame(() => {
          resolve()
        })
      }
    }

    animate()
  })
}


export async function animateUnitMove(
  unitId: number,
  to: Position,
  duration: number
): Promise<void> {
  const container = state.unitContainers.value.get(unitId)
  if (!container || container.destroyed) return

  const targetX = (to.x + 0.5) * CellSize
  const targetY = (to.y + 0.5) * CellSize

  return new Promise((resolve) => {
    const startX = container.x
    const startY = container.y
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easeProgress = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      container.x = startX + (targetX - startX) * easeProgress
      container.y = startY + (targetY - startY) * easeProgress

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        requestAnimationFrame(() => resolve())
      }
    }

    animate()
  })
}
