import fs from 'fs'
import path from 'path'
import { TmdbProductionCompany } from './tmdb.types'
import { Company } from '../../schemas/company.schema'
import { IEntityProvider } from '../EntityProvider'

export class TmdbFileCompanyProvider implements IEntityProvider<Company> {
  constructor(
    private jsonFile: string,
    private assetsDir: string
  ) {}

  async enrich<Company>(company: Company): Promise<Company> {
    return company
  }

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
