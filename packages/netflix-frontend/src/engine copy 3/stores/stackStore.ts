// stackStore.ts (simplifié)
import type { Frame } from '../core/types'

export class StackStore {
  private frames: Frame[]

  constructor(initialFrames: Frame[]) {
    this.frames = initialFrames.map(f => ({ ...f }))
  }

  getFrames(): Frame[] {
    return this.frames
  }

  // Ajoute cette méthode pour corriger ton Resolver
  updateFrame(index: number, updatedFrame: Frame): void {
    this.frames[index] = updatedFrame
  }

  // Méthode pratique pour récupérer un contexte clé-valeur
  getContext(): Record<string, Frame> {
    const ctx: Record<string, Frame> = {}
    this.frames.forEach(f => {
      if (f.id != null) ctx[f.id] = f
    })
    return ctx
  }
}
