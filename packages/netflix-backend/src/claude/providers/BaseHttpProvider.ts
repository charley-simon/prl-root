// src/providers/BaseHttpProvider.ts
import { Provider } from './Provider'
import { ProviderError } from './ProviderError'

export abstract class BaseHttpProvider implements Provider {
  abstract readonly name: string

  constructor(
    protected readonly baseUrl: string,
    protected readonly apiKey: string
  ) {}

  // BaseHttpProvider.ts — version améliorée
  protected async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}` // ← seulement si clé présente

    const response = await fetch(url.toString(), { headers })
    if (!response.ok) throw new ProviderError(this.name, response.status, url.toString())
    return response.json() as Promise<T>
  }
}
