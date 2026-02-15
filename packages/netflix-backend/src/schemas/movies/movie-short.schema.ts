import { Type, Static } from '@sinclair/typebox'

export const MovieShortSchema = Type.Object({
  id: Type.Integer(),

  title: Type.String(),

  categories: Type.Array(Type.Integer()),

  // ⚠ index contient juste l'année
  releaseYear: Type.Integer({
    // <-- changer Type.String => Type.Integer
    description: 'Année de sortie',
    examples: [1999, 2010]
  }),

  tagLine: Type.Optional(Type.String()),

  trailerSource: Type.Optional(Type.String()),

  isLocal: Type.Boolean()
})

export type MovieShort = Static<typeof MovieShortSchema>
