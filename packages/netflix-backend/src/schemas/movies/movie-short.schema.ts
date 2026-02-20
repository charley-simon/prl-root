import { Type, Static } from '@sinclair/typebox'
import { EntitySchema } from '../entity.schema'

// Type.Intersect = extends en TypeBox

export const MovieShortSchema = Type.Intersect([
  EntitySchema,
  Type.Object({
    title: Type.String(),
    // ⚠ index contient juste l'année
    releaseYear: Type.Optional(
      Type.Integer({
        // <-- changer Type.String => Type.Integer
        description: 'Année de sortie',
        examples: [1999, 2010]
      })
    ),

    categories: Type.Optional(Type.Array(Type.Integer())),
    tagLine: Type.Optional(Type.String()),
    trailerSource: Type.Optional(Type.String()),
    isLocal: Type.Optional(Type.Boolean())
  })
])

export type MovieShort = Static<typeof MovieShortSchema>
