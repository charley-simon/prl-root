import { describe, it, expect } from 'vitest'
import { MovieServiceImpl } from '../../src/services/movie/movieService'
import { UserServiceImpl } from '../../src/services/user/userService'
import { UserCache } from '../../src/services/user/userCache'
import type { UserPreferences } from '../../src/schemas/users/user.schema'

describe('UC5 - Liste personnalisée', () => {
  const movieService = new MovieServiceImpl()

  // Initialise le cache à partir du dossier data
  const userCache = new UserCache('./data')

  // Passe le cache au service
  const userService = new UserServiceImpl(userCache)

  it('filtre et trie correctement selon préférences', async () => {
    // 1️⃣ Récupérer utilisateur et préférences
    const user = await userCache.getByName('alice')
    expect(user).toBeDefined()

    const prefs: UserPreferences = await userService.getPreferences(user!.id)
    expect(prefs).toBeDefined()
    expect(Array.isArray(prefs.favoriteCategories)).toBe(true)

    // 2️⃣ Récupérer liste personnalisée
    const movies = await movieService.listPersonalizedMovies(prefs, { offset: 0, limit: 20 })
    expect(movies).toBeDefined()
    expect(Array.isArray(movies)).toBe(true)

    console.log(`[UC5 Test] ${movies.length} films retournés pour user ${user!.name}`)

    // 3️⃣ Vérifier que tous les films respectent les préférences
    movies.forEach(movie => {
      // Catégories favorites
      if (prefs.favoriteCategories.length > 0) {
        const intersection = movie.categories.filter(cat => prefs.favoriteCategories.includes(cat))
        expect(intersection.length).toBeGreaterThan(0)
      }
      // Année minimale
      if (prefs.minYear !== undefined && prefs.minYear !== null) {
        expect(movie.releaseYear).toBeGreaterThanOrEqual(prefs.minYear)
      }
    })

    // 4️⃣ Vérifier tri
    const { sortBy = 'rating', sortOrder = 'desc' } = prefs
    for (let i = 1; i < movies.length; i++) {
      const prev = movies[i - 1]
      const curr = movies[i]
      if (sortBy === 'rating') {
        expect(
          sortOrder === 'asc' ? prev.rating! <= curr.rating! : prev.rating! >= curr.rating!
        ).toBe(true)
      }
      if (sortBy === 'year') {
        expect(
          sortOrder === 'asc'
            ? prev.releaseYear <= curr.releaseYear
            : prev.releaseYear >= curr.releaseYear
        ).toBe(true)
      }
      if (sortBy === 'title') {
        const cmp = prev.title.localeCompare(curr.title)
        expect(sortOrder === 'asc' ? cmp <= 0 : cmp >= 0).toBe(true)
      }
    }

    // 5️⃣ Lazy load
    const batchMovies = await movieService.listPersonalizedMovies(prefs, { offset: 5, limit: 5 })
    expect(batchMovies.length).toBeLessThanOrEqual(5)
  })
})
