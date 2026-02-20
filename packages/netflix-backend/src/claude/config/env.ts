// src/config/env.ts — validation au démarrage, pas de process.env éparpillés partout
import { config } from 'dotenv'
config()

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required env variable: ${key}`)
  return value
}

export const ENV = {
  tmdbToken: requireEnv('TMDB_TOKEN'),
  appNamespace: requireEnv('APP_NAMESPACE'),
  videoImport: requireEnv('VIDEO_IMPORT'),
  dataDir: requireEnv('DATA_DIR'),
  workerMaxConcurrent: Number(process.env.WORKER_MAX_CONCURRENT ?? 3)
}
