import fs from 'fs'
import path from 'path'

// Chemin vers ton fichier movies.json
const moviesPath = '../../data/movies.json'

// Lire le JSON
const movies = JSON.parse(fs.readFileSync(moviesPath, 'utf-8'))

// Convertir releaseYear en number
const updatedMovies = movies.map(movie => ({
  ...movie,
  releaseYear: Number(movie.releaseYear)
}))

// Réécrire le fichier
fs.writeFileSync(moviesPath, JSON.stringify(updatedMovies, null, 2), 'utf-8')

console.log(
  `✅ Tous les releaseYear (${updatedMovies.length}) ont été convertis en nombre dans ${moviesPath}`
)

// Chemin vers ton fichier movies.json
const moviesDir = '../../data/movies'
let moviesCount = 0

fs.readdirSync(moviesDir).forEach(file => {
  if (file.endsWith('-detail.json')) {
    const filePath = path.join(moviesDir, file)
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'))

    // Conversion releaseYear en number
    const updated = {
      ...content,
      releaseYear: Number(content.releaseYear)
    }

    // Écriture dans le même fichier
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8')
    console.log(`✅ ${file} mis à jour`)
    moviesCount++
  }
})

console.log(`🎉 ${moviesCount} fichiers -detail.json ont été convertis.`)
