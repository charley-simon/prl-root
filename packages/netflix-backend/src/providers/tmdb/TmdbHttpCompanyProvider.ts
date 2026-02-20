import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { TmdbProductionCompany } from './tmdb.types'
import { Company } from '../../schemas/company.schema'
import { IEntityProvider } from '../EntityProvider'

export class TmdbHttpCompanyProvider implements IEntityProvider<Company> {
  constructor(private token: string) {}

  async enrich<Company>(movie: Company): Promise<Company> {
    return movie
  }

  private get headers() {
    return { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
  }

  private async getImageData(filePath: string): Promise<ArrayBuffer> {
    const url = `https://image.tmdb.org/t/p/original${filePath}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Cannot fetch image ${filePath}`)
    return await res.arrayBuffer()
  }

  async saveCompaniesSnapshot(
    companies: TmdbProductionCompany[],
    jsonFile: string,
    assetsDir: string
  ) {
    await fs.promises.mkdir(assetsDir, { recursive: true })
    await fs.promises.writeFile(jsonFile, JSON.stringify(companies, null, 2))

    for (const company of companies) {
      if (!company.logo_path) continue
      const buffer = await this.getImageData(company.logo_path)
      const fileName = path.join(assetsDir, `${company.id}-logo.png`)
      await fs.promises.writeFile(fileName, Buffer.from(buffer))
    }
  }
}
