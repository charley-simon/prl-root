import { Type, Static } from '@sinclair/typebox'
import { MovieShortSchema } from '../movies/movie-short.schema'

// Type.Intersect = extends en TypeBox

export const MovieDetailSchema = Type.Intersect([
  MovieShortSchema,
  Type.Object({
    title: Type.String({ description: 'Titre du film', examples: ['Matrix', 'Inception'] }),
    releaseYear: Type.Integer({
      // <-- changer Type.String => Type.Integer
      description: 'Année de sortie',
      examples: [1999, 2010]
    }),
    originalTitle: Type.Optional(Type.String()),
    budget: Type.Optional(Type.Number()),
    revenue: Type.Optional(Type.Number()),
    categories: Type.Optional(Type.Array(Type.Integer())),
    synopsis: Type.Optional(Type.String()),
    tagLine: Type.Optional(Type.String()),
    popularity: Type.Optional(Type.Number()),
    rating: Type.Optional(Type.Number()),
    video: Type.Optional(
      Type.Object({
        localPath: Type.Optional(Type.String()),
        provider: Type.Optional(Type.String())
      })
    ),
    wikiDescription: Type.Optional(Type.String())
  })
])

export type Movie = Static<typeof MovieDetailSchema>
export type Movies = Static<typeof MovieDetailSchema>[]
