import { UserPreferences } from '../../schemas/users/user.schema'

export const DEFAULT_PREFERENCES: UserPreferences = {
  favoriteCategories: [],
  sortBy: 'rating',
  sortOrder: 'desc'
}
