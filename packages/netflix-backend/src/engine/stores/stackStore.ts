import type { Frame } from './types'

export class StackStore {
  private frames: Frame[]

  constructor(initialFrames: Frame[]) {
    this.frames = [...initialFrames]
  }

  getFrames(): Frame[] {
    return this.frames
  }

  updateFrame(index: number, frame: Frame): void {
    this.frames[index] = frame
  }
}
