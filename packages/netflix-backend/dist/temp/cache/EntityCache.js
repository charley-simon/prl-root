"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryEntityCache = void 0;
// Implémentation in-memory (tests / dev)
class InMemoryEntityCache {
    constructor() {
        this.store = new Map();
    }
    key(kind, id) {
        return `${kind}:${id}`;
    }
    async get(kind, id) {
        return this.store.get(this.key(kind, id)) ?? null;
    }
    async set(entity) {
        this.store.set(this.key(entity.kind, entity.id), entity);
    }
    async delete(kind, id) {
        this.store.delete(this.key(kind, id));
    }
    async findMovie(criteria) {
        for (const entity of this.store.values()) {
            if (entity.kind !== 'Movie')
                continue;
            const movie = entity;
            const titleMatch = movie.title?.toLowerCase() === criteria.title.toLowerCase();
            const yearMatch = !criteria.year || movie.releaseYear === criteria.year;
            if (titleMatch && yearMatch)
                return entity;
        }
        return null;
    }
}
exports.InMemoryEntityCache = InMemoryEntityCache;
/*
// Implémentation Redis (prod)
export class RedisEntityCache implements EntityCache {
  constructor(
    private readonly redis: RedisClient,
    private readonly ttl: number = 3600
  ) {}

  private key(kind: EntityKind, id: string): string {
    return `entity:${kind.toLowerCase()}:${id}`
  }

  async get<T extends IEntity>(kind: EntityKind, id: string): Promise<T | null> {
    const raw = await this.redis.get(this.key(kind, id))
    return raw ? (JSON.parse(raw) as T) : null
  }

  async set<T extends IEntity>(entity: T): Promise<void> {
    await this.redis.setEx(this.key(entity.kind, entity.id), this.ttl, JSON.stringify(entity))
  }

  async delete(kind: EntityKind, id: string): Promise<void> {
    await this.redis.del(this.key(kind, id))
  }

  async findMovie(criteria: { title: string; year?: number }): Promise<IEntity | null> {
    // Redis n'est pas fait pour la recherche — on délègue à un index ou au transformer
    throw new Error('findMovie not supported on RedisEntityCache — use a search index')
  }
}
*/
