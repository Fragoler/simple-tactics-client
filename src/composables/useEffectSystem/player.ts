import { watch } from 'vue'
import { useEffectStore } from '@/stores/effectStore'

let isInitialized = false


export async function playNext() {
  const effectStore = useEffectStore()

  if (effectStore.isPlaying) return
  if (!effectStore.hasEffects) return



  const effect = effectStore.dequeueEffect()
  if (!effect)
    return

  console.debug("Play effect", effect)
  effectStore.setPlaying(true)

  try {
    await effect.doEffect()
  } catch (error) {
    console.error('Error executing effect:', error)
  } finally {
    effectStore.setPlaying(false)
    
    if (effectStore.hasEffects) {
      await new Promise(resolve => setTimeout(resolve, 0))
      playNext()
    }
  }
}

export function initPlayer() {
  if (isInitialized) return

  const effectStore = useEffectStore()

  watch(
    () => effectStore.queue.length,
    (newLength) => {
      if (newLength > 0 && !effectStore.isPlaying) {
        playNext()
      }
    }
  )

  watch(
    () => effectStore.isPlaying,
    (playing) => {
      if (!playing && effectStore.hasEffects) {
        playNext()
      }
    }
  )

  isInitialized = true
}

