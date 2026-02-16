// tmdb.types.ts

interface TmdbGeneric {
  id: number
}

interface TmdbGenre extends TmdbGeneric {
  name: string
}

export interface TmdbProductionCompany extends TmdbGeneric {
  logo_path: string
  name: string
  origin_country: string
}

interface TmdbProductionCountry {
  iso_3166_1: string
  name: string
}

interface TmdbSpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface TmdbMovieDetails extends TmdbGeneric {
  adult: boolean
  backdrop_path: string
  belongs_to_collection: string
  budget: number
  genres: TmdbGenre[]
  homepage: string
  imdb_id: string
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string
  production_companies: TmdbProductionCompany[]
  production_countries: TmdbProductionCountry[]
  release_date: string
  revenue: number
  runtime: number
  spoken_languages: TmdbSpokenLanguage[]
  status: string
  tagline: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
}

export interface TmdbMovieCredits extends TmdbGeneric {
  cast: TmdbCast[]
  crew: TmdbCrew[]
}

export interface TmdbMoviePerson extends TmdbGeneric {
  gender: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string
  credit_id: string
}

interface TmdbCast extends TmdbMoviePerson {
  cast_id: number
  character: string
  order: number
  adult: boolean
}

interface TmdbCrew extends TmdbMoviePerson {
  department: string
  job: string
}

export interface TmdbExternalIds extends TmdbGeneric {
  imdb_id?: string
  wikidata_id?: string
  facebook_id?: string
  instagram_id?: string
  twitter_id?: string
}

export interface TmdbImage {
  file_path: string
  height?: number
  width?: number
  aspect_ratio?: number
  vote_average?: number
  vote_count?: number
  iso_639_1?: string | null
}

export interface TmdbMovieImages {
  backdrops: TmdbImage[]
  posters: TmdbImage[]
  logos: TmdbImage[]
}

export interface TmdbPerson extends TmdbGeneric {
  adult: boolean
  also_known_as: string[]
  biography: string
  birthday: string
  deathday: string | null
  gender: number
  homepage: string | null
  imdb_id: string
  known_for_department: string
  name: string
  place_of_birth: string
  popularity: number
  profile_path: string
}

export interface TmdbPersonImages {
  profiles: TmdbImage[]
}

export type TmdbImages = TmdbMovieImages | TmdbPersonImages

export interface TmdbMovieBundle {
  details: TmdbMovieDetails
  externalIds?: TmdbExternalIds
  credits?: TmdbMovieCredits
  images?: TmdbMovieImages
}
