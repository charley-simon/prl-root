import { UserPreferences } from '../schemas/users/user.schema'

export function normalizePreferences(prefs?: Partial<UserPreferences>): UserPreferences {
  return {
    favoriteCategories: prefs?.favoriteCategories ?? [],
    minYear: prefs?.minYear,
    sortBy: prefs?.sortBy ?? 'rating',
    sortOrder: prefs?.sortOrder ?? 'desc'
  }
}
