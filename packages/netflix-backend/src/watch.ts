import 'dotenv/config' // charge automatiquement .env à la racine
import { startWatcher } from './workers/watcher'

startWatcher()
