1️⃣ Étape 1 : Parser le nom du fichier
Le nom Dark.Phoenix.2019.MULTi.TRUEFRENCH.1080p.HDLight.x264.AC3-EXTREME.mkv contient plusieurs informations :
Titre : Dark Phoenix
Année : 2019
Restant : release group, langue, résolution → à ignorer pour l’ID
On peut écrire une fonction simple pour extraire titre + année :

function parseFilename(filename: string) {
// retirer l'extension
const name = filename.replace(/\.[^.]+$/, "");
// split sur les points
const parts = name.split(".");

// trouver l'année (4 chiffres)
const yearPart = parts.find(p => /^\d{4}$/.test(p));
const year = yearPart ? parseInt(yearPart) : null;

// titre = tous les morceaux avant l'année
const yearIndex = yearPart ? parts.indexOf(yearPart) : parts.length;
const titleParts = parts.slice(0, yearIndex);

// transformer en titre normal
const title = titleParts.map(w => w.replace(/\_/g, " ")).join(" ");

return { title, year };
}

// test
console.log(parseFilename("Dark.Phoenix.2019.MULTi.TRUEFRENCH.1080p.HDLight.x264.AC3-EXTREME.mkv"));
// { title: "Dark Phoenix", year: 2019 }

2️⃣ Étape 2 : Rechercher le film sur TMDB
TMDB propose l’API search/movie :
import fetch from "node-fetch";

async function searchTMDB(title: string, year?: number) {
const apiKey = process.env.TMDB_API_KEY;
const url = new URL("https://api.themoviedb.org/3/search/movie");
url.searchParams.set("api_key", apiKey);
url.searchParams.set("query", title);
if (year) url.searchParams.set("year", year.toString());

const res = await fetch(url.toString());
const data = await res.json();

// retourne le meilleur match
if (data.results && data.results.length > 0) {
const movie = data.results[0];
return {
tmdbId: movie.id,
title: movie.title,
releaseYear: Number(movie.release_date?.slice(0,4)),
overview: movie.overview
};
}

return null;
}

// test
(async () => {
const { title, year } = parseFilename("Dark.Phoenix.2019.MULTi.TRUEFRENCH.1080p.HDLight.x264.AC3-EXTREME.mkv");
const movie = await searchTMDB(title, year);
console.log(movie);
})();

Remarque : tu peux améliorer le match en comparant title et releaseYear pour éviter les faux positifs.

3️⃣ Étape 3 : Écriture du JSON MovieDetail
Une fois l’ID TMDB récupéré, ton worker peut :
Vérifier si {tmdbId}-movie.json existe déjà
Si non → créer un nouveau MovieDetail minimal (title, releaseYear, TMDB ID)
Ajouter le chemin local de la vidéo :

{
"id": 4001,
"title": "Dark Phoenix",
"releaseYear": "2019",
"tmdbId": 4001,
"video": {
"localPath": "./video-import/Dark.Phoenix.2019.MULTi.TRUEFRENCH.1080p.HDLight.x264.AC3-EXTREME.mkv"
}
}

Ensuite, le worker peut lancer lazy enrich via TMDB / Wikidata / Wikipedia.

4️⃣ Étape 4 : Surveillance du répertoire
Node.js propose chokidar pour surveiller /video-import :
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

5️⃣ Étape 5 : Gestion des cas complexes
Titres ambigus → comparer original_title TMDB
Doublons → demander intervention ou log pour review
Titres avec accents / ponctuation → normaliser (lowercase + remove accents)
Année manquante → tenter recherche sur TMDB sans filtre

💡 Résumé pipeline vidéo-import :
Détection nouveau fichier
Extraction title et year
Recherche TMDB → récupérer tmdbId
Création / mise à jour {tmdbId}-movie.json
Ajout video.localPath et métadonnées (durée, résolution si possible)
Lancer enrichissement narratif lazy (Wikidata/Wikipedia)
