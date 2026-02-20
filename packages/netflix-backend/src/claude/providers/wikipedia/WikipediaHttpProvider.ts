// src/providers/wikipedia/WikipediaHttpProvider.ts
import { BaseHttpProvider } from '../BaseHttpProvider'
import { WikipediaProvider } from './WikipediaProvider'
import { WikipediaPageSummary, WikipediaSearchResult } from './wikipedia.types'
import { ProviderError } from '../ProviderError'

export class WikipediaHttpProvider extends BaseHttpProvider implements WikipediaProvider {
  readonly name = 'wikipedia'

  constructor(private readonly lang: string = 'fr') {
    super(`https://${lang}.wikipedia.org/w`, '') // pas de clé API
  }

  async getMovieSummary(title: string, year?: number): Promise<WikipediaPageSummary | null> {
    const query = year ? `${title} film ${year}` : `${title} film`
    const pageId = await this.search(query)
    if (!pageId) return null
    return this.getPageById(pageId)
  }

  async getPersonSummary(name: string): Promise<WikipediaPageSummary | null> {
    const pageId = await this.search(name)
    if (!pageId) return null
    return this.getPageById(pageId)
  }

  async getPageById(pageId: number): Promise<WikipediaPageSummary | null> {
    const data = await this.get<{ query: { pages: Record<string, WikipediaPageSummary> } }>(
      '/api.php',
      {
        action: 'query',
        pageids: pageId.toString(),
        prop: 'extracts|pageimages|info',
        exintro: '1',
        explaintext: '1',
        inprop: 'url',
        format: 'json',
        origin: '*'
      }
    )

    const page = data.query.pages[pageId.toString()]
    if (!page || page.pageid === -1) return null
    return page
  }

  private async search(query: string): Promise<number | null> {
    const data = await this.get<WikipediaSearchResult>('/api.php', {
      action: 'query',
      list: 'search',
      srsearch: query,
      srlimit: '1',
      format: 'json',
      origin: '*'
    })

    const results = data.query.search
    if (!results.length) return null
    return results[0].pageid
  }
}
