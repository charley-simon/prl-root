import { describe, it, expect } from 'vitest'
import { UserCache } from '../../../src/services/user/userCache'

const cache = new UserCache('./packages/netflix-backend/data')

describe('UserCache', () => {
  it('charge les utilisateurs', () => {
    expect(cache.list().length).toBeGreaterThan(0)
  })

  it('trouve un user par name', () => {
    const user = cache.getByName('alice')
    expect(user).toBeDefined()
  })

  it('normalise les préférences', () => {
    const user = cache.getByName('diane')
    expect(user).toBeDefined()
    if (user) expect(user.preferences).toBeDefined()
    if (user && user.preferences) expect(user?.preferences.favoriteCategories).toEqual([])
  })
})
