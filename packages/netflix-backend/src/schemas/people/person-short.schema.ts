import { Type, Static } from '@sinclair/typebox'
import { EntitySchema } from '../entity.schema'

export const PersonShortSchema = Type.Intersect([
  EntitySchema,
  Type.Object({
    name: Type.String(),
    gender: Type.Optional(Type.Integer()),
    popularity: Type.Optional(Type.Number())
  })
])

export type PersonShort = Static<typeof PersonShortSchema>
