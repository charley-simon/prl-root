import 'dotenv/config' // charge automatiquement .env à la racine
import fs from 'fs'
import path from 'path'
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { TmdbHttpMovieProvider } from '../src/providers/tmdb/TmdbHttpMovieProvider'
import { TmdbFileMovieProvider } from '../src/providers/tmdb/TmdbFileMovieProvider'
import { MovieIntegrator } from '../src/integrator/MovieIntegrator'
import { TmdbFilePeopleProvider } from '../src/providers/tmdb/TmdbFilePeopleProvider'
import { PeopleIntegrator } from '../src/integrator/PeopleIntegrator'
import { TmdbFileCompanyProvider } from '../src/providers/tmdb/TmdbFileCompanyProvider'
import { CompanyIntegrator } from '../src/integrator/CompanyIntegrator'
import { TmdbMovieBundle } from '../src/providers/tmdb/tmdb.types'
import { TmdbHttpPeopleProvider } from '../src/providers/tmdb/TmdbHttpPeopleProvider'

const TMP_DIR = path.resolve('./data/tmpTestMovie')
const MOVIE_ID = 550
const token = process.env.TMDB_TOKEN
if (!token) throw new Error('TMDB_TOKEN manquant')

describe('TMDB pipeline lazy loading', () => {
  let httpProvider: TmdbHttpMovieProvider
  let fileMovieProvider: TmdbFileMovieProvider
  let movieIntegrator: MovieIntegrator

  beforeAll(() => {
    if (!process.env.TMDB_TOKEN) throw new Error('TMDB_TOKEN manquant')
    httpProvider = new TmdbHttpMovieProvider(process.env.TMDB_TOKEN)
    movieIntegrator = new MovieIntegrator()
  })

  afterAll(async () => {
    // if (fs.existsSync(TMP_DIR)) fs.rmSync(TMP_DIR, { recursive: true })
  })

  it('should save basic snapshot (details + externalIds only)', async () => {
    const { details, externalIds } = await httpProvider.fetchBasic(MOVIE_ID)
    await fs.promises.mkdir(TMP_DIR, { recursive: true })
    await fs.promises.writeFile(
      path.join(TMP_DIR, `${MOVIE_ID}-Movie-Details.json`),
      JSON.stringify(details, null, 2)
    )
    await fs.promises.writeFile(
      path.join(TMP_DIR, `${MOVIE_ID}-Movie-ExternalIds.json`),
      JSON.stringify(externalIds, null, 2)
    )
    expect(fs.existsSync(path.join(TMP_DIR, `${MOVIE_ID}-Movie-Details.json`))).toBe(true)
  })

  it('should enrich with credits + images lazily', async () => {
    // Lazy load credits + images
    const credits = await httpProvider.fetchCredits(MOVIE_ID)
    const images = await httpProvider.fetchImages(
      await httpProvider.fetchBasic(MOVIE_ID).then(r => r.details)
    )

    // Save credits + images
    await fs.promises.writeFile(
      path.join(TMP_DIR, `${MOVIE_ID}-Movie-Credits.json`),
      JSON.stringify(credits, null, 2)
    )
    const imagesDir = path.join(TMP_DIR, 'images', 'originals')
    await fs.promises.mkdir(imagesDir, { recursive: true })
    for (const [type, buffer] of Object.entries(images)) {
      const fileName = `${MOVIE_ID}-${type}.jpg`
      await fs.promises.writeFile(path.join(imagesDir, fileName), Buffer.from(buffer))
    }

    // Read via FileProvider
    fileMovieProvider = new TmdbFileMovieProvider(TMP_DIR)
    const bundle: TmdbMovieBundle = {
      details: await fileMovieProvider.getMovieDetails(MOVIE_ID),
      externalIds: await fileMovieProvider.getExternalIds(MOVIE_ID),
      credits: await fileMovieProvider.getCredits(MOVIE_ID),
      images: {
        posters: [{ file_path: `${MOVIE_ID}-poster.jpg` }],
        backdrops: [{ file_path: `${MOVIE_ID}-backdrop.jpg` }],
        logos: [] // <-- obligatoire selon TmdbMovieImages
      }
    }

    const movie = await movieIntegrator.integrate(bundle)
    expect(movie.cast.length).toBeGreaterThan(0)
    expect(movie.poster).toBeDefined()
  })

  it('should integrate People and Companies from FileProvider (lazy loading)', async () => {
    // --- 1️⃣ Lazy load cast members via HTTP et snapshot ---
    const httpPeopleProvider = new TmdbHttpPeopleProvider(token)

    const credits = await fileMovieProvider.getCredits(MOVIE_ID)
    const castToLoad = credits.cast.slice(0, 3) // limite à 3 personnes pour le test

    for (const castMember of castToLoad) {
      // snapshot sur disque : {id}-Person-Details.json + image
      await httpPeopleProvider.saveSnapshot(castMember.id, TMP_DIR)
    }

    // --- 2️⃣ Lecture via FileProvider ---
    const filePeopleProvider = new TmdbFilePeopleProvider(TMP_DIR)
    const peopleIntegrator = new PeopleIntegrator()

    const integratedPeople = []
    for (const castMember of castToLoad) {
      const person = await filePeopleProvider.getPersonDetails(castMember.id)
      const profileFile = person.profile_path ? `${person.id}-profile.jpg` : undefined
      const integrated = await peopleIntegrator.integrate(person, profileFile)
      integratedPeople.push(integrated)
    }

    expect(integratedPeople.length).toBe(castToLoad.length)
    expect(integratedPeople[0].name).toBeDefined()
    expect(integratedPeople[0].profile).toBeDefined()

    // --- 3️⃣ Companies ---
    const companiesJson = path.resolve('./data/companies.json')
    const companiesAssets = path.resolve('./data/assets/companies')
    const fileCompanyProvider = new TmdbFileCompanyProvider(companiesJson, companiesAssets)
    const companyIntegrator = new CompanyIntegrator()

    const allCompanies = await fileCompanyProvider.getAllCompanies()
    if (allCompanies.length > 0) {
      const company = allCompanies[0]
      const logo = await fileCompanyProvider.getLogo(company.id)
      const integratedCompany = await companyIntegrator.integrate(company, `${company.id}-logo.png`)
      expect(integratedCompany.name).toBeDefined()
      expect(integratedCompany.logo).toBeDefined()
    }
  })
})
