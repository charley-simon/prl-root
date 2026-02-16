import fs from 'fs'
import path from 'path'
import { Movie, MovieDetailSchema } from '../../schemas/movies/movie-detail.schema'

export class UploadService {
  private uploadDir: string
  private moviesById: Record<number, Movie>

  constructor(uploadDir: string, moviesById: Record<number, Movie>) {
    this.uploadDir = uploadDir
    this.moviesById = moviesById
  }

  async uploadMovieFile(
    file: { name: string; buffer: Buffer },
    metadata: Partial<Movie>
  ): Promise<Movie> {
    // 1️⃣ Générer ID unique
    const newId = Math.max(...Object.keys(this.moviesById).map(k => Number(k))) + 1

    // 2️⃣ Copier le fichier
    const targetPath = path.join(this.uploadDir, `${newId}-${file.name}`)
    fs.writeFileSync(targetPath, file.buffer)

    // 3️⃣ Créer movie minimal
    const newMovie: Movie = {
      id: newId,
      title: metadata.title ?? file.name,
      releaseYear: metadata.releaseYear ?? new Date().getFullYear(),
      categories: metadata.categories ?? [],
      rating: metadata.rating ?? 0,
      isLocal: true
    }

    // 4️⃣ Ajouter au cache
    this.moviesById[newId] = newMovie

    return newMovie
  }
}
