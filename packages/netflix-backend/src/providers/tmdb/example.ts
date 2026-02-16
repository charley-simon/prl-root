// example.ts
import 'dotenv/config' // charge automatiquement .env à la racine
import { HttpClient } from './httpClient'
import { config } from './config'
import { ImageService } from './imageService'
import { TmdbMovieRepository } from './tmdbMovieRepository'

async function main() {
  const http = new HttpClient(config.tmdbToken)
  const repo = new TmdbMovieRepository(http)
  const imageService = new ImageService()

  const movieId = 550

  const details = await repo.getDetails(movieId)
  console.log('Titre:', details.title)

  const credits = await repo.getCredits(movieId)
  console.log('Acteurs:', credits.cast.length)

  const external = await repo.getExternalIds(movieId)
  console.log('IMDB:', external.imdb_id)

  if (details.poster_path) {
    const buffer = await repo.getImage(details.poster_path)

    await imageService.saveAvif(buffer, `${config.assetsDir}/${movieId}-poster.avif`)

    await imageService.saveVariants(
      buffer,
      `${config.assetsDir}/${movieId}-poster`,
      [100, 500, 1000]
    )
  }

  if (details.backdrop_path) {
    const buffer = await repo.getImage(details.backdrop_path)

    await imageService.saveVariants(
      buffer,
      `${config.assetsDir}/${movieId}-backdrop`,
      [300, 800, 1280]
    )
  }
}

main()
