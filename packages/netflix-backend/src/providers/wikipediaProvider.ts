// src/workers/providers/wikipediaProvider.ts
import { IMovieProvider } from './IMovieProvider'
import { Movie } from '../../schemas/movies/movie-detail.schema'
import { Person } from '../../schemas/people/person-detail.schema'
import { fetchWikiDescription } from '../wikidataUtils'

export class WikipediaProvider implements IMovieProvider {
  async enrich(movie: Movie): Promise<void> {
    if (movie.wikidataId) {
      movie.wikiDescription = await fetchWikiDescription(movie.wikidataId)
    }

    if (movie.people) {
      for (const person of movie.people) {
        if (person.wikidataId) {
          person.wikiDescription = await fetchWikiDescription(person.wikidataId)
        }
      }
    }
  }
}
