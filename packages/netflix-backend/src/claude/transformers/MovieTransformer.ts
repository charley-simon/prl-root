// src/transformers/MovieTransformer.ts
import { UUID, EntityKind, EnrichLevel } from '../../schemas/entity.schema'
import { Movie } from '../../schemas/movies/movie-detail.schema'
import { EntityTransformer } from './EntityTransformer'
import { TmdbProvider } from '../providers/tmdb/TmdbProvider'
import { WikipediaProvider } from '../providers/wikipedia/WikipediaProvider'
import { TmdbMovieDetails, TmdbMovieCredits } from '../providers/tmdb/tmdb.types'
import { WikipediaPageSummary } from '../providers/wikipedia/wikipedia.types'
import { generateInternalId } from '../utils/id.utils'

export class MovieTransformer implements EntityTransformer<Movie> {
  constructor(
    private readonly tmdb: TmdbProvider, // Injecté, pas instancié ici
    private readonly wikipedia: WikipediaProvider
  ) {}

  async searchMovie(criteria: { title: string; year?: number }): Promise<UUID> {
    const results = await this.tmdb.searchMovie(criteria.title, criteria.year)
    // Logique de sélection du meilleur résultat
    const best = results.results[0]
    return generateInternalId('tmdb', best.id)
  }

  async create(kind: EntityKind, id: UUID, level: EnrichLevel): Promise<Movie> {
    // Délègue à enrich depuis un objet vide
    const empty: Movie = {
      id: id,
      kind: 'Movie',
      externalIds: {},
      title: 'Unknow',
      status: undefined,
      releaseYear: 1900
    }
    return this.enrich(empty, level)
  }

  // enrich<T extends Entity>(entity: T, targetLevel: EnrichLevel): Promise<T>
  async enrich(entity: Movie, targetLevel: EnrichLevel): Promise<Movie> {
    const tmdbId = Number(entity.externalIds['tmdb'])

    // basic : titre, année, poster
    if (targetLevel === 'basic' || targetLevel === 'medium' || targetLevel === 'deep') {
      const details = await this.tmdb.getMovieDetails(tmdbId)
      entity = this.applyBasic(entity, details)
    }

    // medium : crédits (cast, crew)
    if (targetLevel === 'medium' || targetLevel === 'deep') {
      const credits = await this.tmdb.getMovieCredits(tmdbId)
      entity = this.applyCredits(entity, credits)
    }

    // deep : Wikipedia, IDs externes supplémentaires
    if (targetLevel === 'deep') {
      const wiki = await this.wikipedia.getMovieSummary(entity.title, entity.releaseYear)
      entity = this.applyWikipedia(entity, wiki as WikipediaPageSummary)
    }

    entity.status = targetLevel
    return entity
  }

  private applyBasic(movie: Movie, details: TmdbMovieDetails): Movie {
    return {
      ...movie,
      title: details.title
      // year: parseInt(details.release_date.split('-')[0]),
      // posterPath: details.poster_path,
      // backdropPath: details.backdrop_path
    }
  }

  private applyCredits(movie: Movie, credits: TmdbMovieCredits): Movie {
    return {
      ...movie
      //cast: credits.cast.map(c => ({ name: c.name, character: c.character })),
      //directors: credits.crew.filter(c: => c.job === 'Director').map(c => c.name)
    }
  }

  private applyWikipedia(movie: Movie, wiki: WikipediaPageSummary): Movie {
    return {
      ...movie,
      synopsis: wiki.extract
    }
  }
}
