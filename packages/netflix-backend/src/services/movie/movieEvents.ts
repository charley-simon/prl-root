import { EventEmitter } from 'events'

// Événements liés aux films : ajout ou mise à jour
export const movieEvents = new EventEmitter()

// Typage des événements
export type MovieEventPayload = {
  id: number
  filePath: string
}
