import { EventEmitter } from 'events'

export enum UserEventType {
  FileAdded = 'file-added',
  MovieClicked = 'movie-clicked'
}
export enum EngineEventType {
  SnapshotReady = 'snapshot-ready',
  EnrichmentDone = 'enrichment-done',
  DowngradePerformed = 'downgrade-performed',
  HousekeepingDone = 'housekeeping-done'
}
export enum StatsEventType {
  MovieViewed = 'movie-viewed',
  StatsPersisted = 'stats-persisted'
}

export const userEvents = new EventEmitter()
export const engineEvents = new EventEmitter()
export const statsEvents = new EventEmitter()
