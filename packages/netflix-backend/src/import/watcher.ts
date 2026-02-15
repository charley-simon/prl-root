/**
 * Surveillance du répertoire /video-import
 * - Parsing automatique des noms de fichiers pour extraire title + year
 * - Recherche TMDB pour récupérer tmdbId et infos de base
 * - Création / mise à jour de {id}-movie.json minimal
 * - récupère automatiquement les images TMDB (posterSm/Md/Lg, backgroundMd/Lg)
 * - conversion automatique en .avif Sm/Md/Lg via Sharp
 * - Ajout du chemin local et métadonnées vidéo
 * - Préparation pour enrichissement lazy (Wikipedia/Wikidata)
 * - Gestion des cas local / streaming / providers / unknown
 *
 * ✅ Fonctionnalités incluses
 * - Parse automatique du nom de fichier
 *   - Gère points, espaces, crochets, release groups
 *   - Extrait l’année si présente
 * - Recherche TMDB
 *   - Si plusieurs résultats, prend le premier → à améliorer si nécessaire
 * - JSON minimal {tmdbId}-movie.json
 *   - Stocke title, releaseYear, overview, video.localPath, provider
 *   - Merge si le fichier existe déjà
 * - Répertoire surveillé en temps réel (video-import)
 *   - Détecte nouveaux fichiers automatiquement
 * - Extensible pour enrichissement lazy
 *   - overview et autres champs peuvent être complétés par ton worker d’enrichissement Wikidata/Wikipedia plus tard
 * - Support futur pour multi-providers
 *   - provider: "local" → on peut étendre vers "youtube", "netflix", "prime", "unknown"
 * 💡 Tu peux maintenant déposer n’importe quelle vidéo locale, et le worker :
 * - créera automatiquement le MovieDetail
 * - liera la vidéo au film
 * - prépare le terrain pour le lazy enrichissement et la visualisation côté backend/frontend
 *
 * ✅ Points forts de cette version
 * - Conversion automatique en .avif pour toutes les tailles (Sm/Md/Lg)
 * - Lazy enrichment prêt : overview, biographie, Wikidata/Wikipedia peuvent être complétés après
 * - Provider “local” prêt pour test avec vidéos locales
 * - Merge automatique pour ne jamais écraser les données existantes
 * - Support complet pour noms de fichiers variés (points, espaces, crochets, release group, année facultative)
 */
import chokidar from 'chokidar'
import fetch from 'node-fetch'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import PQueue from 'p-queue'

// -----------------------------
// CONFIGURATION
// -----------------------------
const CONFIG_PATH = './config.json'
let config: any = {}

function loadConfig() {
  if (!fs.existsSync(CONFIG_PATH)) return {}
  const newConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))

  // Surcharge process.env
  if (newConfig.env && typeof newConfig.env === 'object') {
    for (const [key, value] of Object.entries(newConfig.env) as [string, string][]) {
      process.env[key] = value
    }
  }
  return newConfig
}

config = loadConfig()

// Watcher pour recharger la config
chokidar.watch(CONFIG_PATH, { ignoreInitial: true }).on('change', () => {
  console.log('[CONFIG] Changement détecté, rechargement...')
  config = loadConfig()
  console.log('[CONFIG] Config rechargé')
})

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
ensureDirs()

// -----------------------------
// Types TMDB
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

// -----------------------------
// Utils
// -----------------------------
function parseVideoFilename(filename: string) {
  let name = filename.replace(/\.[^.]+$/, '')
  name = name.replace(/\[(.*?)\]/g, '')
  name = name.replace(
    /\b(1080p|720p|BluRay|WEB-DL|HDLight|x264|AC3|MULTi|EXTREME|STVFRV|Pop)\b/gi,
    ''
  )
  name = name.replace(/[._]+/g, ' ').trim()

  const yearMatch = name.match(/\b(19|20)\d{2}\b/)
  const year = yearMatch ? parseInt(yearMatch[0]) : null

  const title = name.replace(yearMatch?.[0] ?? '', '').trim()
  return { title, year }
}

async function searchTMDB(title: string, year?: number) {
  const url = new URL('https://api.themoviedb.org/3/search/movie')
  url.searchParams.set('api_key', process.env.TMDB_API_KEY || '')
  url.searchParams.set('query', title)
  if (year !== undefined) url.searchParams.set('year', year.toString())

  const res = await fetch(url.toString())
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

async function fetchExternalIDs(tmdbId: number) {
  const url = `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids?api_key=${process.env.TMDB_API_KEY}`
  const res = await fetch(url)
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

async function downloadAndConvertTMDBImage(
  tmdbPath: string,
  baseName: string,
  widths: number[],
  ASSETS_DIR: string
) {
  if (!tmdbPath) return {}

  const url = `https://image.tmdb.org/t/p/original${tmdbPath}`
  const res = await fetch(url.toString())
  if (!res.ok) return {}

  const buffer = Buffer.from(await res.arrayBuffer())
  const result: any = {}

  for (const w of widths) {
    const suffix = w <= 150 ? 'Sm' : w <= 500 ? 'Md' : 'Lg'
    const filePath = path.join(ASSETS_DIR, `${baseName}${suffix}.avif`)

    if (!fs.existsSync(filePath)) {
      await sharp(buffer).resize({ width: w }).avif({ quality: 80 }).toFile(filePath)
      console.log(`[IMAGE] ${filePath} créé`)
    }

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

  const { DATA_DIR, ASSETS_DIR } = getPaths()
  const movieJsonPath = path.join(DATA_DIR, `${movie.tmdbId}-movie.json`)

  let movieData: any = {}
  if (fs.existsSync(movieJsonPath)) {
    movieData = JSON.parse(fs.readFileSync(movieJsonPath, 'utf-8'))
  }

  movieData.id = movie.tmdbId
  movieData.title = movie.title
  movieData.releaseYear = movieData.releaseYear ?? movie.releaseYear ?? year
  movieData.overview = movieData.overview ?? movie.overview ?? ''
  movieData.video = movieData.video ?? { localPath: path.resolve(filepath), provider: 'local' }

  // Poster
  if (!movieData.posterSm || !movieData.posterMd || !movieData.posterLg) {
    if (movie.posterPath) {
      const posterFiles = await downloadAndConvertTMDBImage(
        movie.posterPath,
        `${movie.tmdbId}-poster`,
        [100, 300, 500],
        ASSETS_DIR
      )
      movieData.posterSm = movieData.posterSm || posterFiles.Sm || ''
      movieData.posterMd = movieData.posterMd || posterFiles.Md || ''
      movieData.posterLg = movieData.posterLg || posterFiles.Lg || ''
    }
  }

  // Backdrop
  if (!movieData.backgroundMd || !movieData.backgroundLg) {
    if (movie.backdropPath) {
      const backdropFiles = await downloadAndConvertTMDBImage(
        movie.backdropPath,
        `${movie.tmdbId}-background`,
        [300, 1000],
        ASSETS_DIR
      )
      movieData.backgroundMd = movieData.backgroundMd || backdropFiles.Sm || ''
      movieData.backgroundLg = movieData.backgroundLg || backdropFiles.Lg || ''
    }
  }

  // Enrichissement IDs externes
  const externalIDs = await fetchExternalIDs(movie.tmdbId)
  movieData.imdbId = movieData.imdbId || externalIDs.imdbId
  movieData.wikidataId = movieData.wikidataId || externalIDs.wikidataId

  // Enrichissement narratif depuis Wikidata
  if (movieData.wikidataId && !movieData.wikiDescription) {
    movieData.wikiDescription = await fetchWikiDescription(movieData.wikidataId)
  }

  fs.writeFileSync(movieJsonPath, JSON.stringify(movieData, null, 2), 'utf-8')
  console.log(`[JSON] Movie JSON mis à jour: ${movieJsonPath}`)
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

// -----------------------------
// Surveillance répertoire vidéo
// -----------------------------
function startWatcher() {
  const { VIDEO_DIR } = getPaths()
  const watcher = chokidar.watch(VIDEO_DIR, { ignoreInitial: false })

  watcher.on('add', filePath => {
    console.log(`[WATCHER] Nouveau fichier détecté: ${filePath}`)
    enqueueVideo(filePath)
  })

  console.log(
    `[WORKER] Surveillance du répertoire: ${VIDEO_DIR} avec queue de ${workerParams.MAX_DOWNLOADS} fichiers concurrents`
  )
}

startWatcher()

// -----------------------------
// Monitoring live de la queue
// -----------------------------
function startMonitoring(intervalMs: number = 2000) {
  setInterval(() => {
    console.clear()
    console.log('===== WORKER STATUS =====')
    console.log(`Fichiers en attente   : ${queue.size}`)
    console.log(`Fichiers en cours     : ${queue.pending}`)
    console.log(`Fichiers traités      : ${processedCount}`)
    console.log('=========================')
  }, intervalMs)
}

startMonitoring()
