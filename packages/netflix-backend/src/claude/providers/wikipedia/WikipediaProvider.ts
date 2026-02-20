// src/providers/wikipedia/WikipediaProvider.ts  ← interface uniquement
import { WikipediaPageSummary } from './wikipedia.types'

export interface WikipediaProvider {
  getMovieSummary(title: string, year?: number): Promise<WikipediaPageSummary | null>
  getPersonSummary(name: string): Promise<WikipediaPageSummary | null>
  getPageById(pageId: number): Promise<WikipediaPageSummary | null>
}
