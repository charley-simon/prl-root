import { Type, Static } from '@sinclair/typebox'
import { MovieShortSchema } from './movie-short.schema'

export const MovieListSchema = Type.Array(MovieShortSchema)

export type MovieList = Static<typeof MovieListSchema>
