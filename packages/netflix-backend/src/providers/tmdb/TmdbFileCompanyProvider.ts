import fs from 'fs'
import path from 'path'
import { TmdbProductionCompany } from './tmdb.types'

export class TmdbFileCompanyProvider {
  constructor(
    private jsonFile: string,
    private assetsDir: string
  ) {}

  async getAllCompanies(): Promise<TmdbProductionCompany[]> {
    const raw = await fs.promises.readFile(this.jsonFile, 'utf-8')
    return JSON.parse(raw) as TmdbProductionCompany[]
  }

  async getLogo(id: number): Promise<ArrayBuffer> {
    const logoPath = path.join(this.assetsDir, `${id}-logo.png`)
    const buffer = await fs.promises.readFile(logoPath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }
}
