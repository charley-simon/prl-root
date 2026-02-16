// src/workers/wikidataWorker.ts
import fetch from 'node-fetch'

interface WikidataMovie {
  description: string
  genres?: string[]
  directors?: string[]
  cast?: string[]
}

interface WikidataPerson {
  description: string
  knownForFilms?: string[]
}

/**
 * Récupère des infos enrichies depuis Wikidata pour un film ou une personne
 * @param wikidataId Qxxxx
 * @param type 'movie' | 'person'
 */
export async function fetchWikiData(wikidataId: string, type: 'movie' | 'person') {
  if (!wikidataId) return null

  let query = ''

  if (type === 'movie') {
    query = `
    SELECT ?description ?genreLabel ?directorLabel ?castLabel WHERE {
      wd:${wikidataId} schema:description ?description.
      FILTER(LANG(?description) = "fr")

      OPTIONAL { wd:${wikidataId} wdt:P136 ?genre. }      # genre
      OPTIONAL { wd:${wikidataId} wdt:P57 ?director. }   # réalisateur
      OPTIONAL { wd:${wikidataId} wdt:P161 ?cast. }      # acteurs

      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
    }`
  } else {
    query = `
    SELECT ?description ?filmLabel WHERE {
      wd:${wikidataId} schema:description ?description.
      FILTER(LANG(?description) = "fr")

      OPTIONAL { ?film wdt:P161|wdt:P57 wd:${wikidataId}. }  # films où la personne a joué ou dirigé

      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
    }`
  }

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/sparql-results+json' } })
  if (!res.ok) return null

  const data = (await res.json()) as any
  const bindings = data.results?.bindings ?? []

  if (type === 'movie') {
    const description = bindings[0]?.description?.value ?? ''
    const genres: string[] = Array.from(
      new Set(bindings.map((b: any) => b.genreLabel?.value).filter(Boolean))
    )
    const directors: string[] = Array.from(
      new Set(bindings.map((b: any) => b.directorLabel?.value).filter(Boolean))
    )
    const cast: string[] = Array.from(
      new Set(bindings.map((b: any) => b.castLabel?.value).filter(Boolean))
    )

    const result: WikidataMovie = { description, genres, directors, cast }
    return result
  } else {
    const description = bindings[0]?.description?.value ?? ''
    const knownForFilms: string[] = Array.from(
      new Set(bindings.map((b: any) => b.filmLabel?.value).filter(Boolean))
    )

    const result: WikidataPerson = { description, knownForFilms }
    return result
  }
}
