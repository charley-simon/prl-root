import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { TmdbPerson } from './tmdb.types'
import { Person } from '../../schemas/people/person-detail.schema'
import { IEntityProvider } from '../EntityProvider'

export class TmdbHttpPeopleProvider implements IEntityProvider<Person> {
  constructor(private token: string) {}

  async enrich(person: Person): Promise<Person> {
    const result = person.name
    return person
  }

  private get headers() {
    return { Authorization: `Bearer ${this.token}`, Accept: 'application/json' }
  }

  private async getJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { headers: this.headers })
    if (!res.ok) throw new Error(`HTTP error ${res.status} for ${url}`)
    return res.json() as Promise<T>
  }

  private async getImageData(filePath: string): Promise<ArrayBuffer> {
    const url = `https://image.tmdb.org/t/p/original${filePath}`
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Cannot fetch image ${filePath}`)
    return await res.arrayBuffer()
  }

  async fetchBasic(id: number) {
    return this.getJson<TmdbPerson>(`https://api.themoviedb.org/3/person/${id}?language=fr-FR`)
  }

  async saveSnapshot(id: number, outputDir: string) {
    const person = await this.fetchBasic(id)

    await fs.promises.mkdir(outputDir, { recursive: true })
    await fs.promises.writeFile(
      path.join(outputDir, `${id}-Person-Details.json`),
      JSON.stringify(person, null, 2)
    )

    if (person.profile_path) {
      const imagesDir = path.join(outputDir, 'images', 'originals')
      await fs.promises.mkdir(imagesDir, { recursive: true })
      const buffer = await this.getImageData(person.profile_path)
      const ext = '.jpg'
      const fileName = `${id}-profile${ext}`
      await fs.promises.writeFile(path.join(imagesDir, fileName), Buffer.from(buffer))
    }
  }
}
