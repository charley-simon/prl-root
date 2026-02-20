// src/utils/id.ts
// Fichier JSON qui persiste le dernier ID
import * as fs from 'fs'

const ID_FILE = './data/.last_id.json'

function loadLastId(): number {
  try {
    const raw = fs.readFileSync(ID_FILE, 'utf-8')
    return JSON.parse(raw).lastId ?? 0
  } catch {
    return 0 // premier démarrage
  }
}

function saveLastId(id: number): void {
  fs.writeFileSync(ID_FILE, JSON.stringify({ lastId: id }))
}

let currentId = loadLastId()

export function nextId(): number {
  currentId += 1
  saveLastId(currentId)
  return currentId
}
