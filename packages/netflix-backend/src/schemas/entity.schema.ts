// src/schemas/entity.schema.ts
import { Type, Static } from '@sinclair/typebox'

export type EntityKind = 'Movie' | 'Person' | 'Company' | 'User'
export type EnrichLevel = 'basic' | 'medium' | 'deep'

export type UUID = string

export const BaseEntitySchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  kind: Type.Union([
    Type.Literal('Movie'),
    Type.Literal('Person'),
    Type.Literal('Company'),
    Type.Literal('User')
  ])
})

export const EntitySchema = Type.Intersect([
  BaseEntitySchema,
  Type.Object({
    externalIds: Type.Record(Type.String(), Type.String()),
    status: Type.Optional(
      Type.Union([Type.Literal('basic'), Type.Literal('medium'), Type.Literal('deep')])
    )
  })
])

export type Entity = Static<typeof EntitySchema>
