// src/workers/providers/IEntityProvider.ts

export interface IEntityProvider<TEntity> {
  /**
   * Enrichit un film, une Personne et/ou les personnes associées.
   * Doit être idempotent et ne jamais lever d'erreur non capturée
   * TEntity = Movie | Person | Company
   */
  enrich(item: TEntity): Promise<TEntity>
}

export interface Movie {
  id: number
  title: string
}

export interface Person {
  id: number
  name: string
}

export class TmdbHttpPeopleProvider implements IEntityProvider<Person> {
  async enrich(person: Person): Promise<Person> {
    // code
    return person
  }
}

export class TmdbHttpMovieProvider implements IEntityProvider<Movie> {
  async enrich(movie: Movie): Promise<Movie> {
    // code
    return movie
  }
}
