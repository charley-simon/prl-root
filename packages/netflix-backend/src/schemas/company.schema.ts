import { Type, Static } from '@sinclair/typebox'

export const CompanySchema = Type.Object({
  id: Type.String(),
  logo_path: Type.String(),
  name: Type.String(),
  origin_country: Type.String()
})

export type Company = Static<typeof CompanySchema>
export type companies = Static<typeof CompanySchema>[]
