import 'dotenv/config' // charge automatiquement .env à la racine
import { ENV } from '../../src/config/env'
import { describe, it, expect, beforeAll } from 'vitest'
import { User } from '../../src/schemas/users/user.schema'
import { UserServiceImpl } from '../../src/services/user/userService'
import { UserCache } from '../../src/services/user/userCache'

describe('UC1 – Login simple', () => {
  const userCache = new UserCache('./data')
  const userService = new UserServiceImpl(userCache)

  beforeAll(async () => {
    
  })

  it('doit connecter un utilisateur existant avec mot de passe correct', async () => {
    const user: User = await userService.login('alice', 'pass123')

    expect(user).toHaveProperty('id', 2)
    expect(user.isAdmin).toBe(false)
  })

  it('doit refuser un utilisateur inconnu', async () => {
    await expect(userService.login('unknown', 'pass123')).rejects.toThrow('Invalid credentials')
  })

  it('doit refuser un mot de passe incorrect', async () => {
    await expect(userService.login('alice', 'wrongpass')).rejects.toThrow('Invalid credentials')
  })

  it('doit distinguer admin et utilisateur normal', async () => {
    const admin = await userService.login('admin', 'admin')
    const user = await userService.login('bob', 'bobpass')

    expect(await userService.isAdmin(admin.id)).toBe(true)
    expect(await userService.isAdmin(user.id)).toBe(false)
  })
})
