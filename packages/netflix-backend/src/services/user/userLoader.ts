import { ENV } from '../../config/env'
import fs from 'fs'
import path from 'path'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import { UserSchema, User } from '../../schemas/users/user.schema'

const UserValidator = TypeCompiler.Compile(UserSchema)

export function loadUsers(dataPath: string): User[] {
  console.log(`userLoader.loadUser(${dataPath}): ENV.dataDir: ${ENV.dataDir}`)
  const filePath = path.join(dataPath, 'users.json')
  const raw = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(raw)

  const users: User[] = []

  for (const item of json) {
    if (!UserValidator.Check(item)) {
      console.error(UserValidator.Errors(item))
      throw new Error('Invalid user data')
    }
    users.push(item)
  }

  return users
}
