import { loadUsers } from './userLoader'
import { User, UserPreferences } from '../../schemas/users/user.schema'
import { DEFAULT_PREFERENCES } from './defaultPreferences'

export class UserCache {
  private usersById = new Map<number, User>()
  private usersByName = new Map<string, User>()

  constructor(dataPath: string) {
    const users = loadUsers(dataPath)

    for (const user of users) {
      const normalized = this.normalize(user)
      this.usersById.set(normalized.id, normalized)
      this.usersByName.set(normalized.name, normalized)
    }

    console.log(`👥 Users loaded: ${users.length}`)
  }

  private normalize(user: User): User {
    return {
      ...user,
      preferences: this.normalizePreferences(user.preferences)
    }
  }

  private normalizePreferences(prefs?: Partial<UserPreferences>): UserPreferences {
    return {
      favoriteCategories: prefs?.favoriteCategories ?? [],
      minYear: prefs?.minYear,
      sortBy: prefs?.sortBy ?? DEFAULT_PREFERENCES.sortBy,
      sortOrder: prefs?.sortOrder ?? DEFAULT_PREFERENCES.sortOrder
    }
  }

  getById(id: number): User | undefined {
    return this.usersById.get(id)
  }

  getByName(name: string): User | undefined {
    return this.usersByName.get(name)
  }

  list(): User[] {
    return [...this.usersById.values()]
  }
}
