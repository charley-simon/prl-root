import { Type, Static } from '@sinclair/typebox'

export const MoviePeopleSchema = Type.Object({
  id: Type.Integer(),
  movieId: Type.Integer(),
  peopleId: Type.Integer(),
  jobId: Type.Integer(),
  // metadata de liaison
  options: Type.Optional(Type.String())
})

export const MoviePeopleListSchema = Type.Array(MoviePeopleSchema)

export type MoviePeople = Static<typeof MoviePeopleSchema>
export type MoviePeopleList = Static<typeof MoviePeopleListSchema>
export type Link = Static<typeof MoviePeopleSchema>
export type Links = Static<typeof MoviePeopleListSchema>
