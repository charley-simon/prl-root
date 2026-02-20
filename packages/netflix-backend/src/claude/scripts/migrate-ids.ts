// scripts/migrate-ids.ts
import 'dotenv/config' // charge automatiquement .env à la racine. Doit être la première ligne !
import { ENV } from '../config/env'
import * as fs from 'fs'
import path from 'path'
import { generateInternalId } from '../utils/id.utils'

function migrateDir(dirPath: string, kind: string, template: string) {
  console.log(`Migrating directory ${dirPath}, ${kind}, ${template}`)
  let Count = 0

  fs.readdirSync(dirPath).forEach(file => {
    if (file.endsWith(template)) {
      const filePath = path.join(dirPath, file)
      const newId = migrateFile(filePath, kind)
      const newFilePath = path.join(dirPath, `${newId}${template}`)
      fs.renameSync(filePath, newFilePath)
      console.log(`✅ ${filePath} mis à jour en ${newFilePath}`)
      Count++
    }
  })

  console.log(`  Done, 🎉 ${Count} fichiers ${template} ont été convertis.`)
}

function migrateAssets(dirPath: string) {
  console.log(`Migrating assets directory ${dirPath}`)
  let count = 0

  fs.readdirSync(dirPath).forEach(file => {
    const filePath = path.join(dirPath, file)
    // Option 1 — parseInt (le plus simple, ignore le reste naturellement)
    // const id = parseInt(filename) // → 240
    // Option 2 — split
    // const id = Number(filename.split('-')[0]) // → 240
    // Option 3 — regex (le plus explicite)
    const match = file.match(/^(\d+)-/)
    const id = match ? Number(match[1]) : null
    if (id) {
      const newId = generateInternalId('MovieImage', id)
      const newFile = file.replace(/^\d+/, newId)
      const newFilePath = path.join(dirPath, newFile)
      fs.renameSync(filePath, newFilePath)
      console.log(`✅ ${filePath} mis à jour en ${newFilePath}`)
      count++
    }
  })

  console.log(`  Done, 🎉 ${count} fichiers ont été convertis.`)
}

function migrateFileArray(filePath: string, kind: string): string {
  console.log(`Migrating ${filePath}, ${kind}`)
  const elements = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  if (!elements) return ''
  const migrated = elements.map((e: any) => ({
    ...e,
    id: generateInternalId(kind, e.id) // ancien id number → UUID stable
  }))

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2))
  console.log('   Done')
  return migrated.id
}

function migrateFile(filePath: string, kind: string): string {
  console.log(`Migrating ${filePath}, ${kind}`)
  const element = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  if (!element) return ''
  element.id = generateInternalId(kind, element.id)
  fs.writeFileSync(filePath, JSON.stringify(element, null, 2))
  console.log('   Done')
  return element.id
}

function migrateMoviesPeople(filePath: string, kind: string) {
  console.log('Migrating movies-people.json')
  const elements = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  const migrated = elements.map((e: any) => ({
    ...e,
    id: generateInternalId(kind, e.id),
    movieId: generateInternalId('Movie', e.id),
    personId: generateInternalId('Person', e.id),
    jobId: generateInternalId('Job', e.id)
  }))

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2))
  console.log('   Done')
}

function migrateJobs(filePath: string, kind: string) {
  console.log('Migrating /references/jobs.json')
  const elements = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

  const migrated = elements.map((e: any) => ({
    ...e,
    id: generateInternalId(kind, e.id),
    departmentId: generateInternalId('Department', e.id)
  }))

  fs.writeFileSync(filePath, JSON.stringify(migrated, null, 2))
  console.log('   Done')
}

function main() {
  // /data
  migrateFileArray(ENV.dataDir + '/movies.json', 'Movie')
  migrateFileArray(ENV.dataDir + '/movies-liste.json', 'Movie')
  migrateFileArray(ENV.dataDir + '/people.json', 'Person')
  migrateFileArray(ENV.dataDir + '/people-liste.json', 'Person')
  migrateFileArray(ENV.dataDir + '/users.json', 'User')
  migrateFileArray(ENV.dataDir + '/companies.json', 'Company')
  migrateMoviesPeople(ENV.dataDir + '/movies-people.json', 'Movie-Person')

  // /data/references
  migrateFileArray(ENV.dataDir + '/references/categories.json', 'Category')
  migrateFileArray(ENV.dataDir + '/references/departments.json', 'Department')
  migrateFileArray(ENV.dataDir + '/references/jobs.json', 'Job')
  migrateJobs(ENV.dataDir + '/references/jobs.json', 'Job')

  // /data/movies/*.json
  migrateDir(ENV.dataDir + '/movies', 'Movie', '-detail.json')
  // /data/people/*.json
  migrateDir(ENV.dataDir + '/people', 'Person', '-profil.json')

  // /data/assets/movies/*.json
  // Renommer les fichier ${id}-*.* en ${uuid}-*.*
  migrateAssets(ENV.dataDir + '/assets/movies')
  // /data/assets/people/*.json
  // Renommer les fichier ${id}-*.* en ${uuid}-*.*
  migrateAssets(ENV.dataDir + '/assets/people')
}

main()
