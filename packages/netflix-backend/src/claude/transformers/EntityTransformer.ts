// src/transformers/EntityTransformer.ts
import { Entity, EntityKind, EnrichLevel, UUID } from '../../schemas/entity.schema'

export interface EntityTransformer<T extends Entity> {
  searchMovie(criteria: { title: string; year?: number }): Promise<UUID>
  create(kind: EntityKind, id: UUID, level: EnrichLevel): Promise<T>
  enrich(entity: T, targetLevel: EnrichLevel): Promise<T>
}
