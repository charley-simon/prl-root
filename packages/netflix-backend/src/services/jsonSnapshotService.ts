import fs from 'fs/promises'
import path from 'path'

export class JsonSnapshotService {
  constructor(private baseDir: string) {}

  private filePath(name: string) {
    return path.join(this.baseDir, name)
  }

  async save(name: string, data: unknown) {
    const file = this.filePath(name)
    await fs.mkdir(path.dirname(file), { recursive: true })
    await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
  }

  async load<T>(name: string): Promise<T> {
    const file = this.filePath(name)
    const raw = await fs.readFile(file, 'utf-8')
    return JSON.parse(raw) as T
  }
}
