import { Type, Static } from '@sinclair/typebox'

export const GenderSchema = Type.Union([
  Type.Literal(0), // Unknown
  Type.Literal(1), // Female
  Type.Literal(2)  // Male
])

export const PeopleIndexItemSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
  gender: GenderSchema,
  name: Type.String({ minLength: 1 })
})

export const PeopleIndexSchema = Type.Array(PeopleIndexItemSchema)

export type PeopleIndexItem = Static<typeof PeopleIndexItemSchema>
export type PeopleIndex = Static<typeof PeopleIndexSchema>
