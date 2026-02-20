// src/providers/BaseFileProvider.ts  (pour tests / offline / replay)
import fs from 'fs'
import path from 'path'
import { Provider } from './Provider'

export abstract class BaseFileProvider implements Provider {
  abstract readonly name: string

  constructor(protected readonly basePath: string) {}

  protected async read<T>(filePath: string): Promise<T> {
    const fullPath = path.join(this.basePath, filePath)
    const raw = await fs.readFileSync(fullPath, 'utf-8')
    return JSON.parse(raw) as T
  }
}
