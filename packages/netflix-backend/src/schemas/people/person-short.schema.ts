import { Type, Static } from '@sinclair/typebox'

export const PersonShortSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String(),
  gender: Type.Optional(Type.Integer()),
  popularity: Type.Optional(Type.Number())
})

export type PersonShort = Static<typeof PersonShortSchema>;