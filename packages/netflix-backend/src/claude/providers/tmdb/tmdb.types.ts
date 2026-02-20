// src/providers/tmdb/tmdb.types.ts
export interface TmdbMovieDetails {
  id: number
  title: string
  original_title: string
  release_date: string
  overview: string
  tagline: string
  budget: number
  revenue: number
  popularity: number
  vote_average: number
  poster_path: string | null
  backdrop_path: string | null
  genre_ids: number[]
}

export interface TmdbMovieCredits {
  id: number
  cast: TmdbCastMember[]
  crew: TmdbCrewMember[]
}

export interface TmdbCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface TmdbCrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface TmdbSearchResult {
  results: TmdbMovieDetails[]
  total_results: number
  total_pages: number
}

export interface TmdbPersonDetails {
  id: number
  name: string
  biography: string
  birthday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
}

export interface TmdbExternalIds {
  imdb_id: string | null
  wikidata_id: string | null
}
