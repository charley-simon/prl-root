// src/providers/wikipedia/wikipedia.types.ts
export interface WikipediaSearchResult {
  query: {
    search: Array<{
      pageid: number
      title: string
      snippet: string
    }>
  }
}

export interface WikipediaPageSummary {
  pageid: number
  title: string
  extract: string
  thumbnail?: {
    source: string
    width: number
    height: number
  }
  content_urls?: {
    desktop: { page: string }
    mobile: { page: string }
  }
}
