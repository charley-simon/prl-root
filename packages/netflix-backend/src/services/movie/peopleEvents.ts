import { EventEmitter } from 'events'

// Événements liés aux films : ajout ou mise à jour
export const peopleEvents = new EventEmitter()

// Typage des événements
export type PeopleEventPayload = {
  id: number
  filePath: string
}
