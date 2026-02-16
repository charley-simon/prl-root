// src/services/movie/movieService.ts
import fs from 'fs'
import path from 'path'
import { Movie, MovieDetailSchema } from '../../schemas/movies/movie-detail.schema'
import { Person, PersonDetailSchema } from '../../schemas/people/person-detail.schema'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { UserPreferences } from '../../schemas/users/user.schema' // à ajouter en import
import { movieEvents, MovieEventPayload } from '../../services/movie/movieEvents'

export interface MovieService {
  getMovieDetailById(movieId: number): Promise<Movie>
  getPersonDetailById(personId: number): Promise<Person>
  getPeopleFromMovie(movieId: number, kind?: string): Promise<Person[]>
  getMoviesFromPerson(personId: number, kind?: string): Promise<Movie[]>
  getPeopleFromPerson(personId: number, kind?: string): Promise<Person[]>
  listMovies(batch?: { offset: number; limit: number }): Promise<Movie[]>
  getSimilarMovies(movieId: number): Promise<Movie[]>
  listPersonalizedMovies(
    prefs: UserPreferences,
    batch?: { offset?: number; limit?: number }
  ): Promise<Movie[]>
}

interface Job {
  id: number
  name: string
}

interface MoviePeopleLink {
  movieId: number
  personId: number
  jobId: number
}

export class MovieServiceImpl implements MovieService {
  private movies: Movie[] = []
  private people: Person[] = []
  private jobs: Job[] = []
  private moviesPeople: MoviePeopleLink[] = []

  private jobsById: Record<number, Job> = {}
  private jobsByName: Record<string, Job> = {}
  private peopleById: Record<number, Person> = {}
  private moviesById: Record<number, Movie> = {}
  private moviesPeopleByJob: Record<string, MoviePeopleLink[]> = {}

  constructor() {
    this.loadReferences()

    // ✅ S'abonner aux événements movie-updated
    movieEvents.on('movie-updated', (payload: MovieEventPayload) => {
      this.reloadMovie(payload.filePath)
      console.log(`MovieService: cache mis à jour pour movieId=${payload.id}`)
    })
  }

  // Méthode pour recharger un film depuis son JSON
  reloadMovie(movieFilePath: string) {
    const movieData = JSON.parse(fs.readFileSync(movieFilePath, 'utf-8')) as Movie
    this.moviesById[movieData.id] = movieData

    const idx = this.movies.findIndex(m => m.id === movieData.id)
    if (idx >= 0) this.movies[idx] = movieData
    else this.movies.push(movieData)
  }

  private loadReferences() {
    const refsPath = path.join(__dirname, '../../../data/references')
    const peoplePath = path.join(__dirname, '../../../data/people.json')
    const moviesPath = path.join(__dirname, '../../../data/movies.json')
    const moviesPeoplePath = path.join(__dirname, '../../../data/movies-people.json')

    // Chargement JSON
    this.jobs = JSON.parse(fs.readFileSync(path.join(refsPath, 'jobs.json'), 'utf-8'))
    this.people = JSON.parse(fs.readFileSync(peoplePath, 'utf-8'))
    this.movies = JSON.parse(fs.readFileSync(moviesPath, 'utf-8'))
    this.moviesPeople = JSON.parse(fs.readFileSync(moviesPeoplePath, 'utf-8'))

    // Création caches rapides
    this.jobs.forEach(j => {
      this.jobsById[j.id] = j
      this.jobsByName[j.name] = j
    })
    this.people.forEach(p => {
      this.peopleById[p.id] = p
    })
    this.movies.forEach(m => {
      this.moviesById[m.id] = m
    })
  }

  // ✅ Correction TypeScript: kind peut être undefined
  private validateJob(kind?: string) {
    if (kind && !this.jobsByName[kind]) {
      console.log(`Job inconnu: ${kind}`)
      throw new Error(`Job inconnu: ${kind}`)
    }
  }

  async getMovieDetailById(movieId: number): Promise<Movie> {
    const movie = this.moviesById[movieId]
    if (!movie) throw new Error(`Movie ${movieId} not found`)
    return movie
  }

  async getPersonDetailById(personId: number): Promise<Person> {
    const person = this.peopleById[personId]
    if (!person) throw new Error(`Person ${personId} not found`)
    return person
  }

  // Lazy cache pour filtrer par job
  private getLinksByJob(kind?: string): MoviePeopleLink[] {
    if (!kind) return this.moviesPeople
    if (!this.moviesPeopleByJob[kind]) {
      const job = this.jobsByName[kind]
      if (!job) throw new Error(`Job inconnu: ${kind}`)
      this.moviesPeopleByJob[kind] = this.moviesPeople.filter(mp => mp.jobId === job.id)
    }
    return this.moviesPeopleByJob[kind]
  }

  async getPeopleFromMovie(movieId: number, kind?: string): Promise<Person[]> {
    this.validateJob(kind)
    const links = this.getLinksByJob(kind).filter(mp => mp.movieId === movieId)
    return links.map(link => this.peopleById[link.personId])
  }

  async getMoviesFromPerson(personId: number, kind?: string): Promise<Movie[]> {
    this.validateJob(kind)
    const links = this.getLinksByJob(kind).filter(mp => mp.personId === personId)
    return links.map(link => this.moviesById[link.movieId])
  }

  async getPeopleFromPerson(personId: number, kind?: string): Promise<Person[]> {
    this.validateJob(kind)
    const links = this.getLinksByJob(kind).filter(mp => mp.personId === personId)
    return links.map(link => this.peopleById[link.personId])
  }

  async listMovies(batch?: { offset: number; limit: number }): Promise<Movie[]> {
    const offset = batch?.offset ?? 0
    const limit = batch?.limit ?? 50
    const allMovies = Object.values(this.moviesById)
    return allMovies.slice(offset, offset + limit)
  }

  async getSimilarMovies(movieId: number): Promise<Movie[]> {
    const movie = this.moviesById[movieId]
    if (!movie) throw new Error(`Movie ${movieId} not found`)

    const categories = new Set(movie.categories)

    const similar = this.movies.filter(
      m => m.id !== movieId && m.categories?.some(cat => categories.has(cat))
    )

    return similar.slice(0, 5)
  }

  /**
   * Retourne une liste personnalisée selon les préférences utilisateur
   * @param prefs - préférences utilisateur
   * @param batch - offset/limit pour lazy loading
   */
  async listPersonalizedMovies(
    prefs: UserPreferences,
    batch?: { offset?: number; limit?: number }
  ): Promise<Movie[]> {
    const start = performance.now()

    // 1️⃣ Filtrage catégories
    let filtered = this.movies.filter(
      movie =>
        !prefs.favoriteCategories.length ||
        movie.categories.some(cat => prefs.favoriteCategories.includes(cat))
    )

    // 2️⃣ Filtrage année minimale
    if (prefs.minYear) {
      if (prefs.minYear !== undefined && prefs.minYear !== null) {
        filtered = filtered.filter(movie => movie.releaseYear >= prefs.minYear!)
      }
    }

    // 3️⃣ Tri selon sortBy / sortOrder
    const sortBy = prefs.sortBy ?? 'rating'
    const sortOrder = prefs.sortOrder ?? 'desc'

    filtered.sort((a, b) => {
      let diff = 0
      if (sortBy === 'rating') diff = (b.rating ?? 0) - (a.rating ?? 0)
      if (sortBy === 'year') diff = (b.releaseYear ?? 0) - (a.releaseYear ?? 0)
      if (sortBy === 'title') diff = a.title.localeCompare(b.title)
      return sortOrder === 'asc' ? -diff : diff
    })

    // 4️⃣ Lazy loading
    const offset = batch?.offset ?? 0
    const limit = batch?.limit ?? 20
    filtered = filtered.slice(offset, offset + limit)

    // 5️⃣ Log métriques
    const duration = performance.now() - start
    console.log(`[UC5] Personalized list: ${filtered.length} movies, ${duration.toFixed(2)} ms`)

    return filtered
  }

  // Optionnel : libérer le tableau source si tous les caches ont été créés
  freeMoviesPeopleSource() {
    this.moviesPeople = []
  }
}
