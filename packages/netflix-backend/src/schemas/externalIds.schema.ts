import { Type, Static } from '@sinclair/typebox'

export const ExternalIdsSchema = Type.Optional(
  Type.Object({
    tmdb: Type.Optional(Type.Integer()),
    imdb: Type.Optional(Type.String()),
    wikidata: Type.Optional(Type.String())
  })
)

export type ExternalIds = Static<typeof ExternalIdsSchema>
