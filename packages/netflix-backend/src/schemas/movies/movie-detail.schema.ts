import { Type, Static } from '@sinclair/typebox'

export const MovieDetailSchema = Type.Object({
  id: Type.Integer({ description: 'Identifiant unique du film', examples: [1, 2, 3] }),
  title: Type.String({ description: 'Titre du film', examples: ['Matrix', 'Inception'] }),
  originalTitle: Type.Optional(Type.String()),
  budget: Type.Optional(Type.Number()),
  revenue: Type.Optional(Type.Number()),
  categories: Type.Array(Type.Integer()),
  releaseYear: Type.Integer({
    // <-- changer Type.String => Type.Integer
    description: 'Année de sortie',
    examples: [1999, 2010]
  }),
  synopsis: Type.Optional(Type.String()),
  tagLine: Type.Optional(Type.String()),
  popularity: Type.Optional(Type.Number()),
  rating: Type.Optional(Type.Number()),
  isLocal: Type.Boolean(),
  movieSource: Type.Optional(Type.String())
})

export type Movie = Static<typeof MovieDetailSchema>
