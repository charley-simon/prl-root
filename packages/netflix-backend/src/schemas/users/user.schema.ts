import { Type, Static } from '@sinclair/typebox'

export const UserPreferencesSchema = Type.Object({
  favoriteCategories: Type.Array(Type.Integer()),
  minYear: Type.Optional(Type.Integer()),
  sortBy: Type.Optional(
    Type.Union([Type.Literal('rating'), Type.Literal('year'), Type.Literal('title')])
  ),
  sortOrder: Type.Optional(Type.Union([Type.Literal('asc'), Type.Literal('desc')]))
})

export const UserSchema = Type.Object({
  id: Type.Integer(),
  name: Type.String(),
  password: Type.String(),
  isAdmin: Type.Boolean(),
  preferences: Type.Optional(UserPreferencesSchema)
})

export type User = Static<typeof UserSchema>
export type UserPreferences = Static<typeof UserPreferencesSchema>
