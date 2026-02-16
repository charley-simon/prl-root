import { Type, Static } from '@sinclair/typebox'

export const MovieExternalIdsSchema = Type.Optional(
  Type.Object({
    tmdb: Type.Number(),
    imdb: Type.Optional(Type.String()),
    wikidata: Type.Optional(Type.String())
  })
)

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
  video: Type.Optional(
    Type.Object({
      localPath: Type.Optional(Type.String()),
      provider: Type.Optional(Type.String())
    })
  ),
  externalsIds: MovieExternalIdsSchema
})

export type MovieExternalIds = Static<typeof MovieExternalIdsSchema>
export type Movie = Static<typeof MovieDetailSchema>
