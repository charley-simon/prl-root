import fs from 'fs'
import path from 'path'
import { TmdbPerson } from './tmdb.types'
import { Person } from '../../schemas/people/person-detail.schema'
import { IEntityProvider } from '../EntityProvider'

export class TmdbFilePeopleProvider implements IEntityProvider<Person> {
  constructor(private baseDir: string) {}

  async enrich(person: Person): Promise<Person> {
    return person
  }

  private async readJson<T>(fileName: string): Promise<T> {
    const filePath = path.join(this.baseDir, fileName)
    const raw = await fs.promises.readFile(filePath, 'utf-8')
    return JSON.parse(raw) as T
  }

  async getPersonDetails(id: number): Promise<TmdbPerson> {
    return this.readJson<TmdbPerson>(`${id}-Person-Details.json`)
  }

  async getImage(fileName: string): Promise<ArrayBuffer> {
    const filePath = path.join(this.baseDir, 'images', 'originals', fileName)
    const buffer = await fs.promises.readFile(filePath)
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
  }
}
