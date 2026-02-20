// src/utils/id.ts
import * as fs from 'fs'

const ID_FILE = './data/.last_ids.json'
const SAVE_EVERY = 10 // sauvegarde tous les N appels

let counters: Record<string, number> = {}
let callsSinceSave = 0

function load(): void {
  try {
    const raw = fs.readFileSync(ID_FILE, 'utf-8')
    counters = JSON.parse(raw)
  } catch {
    counters = {} // premier démarrage
  }
}

function save(): void {
  fs.writeFileSync(ID_FILE, JSON.stringify(counters, null, 2))
  callsSinceSave = 0
}

load() // une fois au démarrage
// Pourquoi pas rechercher le dernier id de chaque table a chauqe démarrage, je charges les tables en mémoire de toute façon à cause de json !

export function nextId(table: string): number {
  counters[table] = (counters[table] ?? 0) + 1
  callsSinceSave++

  if (callsSinceSave >= SAVE_EVERY) save()

  return counters[table]
}

// Appel explicite en fin de process
export function flushIds(): void {
  save()
}

/* Le flushIds() est important — tu le branches sur l'arrêt propre du process :
process.on('SIGINT', () => {
  flushIds()
  process.exit(0)
})
Un seul risque : si le process crash entre deux sauvegardes, tu perds les N derniers IDs — donc des trous dans la séquence.
Mais tu l'acceptes déjà, et la reconstruction reste simple.
*/
