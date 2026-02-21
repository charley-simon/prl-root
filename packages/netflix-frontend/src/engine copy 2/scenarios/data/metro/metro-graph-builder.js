import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

/**
 * Script de génération de graphe métro
 * Usage :
 *   node metro-graph-builder.js correspondances.csv output.json
 */

const inputCSV = process.argv[2]
const outputJSON = process.argv[3] || 'metroGraph.json'

if (!inputCSV) {
  console.error('Usage: node metro-graph-builder.js correspondances.csv [output.json]')
  process.exit(1)
}

// Lire le CSV
const content = fs.readFileSync(path.resolve(inputCSV), 'utf-8')
const records = parse(content, {
  columns: true,
  skip_empty_lines: true
})

// Transforme en map { 'Station': ['Line1','Line2',...] }
const stationLinesMap = records.reduce((map, row) => {
  const station = row.station_name.trim()
  const line = row.line.trim()
  console.log(`line: ${line}`)
  if (!map[station]) map[station] = new Set()
  map[station].add(line)

  return map
}, {})

// Construire la liste de stations uniques encodées par ligne
const nodes = []
const edges = []

// stationLineNodes : clés "L{line}:{station}"
const stationLineNodes = {}

Object.entries(stationLinesMap).forEach(([station, lineSet]) => {
  lineSet.forEach(line => {
    const id = `L${line}:${station}`
    stationLineNodes[id] = { station, line }
    nodes.push({ id, station, line })
  })
})

// Générer les correspondances
Object.values(stationLinesMap).forEach(lineSet => {
  const lines = Array.from(lineSet)
  if (lines.length <= 1) return

  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const id1 = `L${lines[i]}:${station}`
      const id2 = `L${lines[j]}:${station}`

      // Ajoute un lien de correspondance avec un coût de transfert (3 min)
      edges.push({
        from: id1,
        to: id2,
        type: 'transfer',
        weight: 3
      })
      edges.push({
        from: id2,
        to: id1,
        type: 'transfer',
        weight: 3
      })
    }
  }
})

// Générer les liaisons directes par ligne
const lineStations = {}
Object.entries(stationLinesMap).forEach(([station, lineSet]) => {
  lineSet.forEach(line => {
    if (!lineStations[line]) lineStations[line] = []
    lineStations[line].push(station)
  })
})

Object.entries(lineStations).forEach(([line, stations]) => {
  stations.sort() // ou selon ton propre ordre si tu l’as
  stations.forEach((station, idx) => {
    if (idx < stations.length - 1) {
      const from = `L${line}:${station}`
      const to = `L${line}:${stations[idx + 1]}`

      edges.push({
        from,
        to,
        type: 'travel',
        weight: 1
      })
      edges.push({
        from: to,
        to: from,
        type: 'travel',
        weight: 1
      })
    }
  })
})

// Sortie finale
const output = {
  nodes,
  edges
}

fs.writeFileSync(path.resolve(outputJSON), JSON.stringify(output, null, 2), 'utf-8')
console.log('Graph generated:', outputJSON)
