import { Type, Static } from '@sinclair/typebox'
import { PersonShortSchema } from '../../schemas/people/person-short.schema'

// Type.Intersect = extends en TypeBox

export const PersonDetailSchema = Type.Intersect([
  PersonShortSchema,
  Type.Object({
    name: Type.String({ description: 'Nom complet' }),

    gender: Type.Optional(Type.Integer()),

    biography: Type.Optional(Type.String()),

    birthDay: Type.Optional(Type.String({ format: 'date' })),
    deathDay: Type.Optional(Type.Union([Type.String({ format: 'date' }), Type.Null()])),

    birthPlace: Type.Optional(Type.String()),

    homepage: Type.Optional(Type.Union([Type.String({ format: 'uri' }), Type.Null()])),

    popularity: Type.Optional(Type.Number()),

    wikiDescription: Type.Optional(Type.String())
  })
])

export type Person = Static<typeof PersonDetailSchema>
export type People = Static<typeof PersonDetailSchema>[]
