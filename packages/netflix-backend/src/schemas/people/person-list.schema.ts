import { Type, Static } from '@sinclair/typebox'
import { PersonShortSchema } from './person-short.schema'

export const PersonListSchema = Type.Object({
  items: Type.Array(PersonShortSchema),
  total: Type.Integer(),
  page: Type.Optional(Type.Integer()),
  pageSize: Type.Optional(Type.Integer())
})

