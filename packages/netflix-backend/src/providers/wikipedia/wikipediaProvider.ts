// src/workers/providers/wikipediaProvider.ts
import { Movie } from '../../schemas/movies/movie-detail.schema'
import { Person } from '../../schemas/people/person-detail.schema'
import { fetchWikiDescription } from './wikidataUtils'
import { IEntityProvider } from '../EntityProvider'

export class WikipediaMovieProvider implements IEntityProvider<Movie> {
  async enrich(movie: Movie): Promise<Movie> {
    if (movie.externalsIds?.wikidata) {
      movie.wikiDescription = await fetchWikiDescription(movie.externalsIds.wikidata)
    }
    return movie
  }
}

export class WikipediaPersonProvider implements IEntityProvider<Person> {
  async enrich(person: Person): Promise<Person> {
    if (person.externalsIds?.wikidata) {
      person.wikiDescription = await fetchWikiDescription(person.externalsIds.wikidata)
    }
    return person
  }
}
