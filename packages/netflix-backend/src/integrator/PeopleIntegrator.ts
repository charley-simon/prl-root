import { TmdbPerson } from '../providers/tmdb/tmdb.types'

export interface Person {
  id: number
  name: string
  profile: string
  known_for_department: string
}

export class PeopleIntegrator {
  async integrate(person: TmdbPerson, profileFile?: string): Promise<Person> {
    return {
      id: person.id,
      name: person.name,
      profile: profileFile || '',
      known_for_department: person.known_for_department
    }
  }
}
