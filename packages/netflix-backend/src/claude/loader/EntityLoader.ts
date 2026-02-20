// src/loader/EntityLoader.ts

import { UUID, Entity, EntityKind, EnrichLevel } from '../../schemas/entity.schema'
import { Movie } from '../../schemas/movies/movie-detail.schema'
import { Person } from '../../schemas/people/person-detail.schema'
import { EntityTransformer } from '../transformers/EntityTransformer'
import { EntityCache } from '../cache/EntityCache'
import { EntityValidator } from '../validators/EntityValidator'

export class EntityLoader {
  constructor(
    private readonly cache: EntityCache,
    private readonly transformers: Map<EntityKind, EntityTransformer<Entity>>,
    private readonly validator: EntityValidator
  ) {}

  private getTransformer(kind: EntityKind): EntityTransformer<Entity> {
    const transformer = this.transformers.get(kind)
    if (!transformer) throw new Error(`No transformer registered for kind: ${kind}`)
    return transformer
  }

  // Résolution d'un UUID interne depuis des critères flous (titre, année...)
  // Cherche en local d'abord, puis délègue à un provider de recherche si absent
  async resolveMovieBy(criteria: { title: string; year?: number }): Promise<UUID> {
    const cached = await this.cache.findMovie(criteria)
    if (cached) return cached.id

    // Délègue la recherche externe (ex: TMDB search)
    return this.getTransformer('Movie').searchMovie(criteria)
  }

  async getMovieById(id: UUID, level: EnrichLevel = 'basic'): Promise<Movie> {
    return this.getById('Movie', id, level) as Promise<Movie>
  }

  async getPersonById(id: UUID, level: EnrichLevel = 'basic'): Promise<Person> {
    return this.getById('Person', id, level) as Promise<Person>
  }

  private async getById(kind: EntityKind, id: UUID, level: EnrichLevel): Promise<Entity> {
    let entity = await this.cache.get(kind, id)

    if (!entity) {
      entity = await this.getTransformer(kind).create(kind, id, 'basic')
      await this.cache.set(entity)
    }

    if (this.isSufficient(entity.status, level)) return entity

    return this.enrich(entity, level)
  }

  async enrich<T extends Entity>(entity: T, targetLevel: EnrichLevel): Promise<T> {
    this.validator.validate(entity)
    const enriched = await this.getTransformer(entity.kind).enrich(entity, targetLevel)
    this.validator.validate(enriched)
    await this.cache.set(enriched)
    return enriched as T
  }

  // basic < medium < deep
  private isSufficient(current: EnrichLevel | undefined, requested: EnrichLevel): boolean {
    const order: EnrichLevel[] = ['basic', 'medium', 'deep']
    const currentIdx = order.indexOf(current ?? 'basic')
    const requestedIdx = order.indexOf(requested)
    return currentIdx >= requestedIdx
  }
}
