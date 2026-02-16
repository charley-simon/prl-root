import 'dotenv/config' // charge automatiquement .env à la racine
import { describe, it, expect } from 'vitest'
import { TmdbClient } from '../src/providers/tmdb/tmdbCient'
import { JsonSnapshotService } from '../src/services/jsonSnapshotService'

const client = new TmdbClient(process.env.TMDB_TOKEN!)
const snapshot = new JsonSnapshotService('./data/tmdb/movies')

const MOVIE_ID = 550 // Fight Club

describe('TMDB snapshot', () => {
  it('fetch and save movie data', async () => {
    const details = await client.getMovie(MOVIE_ID)
    await snapshot.save(`${MOVIE_ID}-Movie-Details.json`, details)

    const externalIds = await client.getExternalIds(MOVIE_ID)
    await snapshot.save(`${MOVIE_ID}-Movie-ExternalIds.json`, externalIds)

    const credits = await client.getCredits(MOVIE_ID)
    await snapshot.save(`${MOVIE_ID}-Movie-Credits.json`, credits)

    expect(details.id).toBe(MOVIE_ID)
    expect(externalIds.id).toBe(MOVIE_ID)
    expect(credits.id).toBe(MOVIE_ID)
  })
})
