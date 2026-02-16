export type EnrichLevel = 'basic' | 'medium' | 'deep'
export type MovieStatus = 'initial' | 'basic' | 'medium' | 'complete'

export interface MovieStats {
  lastAccess: number
  views: number
}
export interface Movie {
  id: number
  title: string
  year?: number
  filePath?: string
  status: MovieStatus
  stats: MovieStats
  data?: any // bundle intégré par couche
}
