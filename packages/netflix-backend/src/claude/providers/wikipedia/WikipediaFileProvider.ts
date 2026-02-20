// src/providers/wikipedia/WikipediaFileProvider.ts
import { BaseFileProvider } from '../BaseFileProvider'
import { WikipediaProvider } from './WikipediaProvider'
import { WikipediaPageSummary } from './wikipedia.types'

export class WikipediaFileProvider extends BaseFileProvider implements WikipediaProvider {
  readonly name = 'wikipedia'

  constructor(basePath: string = './fixtures/wikipedia') {
    super(basePath)
  }

  async getMovieSummary(title: string, year?: number): Promise<WikipediaPageSummary | null> {
    const slug = title.toLowerCase().replace(/\s+/g, '_')
    return this.read<WikipediaPageSummary>(`/movies/${slug}.json`).catch(() => null)
  }

  async getPersonSummary(name: string): Promise<WikipediaPageSummary | null> {
    const slug = name.toLowerCase().replace(/\s+/g, '_')
    return this.read<WikipediaPageSummary>(`/persons/${slug}.json`).catch(() => null)
  }

  async getPageById(pageId: number): Promise<WikipediaPageSummary | null> {
    return this.read<WikipediaPageSummary>(`/pages/${pageId}.json`).catch(() => null)
  }
}
