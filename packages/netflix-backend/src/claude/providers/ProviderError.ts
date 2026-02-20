// src/providers/ProviderError.ts
export class ProviderError extends Error {
  constructor(
    public readonly providerName: string,
    public readonly statusCode: number,
    public readonly url: string
  ) {
    super(`[${providerName}] HTTP ${statusCode} on ${url}`)
    this.name = 'ProviderError'
  }
}
