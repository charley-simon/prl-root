import chokidar from 'chokidar'
import path from 'path'
import fs from 'fs'
import { handleVideoFile } from '../providers/tmdbUtils'

const WATCH_DIR = path.resolve('./incoming')

// extensions autorisées
const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov']

// fichiers déjà traités (évite double trigger)
const processed = new Set<string>()

function isVideoFile(file: string) {
  return VIDEO_EXTENSIONS.includes(path.extname(file).toLowerCase())
}

// attendre que le fichier soit complètement copié
async function waitForFileReady(filepath: string, timeout = 10000) {
  const start = Date.now()

  while (true) {
    try {
      const size1 = fs.statSync(filepath).size
      await new Promise(r => setTimeout(r, 500))
      const size2 = fs.statSync(filepath).size

      if (size1 === size2) return
    } catch {
      // fichier encore indisponible
    }

    if (Date.now() - start > timeout) {
      throw new Error('Timeout attente fichier prêt')
    }
  }
}

export function startWatcher() {
  console.log(`👀 Surveillance dossier: ${WATCH_DIR}`)

  const watcher = chokidar.watch(WATCH_DIR, {
    ignoreInitial: true,
    persistent: true,
    depth: 0
  })

  watcher.on('add', async filepath => {
    if (!isVideoFile(filepath)) return
    if (processed.has(filepath)) return

    processed.add(filepath)

    console.log(`📥 Nouveau fichier détecté: ${path.basename(filepath)}`)

    try {
      await waitForFileReady(filepath)

      console.log('📦 Fichier prêt, traitement en cours...')

      await handleVideoFile(filepath)

      console.log('✅ Traitement terminé')
    } catch (err) {
      console.error('❌ Erreur traitement fichier:', err)
    }
  })

  watcher.on('error', error => {
    console.error('Watcher error:', error)
  })

  return watcher
}
