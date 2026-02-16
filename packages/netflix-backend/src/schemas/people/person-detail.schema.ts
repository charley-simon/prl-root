import { Type, Static } from '@sinclair/typebox'

export const PersonDetailSchema = Type.Object({
  id: Type.Integer({ description: 'Identifiant unique de la personne' }),
  name: Type.String({ description: 'Nom complet' }),

  gender: Type.Optional(Type.Integer()),

  biography: Type.Optional(Type.String()),

  birthDay: Type.Optional(Type.String({ format: 'date' })),
  deathDay: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),

  birthPlace: Type.Optional(Type.String()),

  homepage: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()])),

  popularity: Type.Optional(Type.Number()),

  externalIds: Type.Optional(Type.Record(Type.String(), Type.String()))
})

export type Person = Static<typeof PersonDetailSchema>
