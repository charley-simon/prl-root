import chokidar from 'chokidar'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

// -----------------------------
// Load config.json
// -----------------------------
const CONFIG_PATH = './config.json'

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {}

  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))

  // Surcharge des variables d'environnement
  if (config.env && typeof config.env === 'object') {
    for (const [key, value] of Object.entries(config.env) as [string, string][]) {
      process.env[key] = value
    }
  }
  return config
}

const config = loadConfig()

// -----------------------------
// Configurable paths & worker params
// -----------------------------
const VIDEO_DIR = config.paths?.videoImport || './video-import'
const DATA_DIR = config.paths?.movieData || './data/movies'
const ASSETS_DIR = config.paths?.assets || './data/assets/movies'

const MAX_DOWNLOADS = config.worker?.maxConcurrentDownloads || 3
const LAZY_ENRICHMENT = config.worker?.lazyEnrichment ?? true

// Créer dossiers si inexistants
;[DATA_DIR, ASSETS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
})

// -----------------------------
// Types pour TMDB
// -----------------------------
type TMDBMovie = {
  id: number
  title: string
  release_date?: string
  overview?: string
  poster_path?: string
  backdrop_path?: string
}

type TMDBSearchResponse = {
  results: TMDBMovie[]
}

// -----------------------------
// Utils
// -----------------------------
function parseVideoFilename(filename: string) {
  let name = filename.replace(/\.[^.]+$/, '') // enlever extension
  name = name.replace(/\[(.*?)\]/g, '') // enlever [..]
  name = name.replace(
    /\b(1080p|720p|BluRay|WEB-DL|HDLight|x264|AC3|MULTi|EXTREME|STVFRV|Pop)\b/gi,
    ''
  )
  name = name.replace(/[._]+/g, ' ').trim()

  const yearMatch = name.match(/\b(19|20)\d{1}\b/)
  const year = yearMatch ? parseInt(yearMatch[0]) : null

  // Version plus élégante : enlever l'année si elle existe
  const title = name.replace(yearMatch?.[0] ?? '', '').trim()

  return { title, year }
}

async function searchTMDB(title: string, year?: number) {
  const url = new URL('https://api.themoviedb.org/3/search/movie')
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjkxZmJmMjVmOGY5MzM2MWU5Yjc0MDVmYTU0NDE1NyIsIm5iZiI6MTcwNDk5Mzc1My4zNzEsInN1YiI6IjY1YTAyM2Q5MjdkYjYxMDEyNzk4NjYxNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.roO7_rw2FyxvExevz5oFaUY785nbVshk8YwRIYz3ers'
    }
  }
  url.searchParams.set('query', title)
  url.searchParams.set('language', 'fr-FR')
  if (year) url.searchParams.set('year', year.toString())

  const res = await fetch(url.toString(), options)
  const data = (await res.json()) as TMDBSearchResponse
  if (data.results && data.results.length > 0) {
    const movie = data.results[0]
    return {
      tmdbId: movie.id,
      title: movie.title,
      releaseYear: Number(movie.release_date?.slice(0, 4)),
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path
    }
  }
  return null
}

// Télécharger + conversion en Avif
async function downloadAndConvertTMDBImage(tmdbPath: string, baseName: string, widths: number[]) {
  if (!tmdbPath) return {}

  const url = `https://image.tmdb.org/t/p/original${tmdbPath}`
  const res = await fetch(url)
  if (!res.ok) return {}

  const buffer = Buffer.from(await res.arrayBuffer())
  const result: any = {}

  for (const w of widths) {
    const suffix = w <= 150 ? 'Sm' : w <= 500 ? 'Md' : 'Lg'
    const filePath = path.join(ASSETS_DIR, `${baseName}${suffix}.avif`)
    await sharp(buffer).resize({ width: w }).avif({ quality: 80 }).toFile(filePath)
    result[suffix] = filePath
  }
  return result
}

// -----------------------------
// Worker : traitement d'un fichier vidéo
// -----------------------------
async function handleVideoFile(filepath: string) {
  const filename = path.basename(filepath)
  const { title, year } = parseVideoFilename(filename)
  console.log(`Fichier détecté: ${filename} -> title: "${title}", year: ${year}`)

  const movie = await searchTMDB(title, year ?? undefined)
  if (!movie) {
    console.warn(`Aucun film trouvé pour: "${title}" (${year ?? 'unknown'})`)
    return
  }

  console.log(`Film trouvé TMDB ID: ${movie.tmdbId}, title: "${movie.title}"`)

  const movieJsonPath = path.join(DATA_DIR, `${movie.tmdbId}-movie.json`)
  let movieData: any = {
    id: movie.tmdbId,
    title: movie.title,
    releaseYear: movie.releaseYear ?? year,
    overview: movie.overview ?? '',
    video: {
      localPath: path.resolve(filepath),
      provider: 'local'
    }
  }

  // Télécharger et convertir images TMDB en Avif
  if (movie.posterPath) {
    const posterFiles = await downloadAndConvertTMDBImage(
      movie.posterPath,
      `${movie.tmdbId}-poster`,
      [100, 300, 500]
    )
  }

  if (movie.backdropPath) {
    const backdropFiles = await downloadAndConvertTMDBImage(
      movie.backdropPath,
      `${movie.tmdbId}-background`,
      [300, 1000]
    )
  }

  // Merge avec existant si nécessaire
  if (fs.existsSync(movieJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(movieJsonPath, 'utf-8'))
    movieData = { ...existing, ...movieData }
  }

  fs.writeFileSync(movieJsonPath, JSON.stringify(movieData, null, 2), 'utf-8')
  console.log(`Movie JSON mis à jour: ${movieJsonPath}`)
}

/*
// -----------------------------
// Surveillance répertoire
// -----------------------------
const watcher = chokidar.watch(VIDEO_DIR, { ignoreInitial: false });

watcher.on("add", async (filePath) => {
  try {
    await handleVideoFile(filePath);
  } catch (err) {
    console.error("Erreur traitement vidéo:", err);
  }
});

console.log(`Worker actif, surveillance du répertoire: ${VIDEO_DIR}`);
*/

import PQueue from 'p-queue'

// -----------------------------
// Paths et paramètres dynamiques
// -----------------------------
function getPaths() {
  return {
    VIDEO_DIR: config.paths?.videoImport || './video-import',
    DATA_DIR: config.paths?.movieData || './data/movies',
    ASSETS_DIR: config.paths?.assets || './data/assets/movies'
  }
}

function getWorkerParams() {
  return {
    MAX_DOWNLOADS: config.worker?.maxConcurrentDownloads || 3,
    LAZY_ENRICHMENT: config.worker?.lazyEnrichment ?? true
  }
}

// Créer dossiers si nécessaire
function ensureDirs() {
  const { DATA_DIR, ASSETS_DIR } = getPaths()
  ;[DATA_DIR, ASSETS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  })
}

// -----------------------------
// File queue avec concurrence
// -----------------------------
const workerParams = getWorkerParams()
const queue = new PQueue({ concurrency: workerParams.MAX_DOWNLOADS })
let processedCount = 0

function enqueueVideo(filePath: string) {
  queue.add(async () => {
    await handleVideoFile(filePath)
    processedCount++
  })
}

type TMDBExternalIDs = {
  imdb_id?: string
  wikidata_id?: string
}

type WikidataSPARQLResponse = {
  results: {
    bindings: {
      description: { value: string }
    }[]
  }
}

async function fetchExternalIDs(tmdbId: number) {
  const url = `https://api.themoviedb.org/3/person/${tmdbId}/external_ids`
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjkxZmJmMjVmOGY5MzM2MWU5Yjc0MDVmYTU0NDE1NyIsIm5iZiI6MTcwNDk5Mzc1My4zNzEsInN1YiI6IjY1YTAyM2Q5MjdkYjYxMDEyNzk4NjYxNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.roO7_rw2FyxvExevz5oFaUY785nbVshk8YwRIYz3ers'
    }
  }
  const res = await fetch(url, options)
  if (!res.ok) return {}
  const data = (await res.json()) as TMDBExternalIDs
  return {
    imdbId: data.imdb_id,
    wikidataId: data.wikidata_id
  }
}

async function fetchWikiDescription(wikidataId: string) {
  if (!wikidataId) return ''
  const query = `
    SELECT ?description WHERE {
      wd:${wikidataId} schema:description ?description.
      FILTER(LANG(?description) = "fr")
    }`

  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`
  const res = await fetch(url, { headers: { Accept: 'application/sparql-results+json' } })
  if (!res.ok) return ''

  const data = (await res.json()) as WikidataSPARQLResponse
  const desc = data.results?.bindings?.[0]?.description?.value ?? ''
  return desc
}

async function tmdbGetPeopleById(personId: number) {
  const url = new URL(`https://api.themoviedb.org/3/person/${personId}?language=fr-FR`)
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjkxZmJmMjVmOGY5MzM2MWU5Yjc0MDVmYTU0NDE1NyIsIm5iZiI6MTcwNDk5Mzc1My4zNzEsInN1YiI6IjY1YTAyM2Q5MjdkYjYxMDEyNzk4NjYxNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.roO7_rw2FyxvExevz5oFaUY785nbVshk8YwRIYz3ers'
    }
  }

  const res = await fetch(url.toString(), options)
  const data = (await res.json()) as any

  if (data) {
    return data
  }
  return null
}

async function tmdbGetMovieById(movieId: number) {
  const url = new URL(`https://api.themoviedb.org/3/movie/${movieId}?language=fr-FR`)
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjkxZmJmMjVmOGY5MzM2MWU5Yjc0MDVmYTU0NDE1NyIsIm5iZiI6MTcwNDk5Mzc1My4zNzEsInN1YiI6IjY1YTAyM2Q5MjdkYjYxMDEyNzk4NjYxNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.roO7_rw2FyxvExevz5oFaUY785nbVshk8YwRIYz3ers'
    }
  }

  const res = await fetch(url.toString(), options)
  const data = (await res.json()) as any

  if (data) {
    return data
  }
  return null
}

// -----------------------------
// Worker : traitement d'un fichier vidéo
// -----------------------------
async function handleVideoById(movieId: number) {
  console.log(`People à traiter Id: ${movieId}`)

  const movieTmdb = await tmdbGetMovieById(movieId)
  if (!movieTmdb) {
    console.warn(`Aucun people trouvé pour: ${movieId}`)
    return
  }
  console.log('tmdb people: ', movieTmdb)

  const movieJsonPath = path.join('./data/movies', `${movieId}-detail.json`)

  let movieData: any = {}
  if (fs.existsSync(movieJsonPath)) {
    movieData = JSON.parse(fs.readFileSync(movieJsonPath, 'utf-8'))
  }
  /*
  {
  backdrop_path: '/1qM2BYNE11Viby8ImC9LC00DgDr.jpg',
  poster_path: '/eGctboDIdxBSxZIcF8iLc8gebd5.jpg',
  genres: [
    { id: 28, name: 'Action' },
    { id: 80, name: 'Crime' },
    { id: 18, name: 'Drame' }
  ],
  tagline: "Il voulait vivre le rêve américain. Jusqu'au bout.",
  title: 'Scarface',
  video: false,
  vote_average: 8.155,
  vote_count: 12722
}*/
  movieData.id = movieId
  movieData.title = movieTmdb.title
  movieData.originalTitle = movieTmdb.original_title
  movieData.budget = movieTmdb.budget
  movieData.revenue = movieTmdb.revenue
  movieData.categories = movieTmdb.genres.map((genre: any) => genre.id)
  movieData.releaseDate = movieTmdb.release_date
  movieData.synopsis = movieTmdb.overview
  movieData.tagLine = movieTmdb.tagline
  movieData.popularity = movieTmdb.popularity
  movieData.rating = movieTmdb.vote_average
  movieData.trailerSource = movieTmdb.trailerSource
  movieData.isLocal = false
  movieData.movieSource = ''

  // Télécharger et convertir images TMDB en Avif
  if (movieTmdb.posterPath) {
    await downloadAndConvertTMDBImage(movieTmdb.posterPath, `${movieId}-poster`, [100, 300, 500])
  }

  if (movieTmdb.backdropPath) {
    await downloadAndConvertTMDBImage(movieTmdb.backdropPath, `${movieId}-background`, [300, 1000])
  }

  // Merge avec existant si nécessaire
  if (fs.existsSync(movieJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(movieJsonPath, 'utf-8'))
    movieData = { ...existing, ...movieData }
  }

  fs.writeFileSync(movieJsonPath, JSON.stringify(movieData, null, 2), 'utf-8')
  console.log(`Movie JSON mis à jour: ${movieJsonPath}`)
}

// -----------------------------
// Worker : traitement d'un people
// -----------------------------
async function handlePeopleId(peopleId: number) {
  const filename = path.basename(`./data/people/${peopleId}-profil.json`)
  console.log(`People à traiter: ${filename} - Id: ${peopleId}`)

  const peopleTmdb = await tmdbGetPeopleById(peopleId)
  if (!peopleTmdb) {
    console.warn(`Aucun people trouvé pour: ${peopleId}`)
    return
  }
  console.log('tmdb people: ', peopleTmdb)

  const peopleJsonPath = path.join('./data/people', `${peopleId}-profil.json`)

  let peopleData: any = {}
  if (fs.existsSync(peopleJsonPath)) {
    peopleData = JSON.parse(fs.readFileSync(peopleJsonPath, 'utf-8'))
  }

  peopleData.id = peopleId
  peopleData.name = peopleTmdb.name
  peopleData.AlsoKnowAs = peopleTmdb.also_knows_as
  peopleData.biography = peopleTmdb.biography
  peopleData.deathDay = peopleTmdb.deathday
  peopleData.birthDay = peopleTmdb.birthday
  peopleData.birthPlace = peopleTmdb.place_of_birth
  peopleData.gender = peopleTmdb.gender
  peopleData.homepage = peopleTmdb.homepage
  peopleData.knowForDepartment = peopleTmdb.know_for_department
  peopleData.popularity = peopleTmdb.popularity

  // Image
  if (!peopleData.profil) {
    if (peopleTmdb.profile_path) {
      // Télécharger + conversion en Avif
      const url = `https://image.tmdb.org/t/p/original${peopleTmdb.profile_path}`
      const res = await fetch(url)
      if (res.ok) {
        const buffer = Buffer.from(await res.arrayBuffer())
        const filePath = path.join(`./data/assets/people/${peopleData.id}-profil`)
        await sharp(buffer)
          .resize({ width: 100 })
          .avif({ quality: 80 })
          .toFile(filePath + 'Sm.avif')
        await sharp(buffer)
          .resize({ width: 300 })
          .avif({ quality: 80 })
          .toFile(filePath + 'Md.avif')
        await sharp(buffer)
          .resize({ width: 500 })
          .avif({ quality: 80 })
          .toFile(filePath + 'Lg.avif')
      }
    }
  }

  // Enrichissement IDs externes
  const externalIDs = await fetchExternalIDs(peopleData.id)
  console.log(' IDs: ', externalIDs)
  peopleData.externalIds = {
    tmdb: peopleTmdb.id.toString(),
    imdb: externalIDs.imdbId,
    wikidata: externalIDs.wikidataId
  }

  // Enrichissement narratif depuis Wikidata
  if (peopleData.wikidataId && !peopleData.wikiDescription) {
    peopleData.wikiDescription = await fetchWikiDescription(peopleData.wikidataId)
  }

  if (!validatePersonDetail(peopleData)) {
    throw new Error('Invalid PersonDetail JSON')
  } else {
    fs.writeFileSync(peopleJsonPath, JSON.stringify(peopleData, null, 2), 'utf-8')
    console.log(`[JSON] People JSON mis à jour: ${peopleJsonPath}`)
  }
}

import { validatePersonDetail } from '../validation/people.validation'

async function checkPeopleCompletion() {
  const peoples = readJSON('./data/people.json')

  peoples.forEach((people: any) => {
    if (!people.id) return
    if (!people.biography) {
      console.log(`Récupération des informations de (${people.id}) - ${people.name}`)
      handlePeopleId(people.id)
    }
  })
}

function readJSON(fileName: string) {
  return JSON.parse(fs.readFileSync(fileName, 'utf-8'))
}

function writeJSON(fileName: string, jsonData: string) {
  console.log(`writing: ${fileName}, array.length ${jsonData.length}`)
  return fs.writeFileSync(fileName, JSON.stringify(jsonData), 'utf-8')
}

handleVideoById(111)
// checkPeopleCompletion();
/////////////////////////////////////////////////////////////////////////////////////////////////////////
// Télécharger + conversion en Avif
async function downloadAndConvertTMDBImage(tmdbPath: string, baseName: string, widths: number[]) {
  if (!tmdbPath) return {}

  const url = `https://image.tmdb.org/t/p/original${tmdbPath}`
  const res = await fetch(url)
  if (!res.ok) return {}

  const buffer = Buffer.from(await res.arrayBuffer())
  const result: any = {}

  for (const w of widths) {
    const suffix = w <= 150 ? 'Sm' : w <= 500 ? 'Md' : 'Lg'
    const filePath = path.join(ASSETS_DIR, `${baseName}${suffix}.avif`)
    await sharp(buffer).resize({ width: w }).avif({ quality: 80 }).toFile(filePath)
    result[suffix] = filePath
  }
  return result
}

async function searchTMDB(title: string, year?: number) {
  const url = new URL('https://api.themoviedb.org/3/search/movie')
  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4ZjkxZmJmMjVmOGY5MzM2MWU5Yjc0MDVmYTU0NDE1NyIsIm5iZiI6MTcwNDk5Mzc1My4zNzEsInN1YiI6IjY1YTAyM2Q5MjdkYjYxMDEyNzk4NjYxNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.roO7_rw2FyxvExevz5oFaUY785nbVshk8YwRIYz3ers'
    }
  }
  url.searchParams.set('query', title)
  url.searchParams.set('language', 'fr-FR')
  if (year) url.searchParams.set('year', year.toString())

  const res = await fetch(url.toString(), options)
  const data = (await res.json()) as TMDBSearchResponse
  if (data.results && data.results.length > 0) {
    const movie = data.results[0]
    return {
      tmdbId: movie.id,
      title: movie.title,
      releaseYear: Number(movie.release_date?.slice(0, 4)),
      overview: movie.overview,
      posterPath: movie.poster_path,
      backdropPath: movie.backdrop_path
    }
  }
  return null
}

// -----------------------------
// Utils
// -----------------------------
function parseVideoFilename(filename: string) {
  let name = filename.replace(/\.[^.]+$/, '') // enlever extension
  name = name.replace(/\[(.*?)\]/g, '') // enlever [..]
  name = name.replace(
    /\b(1080p|720p|BluRay|WEB-DL|HDLight|x264|AC3|MULTi|EXTREME|STVFRV|Pop)\b/gi,
    ''
  )
  name = name.replace(/[._]+/g, ' ').trim()

  const yearMatch = name.match(/\b(19|20)\d{1}\b/)
  const year = yearMatch ? parseInt(yearMatch[0]) : null

  // Version plus élégante : enlever l'année si elle existe
  const title = name.replace(yearMatch?.[0] ?? '', '').trim()

  return { title, year }
}

// -----------------------------
// Worker : traitement d'un fichier vidéo
// -----------------------------
async function handleVideoFile(filepath: string) {
  const filename = path.basename(filepath)
  const { title, year } = parseVideoFilename(filename)
  console.log(`Fichier détecté: ${filename} -> title: "${title}", year: ${year}`)

  const movie = await searchTMDB(title, year ?? undefined)
  if (!movie) {
    console.warn(`Aucun film trouvé pour: "${title}" (${year ?? 'unknown'})`)
    return
  }

  console.log(`Film trouvé TMDB ID: ${movie.tmdbId}, title: "${movie.title}"`)

  const movieJsonPath = path.join(DATA_DIR, `${movie.tmdbId}-movie.json`)
  let movieData: any = {
    id: movie.tmdbId,
    title: movie.title,
    releaseYear: Number(movie.releaseYear ?? year),
    overview: movie.overview ?? '',
    video: {
      localPath: path.resolve(filepath),
      provider: 'local'
    }
  }

  // Télécharger et convertir images TMDB en Avif
  if (movie.posterPath) {
    const posterFiles = await downloadAndConvertTMDBImage(
      movie.posterPath,
      `${movie.tmdbId}-poster`,
      [100, 300, 500]
    )
  }

  if (movie.backdropPath) {
    const backdropFiles = await downloadAndConvertTMDBImage(
      movie.backdropPath,
      `${movie.tmdbId}-background`,
      [300, 1000]
    )
  }

  // Merge avec existant si nécessaire
  if (fs.existsSync(movieJsonPath)) {
    const existing = JSON.parse(fs.readFileSync(movieJsonPath, 'utf-8'))
    movieData = { ...existing, ...movieData }
  }

  fs.writeFileSync(movieJsonPath, JSON.stringify(movieData, null, 2), 'utf-8')
  console.log(`Movie JSON mis à jour: ${movieJsonPath}`)
}

handleVideoFile('A.Star.is.Born.2018.mkv')
