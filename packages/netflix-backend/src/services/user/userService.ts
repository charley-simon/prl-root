import { User, UserPreferences } from '../../schemas/users/user.schema'
import { DEFAULT_PREFERENCES } from './defaultPreferences'
import { UserCache } from './userCache'

export interface UserService {
  login(name: string, password: string): Promise<User>
  getUserById(id: number): Promise<User | undefined>
  getPreferences(userId: number): Promise<UserPreferences>
  isAdmin(userId: number): Promise<boolean>
}

export class UserServiceImpl implements UserService {
  constructor(private cache: UserCache) {}

  async login(name: string, password: string): Promise<User> {
    const user = this.cache.getByName(name)

    if (!user || user.password !== password) {
      throw new Error('Invalid credentials')
    }

    return user
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.cache.getById(id)
  }

  async getPreferences(userId: number): Promise<UserPreferences> {
    const user = this.cache.getById(userId)
    if (!user) throw new Error('User not found')

    return user.preferences ?? DEFAULT_PREFERENCES
  }

  async isAdmin(userId: number): Promise<boolean> {
    const user = this.cache.getById(userId)
    if (!user) return false
    return user.isAdmin
  }
}
