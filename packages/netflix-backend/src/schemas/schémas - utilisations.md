Définir les schémas avec TypeBox

Les exporter depuis types.ts

Les utiliser :

✅ dans Fastify (validation automatique)

✅ dans tes services métiers (validation manuelle si besoin)

🧱 1️⃣ Installation

Si pas déjà fait :

npm install @sinclair/typebox


Si tu veux validation manuelle en dehors de Fastify :

npm install ajv

📁 Structure recommandée
/src
  /schemas
    types.ts
  /routes
  /services


👉 Oui, types.ts ou mieux schemas/types.ts.

🎬 1️⃣ departments.json
Sample
[
  {"id":0,"name":"Unknow"},
  {"id":1,"name":"Acting"},
  {"id":2,"name":"Directing"},
  {"id":3,"name":"Writing"}
]

✅ TypeBox schema
// src/schemas/types.ts

import { Type, Static } from '@sinclair/typebox'

export const DepartmentSchema = Type.Object({
  id: Type.Integer({ minimum: 0 }),
  name: Type.String({ minLength: 1 })
})

export const DepartmentsSchema = Type.Array(DepartmentSchema)

export type Department = Static<typeof DepartmentSchema>
export type Departments = Static<typeof DepartmentsSchema>

🎭 2️⃣ jobs.json

Sample :

[
  { "id":1, "name":"Actor", "departmentId":1 }
]


⚠️ Tu avais une faute dans l’exemple : deparmentId → departmentId

✅ Schema
export const JobSchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
  name: Type.String({ minLength: 1 }),
  departmentId: Type.Integer({ minimum: 0 })
})

export const JobsSchema = Type.Array(JobSchema)

export type Job = Static<typeof JobSchema>
export type Jobs = Static<typeof JobsSchema>

🎬 3️⃣ categories.json

Sample :

[
  {"id":18,"name":"Drame"},
  {"id":80,"name":"Crime"}
]

✅ Schema
export const CategorySchema = Type.Object({
  id: Type.Integer({ minimum: 1 }),
  name: Type.String({ minLength: 1 })
})

export const CategoriesSchema = Type.Array(CategorySchema)

export type Category = Static<typeof CategorySchema>
export type Categories = Static<typeof CategoriesSchema>

🚀 2️⃣ Utilisation avec Fastify

Fastify comprend directement les schemas TypeBox.

Exemple :

import { DepartmentsSchema } from '../schemas/types'

fastify.get('/departments', {
  schema: {
    response: {
      200: DepartmentsSchema
    }
  }
}, async () => {
  return departmentsData
})


👉 Fastify valide automatiquement la réponse.

🧪 3️⃣ Validation manuelle dans service métier

Si tu charges un JSON depuis disque :

import Ajv from 'ajv'
import { DepartmentsSchema } from '../schemas/types'

const ajv = new Ajv()
const validateDepartments = ajv.compile(DepartmentsSchema)

export function loadDepartments(data: unknown) {
  const valid = validateDepartments(data)

  if (!valid) {
    throw new Error(JSON.stringify(validateDepartments.errors))
  }

  return data
}


👉 Utile pour valider tes fichiers JSON au démarrage.

🎯 4️⃣ Bonne pratique recommandée

Au démarrage du serveur :

Charger tous les fichiers JSON

Valider avec AJV

Échouer immédiatement si invalide

Ça sécurise ton backend.

🧠 5️⃣ Pourquoi TypeBox est bien ici

Tu obtiens :

✔ JSON Schema compatible Fastify

✔ Types TypeScript dérivés automatiquement

✔ Validation runtime

✔ Pas de duplication type / schema

Un seul point de vérité.

🧱 6️⃣ Option encore plus propre (organisation)

Tu peux aussi faire :

/schemas
  department.schema.ts
  job.schema.ts
  category.schema.ts

🚀 Bonus propreté maximale (optionnel)

Tu peux même faire :

// schemas/index.ts
export * as DepartmentSchemas from './department.schema'
export * as JobSchemas from './job.schema'
export * as CategorySchemas from './category.schema'


Et importer comme :

import { DepartmentSchemas } from '../schemas'

Si ça grossit.

📌 Résumé
Élément	Où ?
Schémas	/src/schemas/types.ts
Validation route	schema.response ou schema.body
Validation fichiers JSON	AJV manuel
Types TS	Static<typeof Schema>

🧪 Validation au démarrage

Dans ton bootstrap :

import Ajv from 'ajv'
import { PeopleIndexSchema } from './schemas'

const ajv = new Ajv()
const validate = ajv.compile(PeopleIndexSchema)

if (!validate(peopleIndexData)) {
  throw new Error(JSON.stringify(validate.errors))
}


👉 Si ton index est corrompu → crash immédiat
C’est propre.

npm install ajv
npm install ajv-formats