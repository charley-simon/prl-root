// src/utils/id.utils.ts
import { v5 as uuidv5, UUIDTypes } from 'uuid'
import { UUID } from '../../schemas/entity.schema'

// Namespace fixe pour ton app — génère le tien avec uuidv4() une seule fois
// const APP_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
const APP_NAMESPACE = process.env.APP_NAMESPACE
if (!APP_NAMESPACE) throw new Error('APP_NAMESPACE is not defined in .env')

// Même input → toujours même UUID (déterministe)
export function generateInternalId(providerName: string, externalId: string | number): UUID {
  return uuidv5(`${providerName}:${externalId}`, APP_NAMESPACE as UUIDTypes)
}
