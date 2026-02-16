// config.ts

export const config = {
  tmdbToken: process.env.TMDB_TOKEN ?? '',
  assetsDir: process.env.ASSETS_DIR ?? './data/assets/movies',
  language: 'fr-FR'
}

if (!config.tmdbToken) {
  throw new Error('TMDB_TOKEN manquant dans le .env')
}
