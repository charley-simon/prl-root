import { describe, it, expect, beforeAll } from 'vitest'
import { UserService, User } from '../../src/services/user/userService'

describe('UC1 – Login simple', () => {
  let userService: UserService

  beforeAll(() => {
    userService = new UserService()
  })

  it('doit connecter un utilisateur existant avec mot de passe correct', () => {
    const user: User = userService.login('alice', 'pass123')
    expect(user).toHaveProperty('id', 1)
    expect(user.isAdmin).toBe(true)
  })

  it('doit refuser un utilisateur inconnu', () => {
    expect(() => userService.login('unknown', 'pass123')).toThrow(/Utilisateur inconnu/)
  })

  it('doit refuser un mot de passe incorrect', () => {
    expect(() => userService.login('alice', 'wrongpass')).toThrow(/Mot de passe incorrect/)
  })

  it('doit distinguer admin et utilisateur normal', () => {
    const admin = userService.login('alice', 'pass123')
    const user = userService.login('bob', 'bobpass')
    expect(userService.isAdmin(admin)).toBe(true)
    expect(userService.isAdmin(user)).toBe(false)
  })
})
