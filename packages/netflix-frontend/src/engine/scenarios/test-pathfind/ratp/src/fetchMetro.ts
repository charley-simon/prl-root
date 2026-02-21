import * as fs from 'fs'
import * as path from 'path'
import * as https from 'https'
import * as http from 'http'
import * as readline from 'readline'
import AdmZip from 'adm-zip'

// ─────────────────────────────────────────────
// Types GTFS (entrée)
// ─────────────────────────────────────────────

interface GtfsRoute {
  route_id: string
  route_short_name: string
  route_long_name: string
  route_type: string
  route_color?: string
}

interface GtfsTrip {
  route_id: string
  trip_id: string
  direction_id: string
  trip_headsign?: string
}

interface GtfsStopTime {
  trip_id: string
  arrival_time: string
  departure_time: string
  stop_id: string
  stop_sequence: string
}

interface GtfsStop {
  stop_id: string
  stop_name: string
  stop_lat: string
  stop_lon: string
}

interface GtfsTransfer {
  from_stop_id: string
  to_stop_id: string
  transfer_type: string
  min_transfer_time?: string
}

// ─────────────────────────────────────────────
// Types de sortie — graph.json
// ─────────────────────────────────────────────

type RelationType = 'DIRECT' | 'TRANSFER'

interface DirectMetadata {
  type: 'DIRECT'
  lineId: string
  lineName: string
  direction: string // terminus de la ligne dans ce sens
  travelTimeMinutes: number
  travelTimeSeconds: number
}

interface TransferMetadata {
  type: 'TRANSFER'
  stationName: string
  lineFrom: string
  lineTo: string
  walkTimeMinutes: number
  walkTimeSeconds: number
}

interface Relation {
  name: string
  fromEntity: string
  toEntity: string
  via: string
  weight: number // minutes, arrondi
  metadata: DirectMetadata | TransferMetadata
}

interface StationNode {
  id: string
  name: string
  lines: string[]
  coordinates: { lat: number; lon: number }
}

interface GraphJson {
  relations: Relation[]
  stations: StationNode[]
  metadata: {
    source: string
    date: string
    totalStations: number
    totalLines: number
    totalRelations: number
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Slugifie un nom de station pour en faire un identifiant stable */
function slugify(name: string): string {
  return (
    'Station-' +
    name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // retire les accents
      .replace(/[^a-zA-Z0-9]+/g, '-') // remplace tout non-alphanum par -
      .replace(/^-+|-+$/g, '') // retire les tirets en début/fin
      .toLowerCase()
  )
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let inQuote = false
  let current = ''
  for (const char of line) {
    if (char === '"') {
      inQuote = !inQuote
      continue
    }
    if (char === ',' && !inQuote) {
      values.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  values.push(current.trim())
  return values
}

function parseCsv<T>(content: string): T[] {
  const lines = content.replace(/\r/g, '').split('\n').filter(Boolean)
  if (lines.length < 2) return []
  const headers = parseCsvLine(lines[0]).map(h => h.replace(/^\uFEFF/, ''))
  return lines.slice(1).map(line => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])) as T
  })
}

function streamCsv<T>(filePath: string, onRow: (row: T) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
      crlfDelay: Infinity
    })
    let headers: string[] = []
    let isFirst = true
    rl.on('line', line => {
      if (!line.trim()) return
      if (isFirst) {
        headers = parseCsvLine(line).map(h => h.replace(/^\uFEFF/, ''))
        isFirst = false
        return
      }
      const values = parseCsvLine(line)
      onRow(Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ''])) as T)
    })
    rl.on('close', resolve)
    rl.on('error', reject)
  })
}

function download(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http
    lib
      .get(url, res => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return download(res.headers.location).then(resolve).catch(reject)
        }
        if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`))
        const chunks: Buffer[] = []
        res.on('data', c => chunks.push(c))
        res.on('end', () => resolve(Buffer.concat(chunks)))
        res.on('error', reject)
      })
      .on('error', reject)
  })
}

function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(':').map(Number)
  return h * 3600 + m * 60 + (s ?? 0)
}

// ─────────────────────────────────────────────
// Préparation GTFS — extraction sélective
// ─────────────────────────────────────────────

const GTFS_URL = 'https://eu.ftp.opendatasoft.com/stif/GTFS/IDFM-gtfs.zip'
const SMALL_FILES = ['routes.txt', 'trips.txt', 'stops.txt', 'transfers.txt']
const BIG_FILE = 'stop_times.txt'

async function prepareGtfs(): Promise<{ inMemory: Map<string, string>; stopTimesPath: string }> {
  const cacheDir = path.join(__dirname, '.cache')
  const zipFile = path.join(cacheDir, 'gtfs.zip')
  const stopTimesFile = path.join(cacheDir, BIG_FILE)

  if (!fs.existsSync(zipFile)) {
    console.log('⬇️  Téléchargement du GTFS IDFM (~100 Mo)...')
    const buffer = await download(GTFS_URL)
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.writeFileSync(zipFile, buffer)
    console.log('✅ Téléchargé.')
  } else {
    console.log('📦 Zip en cache.')
  }

  console.log('📂 Extraction sélective...')
  const zip = new AdmZip(zipFile)
  const inMemory = new Map<string, string>()

  for (const entry of zip.getEntries()) {
    const name = path.basename(entry.entryName)
    if (SMALL_FILES.includes(name)) {
      inMemory.set(name, entry.getData().toString('utf-8'))
      console.log(`   ✓ ${name} (${(entry.getData().length / 1024).toFixed(0)} Ko)`)
    } else if (name === BIG_FILE) {
      if (!fs.existsSync(stopTimesFile)) {
        console.log(`   ⏳ ${name} → disque...`)
        fs.mkdirSync(cacheDir, { recursive: true })
        fs.writeFileSync(stopTimesFile, entry.getData())
        console.log(`   ✓ ${name} extrait.`)
      } else {
        console.log(`   ✓ ${name} déjà sur disque.`)
      }
    }
  }

  return { inMemory, stopTimesPath: stopTimesFile }
}

// ─────────────────────────────────────────────
// Construction du graph.json
// ─────────────────────────────────────────────

export async function buildGraph(): Promise<GraphJson> {
  const { inMemory, stopTimesPath } = await prepareGtfs()

  console.log('\n🔍 Parsing GTFS...')
  const routes = parseCsv<GtfsRoute>(inMemory.get('routes.txt')!)
  const trips = parseCsv<GtfsTrip>(inMemory.get('trips.txt')!)
  const stops = parseCsv<GtfsStop>(inMemory.get('stops.txt')!)
  const transfers = parseCsv<GtfsTransfer>(inMemory.get('transfers.txt')!)

  // ── Lignes de métro
  const metroRoutes = routes.filter(r => r.route_type === '1')
  console.log(`   → ${metroRoutes.length} lignes de métro`)
  const metroRouteIds = new Set(metroRoutes.map(r => r.route_id))

  // ── Index stops
  const stopsById = new Map(stops.map(s => [s.stop_id, s]))

  // ── Trip représentatif par ligne × direction
  //    On prend celui qui a le plus de stops (= trajet complet, pas un partiel)
  //    Pour cela on collecte d'abord tous les trips métro, puis on choisit après le streaming
  const metroTripToRoute = new Map<
    string,
    { routeId: string; directionId: string; headsign: string }
  >()
  for (const trip of trips) {
    if (!metroRouteIds.has(trip.route_id)) continue
    metroTripToRoute.set(trip.trip_id, {
      routeId: trip.route_id,
      directionId: trip.direction_id,
      headsign: trip.trip_headsign ?? ''
    })
  }

  // ── Lecture streaming : compter les stops par trip pour choisir le plus complet
  console.log('   → Streaming stop_times (sélection du trip le plus complet)...')
  const tripStopCount = new Map<string, number>()

  await streamCsv<GtfsStopTime>(stopTimesPath, row => {
    if (!metroTripToRoute.has(row.trip_id)) return
    tripStopCount.set(row.trip_id, (tripStopCount.get(row.trip_id) ?? 0) + 1)
  })

  // Pour chaque route × direction, garder le trip avec le plus de stops
  const representativeTrips = new Map<string, Record<string, string>>() // routeId → { "0": tripId, "1": tripId }
  for (const [tripId, { routeId, directionId }] of metroTripToRoute) {
    const count = tripStopCount.get(tripId) ?? 0
    const current = representativeTrips.get(routeId) ?? {}
    const bestId = current[directionId]
    const bestCount = bestId ? (tripStopCount.get(bestId) ?? 0) : -1
    if (count > bestCount) {
      current[directionId] = tripId
      representativeTrips.set(routeId, current)
    }
  }

  const wantedTripIds = new Set([...representativeTrips.values()].flatMap(d => Object.values(d)))
  console.log(`   → ${wantedTripIds.size} trips retenus`)

  // ── Deuxième passe streaming : récupérer les stop_times des trips retenus
  console.log('   → Streaming stop_times (collecte des arrêts)...')
  const stopTimesByTrip = new Map<string, GtfsStopTime[]>()
  await streamCsv<GtfsStopTime>(stopTimesPath, row => {
    if (!wantedTripIds.has(row.trip_id)) return
    const arr = stopTimesByTrip.get(row.trip_id) ?? []
    arr.push(row)
    stopTimesByTrip.set(row.trip_id, arr)
  })

  for (const arr of stopTimesByTrip.values()) {
    arr.sort((a, b) => Number(a.stop_sequence) - Number(b.stop_sequence))
  }

  // ── stop_id → Set<lineShortName> (pour résoudre les correspondances)
  const stopIdToLines = new Map<string, Set<string>>()
  for (const [routeId, dirTrips] of representativeTrips) {
    const route = metroRoutes.find(r => r.route_id === routeId)!
    for (const tripId of Object.values(dirTrips)) {
      for (const st of stopTimesByTrip.get(tripId) ?? []) {
        const set = stopIdToLines.get(st.stop_id) ?? new Set()
        set.add(route.route_short_name)
        stopIdToLines.set(st.stop_id, set)
      }
    }
  }

  // ── Index transfers : from_stop_id → Transfer[]
  const transfersByStop = new Map<string, GtfsTransfer[]>()
  for (const tr of transfers) {
    // Ignorer les auto-transferts (même stop) et les non-métro
    if (tr.from_stop_id === tr.to_stop_id) continue
    if (!stopIdToLines.has(tr.from_stop_id) && !stopIdToLines.has(tr.to_stop_id)) continue
    const arr = transfersByStop.get(tr.from_stop_id) ?? []
    arr.push(tr)
    transfersByStop.set(tr.from_stop_id, arr)
  }

  // ──────────────────────────────────────────
  // Construction des relations
  // ──────────────────────────────────────────
  console.log('🏗️  Construction du graphe...')
  const relations: Relation[] = []
  const stationNodesMap = new Map<string, StationNode>() // slugId → node

  for (const route of metroRoutes) {
    const dirTrips = representativeTrips.get(route.route_id)
    if (!dirTrips) continue

    for (const [dirId, tripId] of Object.entries(dirTrips)) {
      const sts = stopTimesByTrip.get(tripId) ?? []
      if (sts.length === 0) continue

      // Terminus = nom du dernier arrêt dans ce sens
      const terminusStop = stopsById.get(sts[sts.length - 1].stop_id)
      const direction = terminusStop?.stop_name ?? '?'

      for (let i = 0; i < sts.length; i++) {
        const cur = sts[i]
        const stop = stopsById.get(cur.stop_id)
        if (!stop) continue

        const stationId = slugify(stop.stop_name)

        // Enregistrer le nœud station
        if (!stationNodesMap.has(stationId)) {
          stationNodesMap.set(stationId, {
            id: stationId,
            name: stop.stop_name,
            lines: [],
            coordinates: { lat: parseFloat(stop.stop_lat), lon: parseFloat(stop.stop_lon) }
          })
        }
        const node = stationNodesMap.get(stationId)!
        if (!node.lines.includes(route.route_short_name)) {
          node.lines.push(route.route_short_name)
        }

        // Relation DIRECT vers la station suivante
        if (i < sts.length - 1) {
          const next = sts[i + 1]
          const nextStop = stopsById.get(next.stop_id)
          if (!nextStop) continue

          const travelSec = timeToSeconds(next.arrival_time) - timeToSeconds(cur.departure_time)
          const travelMin = Math.max(1, Math.round(travelSec / 60))

          const fromId = slugify(stop.stop_name)
          const toId = slugify(nextStop.stop_name)

          relations.push({
            name: `${fromId}--${toId}--l${route.route_short_name}-dir${dirId}`,
            fromEntity: fromId,
            toEntity: toId,
            via: `Ligne-${route.route_short_name}`,
            weight: travelMin,
            metadata: {
              type: 'DIRECT',
              lineId: route.route_short_name,
              lineName: `Ligne ${route.route_short_name}`,
              direction,
              travelTimeMinutes: travelMin,
              travelTimeSeconds: travelSec
            }
          })
        }
      }
    }
  }

  // ── Relations TRANSFER (correspondances)
  // On ne génère les transferts qu'une fois par paire (from/to) pour éviter les doublons
  const seenTransfers = new Set<string>()

  for (const [fromStopId, trList] of transfersByStop) {
    const fromStop = stopsById.get(fromStopId)
    const fromLines = stopIdToLines.get(fromStopId)
    if (!fromStop || !fromLines) continue

    for (const tr of trList) {
      const toStop = stopsById.get(tr.to_stop_id)
      const toLines = stopIdToLines.get(tr.to_stop_id)
      if (!toStop || !toLines) continue

      // Paires de lignes concernées par cette correspondance physique
      for (const lineFrom of fromLines) {
        for (const lineTo of toLines) {
          if (lineFrom === lineTo) continue

          const fromId = slugify(fromStop.stop_name)
          const toId = slugify(toStop.stop_name)
          const pairKey = [fromId, toId, lineFrom, lineTo].sort().join('|')
          if (seenTransfers.has(pairKey)) continue
          seenTransfers.add(pairKey)

          const walkSec = Number(tr.min_transfer_time ?? 120)
          const walkMin = Math.max(1, Math.round(walkSec / 60))

          relations.push({
            name: `transfer--${fromId}--l${lineFrom}--l${lineTo}`,
            fromEntity: fromId,
            toEntity: toId,
            via: 'Correspondance',
            weight: walkMin,
            metadata: {
              type: 'TRANSFER',
              stationName: fromStop.stop_name,
              lineFrom,
              lineTo,
              walkTimeMinutes: walkMin,
              walkTimeSeconds: walkSec
            }
          })
        }
      }
    }
  }

  // ── Nœuds stations (dédoublonnés, triés par nom)
  const stationNodes = [...stationNodesMap.values()].sort((a, b) => a.name.localeCompare(b.name))

  return {
    relations,
    stations: stationNodes,
    metadata: {
      source: 'IDFM GTFS',
      date: new Date().toISOString().slice(0, 10),
      totalStations: stationNodes.length,
      totalLines: metroRoutes.length,
      totalRelations: relations.length
    }
  }
}

// ─────────────────────────────────────────────
// Point d'entrée
// ─────────────────────────────────────────────

async function main() {
  const graph = await buildGraph()

  const outDir = path.join(__dirname, '..', 'output')
  fs.mkdirSync(outDir, { recursive: true })

  const jsonPath = path.join(outDir, 'graph.json')
  fs.writeFileSync(jsonPath, JSON.stringify(graph, null, 2), 'utf-8')
  console.log(`\n✅ graph.json sauvegardé : ${jsonPath}`)

  const { metadata, relations, stations } = graph
  console.log(
    `\n📊 ${metadata.totalLines} lignes | ${metadata.totalStations} stations | ${metadata.totalRelations} relations`
  )

  const directs = relations.filter(r => r.metadata.type === 'DIRECT').length
  const transfers = relations.filter(r => r.metadata.type === 'TRANSFER').length
  console.log(`   → ${directs} relations DIRECT + ${transfers} relations TRANSFER`)

  // Aperçu : stations avec le plus de correspondances
  const topStations = stations
    .filter(s => s.lines.length > 1)
    .sort((a, b) => b.lines.length - a.lines.length)
    .slice(0, 8)

  console.log('\n🔗 Stations avec le plus de correspondances :')
  for (const s of topStations) {
    console.log(`   ${s.name.padEnd(35)} Lignes : ${s.lines.sort().join(', ')}`)
  }

  // Aperçu Châtelet
  const chateletRelations = relations.filter(
    r => r.fromEntity.includes('chatelet') || r.toEntity.includes('chatelet')
  )
  console.log(`\n📍 Relations impliquant Châtelet : ${chateletRelations.length}`)
  for (const r of chateletRelations.slice(0, 10)) {
    console.log(
      `   [${r.metadata.type.padEnd(8)}] ${r.fromEntity} → ${r.toEntity}  via ${r.via}  (${r.weight}min)`
    )
  }
}

main().catch(err => {
  console.error('❌ Erreur :', err.message)
  process.exit(1)
})
