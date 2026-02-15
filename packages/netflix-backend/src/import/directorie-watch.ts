import chokidar from "chokidar";

const watcher = chokidar.watch("./video-import", { ignoreInitial: false });

watcher.on("add", async (path) => {
  console.log(`Fichier détecté: ${path}`);
  const filename = path.split("/").pop()!;
  const { title, year } = parseFilename(filename);
  const movie = await searchTMDB(title, year);
  if (movie) {
    console.log(`Film trouvé: ${movie.title} (${movie.releaseYear}) TMDB ID: ${movie.tmdbId}`);
    // créer/update {tmdbId}-movie.json
  } else {
    console.warn(`Aucun film trouvé pour: ${title} (${year})`);
  }
});
