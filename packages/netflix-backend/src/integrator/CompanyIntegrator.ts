import { TmdbProductionCompany } from '../providers/tmdb/tmdb.types'

export interface Company {
  id: number
  name: string
  origin_country: string
  logo?: string
}

export class CompanyIntegrator {
  async integrate(company: TmdbProductionCompany, logoFile?: string): Promise<Company> {
    return {
      id: company.id,
      name: company.name,
      origin_country: company.origin_country,
      logo: logoFile || ''
    }
  }
}
