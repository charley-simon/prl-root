import chokidar from 'chokidar'
import path from 'path'
import { enqueueImport } from '../workers/importQueue'
import { logger } from '../utils/logger'
import config from '../config'

const VIDEO_EXTENSIONS = ['.mp4', '.mkv', '.avi', '.mov']

function isVideoFile(filePath: string): boolean {
  return VIDEO_EXTENSIONS.includes(path.extname(filePath).toLowerCase())
}

export function startWatcher() {
  const watchPath = config.paths.videoImport

  logger.info(`👀 Watching folder: ${watchPath}`)

  const watcher = chokidar.watch(watchPath, {
    persistent: true,
    ignoreInitial: true,
    depth: 0
  })

  watcher.on('add', async filePath => {
    if (!isVideoFile(filePath)) {
      logger.debug(`Ignored non-video file: ${filePath}`)
      return
    }

    logger.info(`📥 New video detected: ${filePath}`)

    try {
      await enqueueImport(filePath)
    } catch (err) {
      logger.error('Import enqueue failed', err)
    }
  })

  watcher.on('error', error => {
    logger.error('Watcher error', error)
  })

  return watcher
}
