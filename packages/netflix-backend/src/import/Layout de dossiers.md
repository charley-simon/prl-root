ID TMDB comme clef principale

externalIds pour enrichissement externe (IMDb, Wikidata, réseaux, etc.)
lazy loading pour les données narratives
structure extensible pour images, casting, jobs, etc.

📁 Layout de dossier recommandé
/data
/movies
238-movie.json
550-movie.json
...
/people
1158-people.json
3084-people.json
...
/references
categories.json
departments.json
jobs.json
/assets
/movies
238-posterSm.avif
238-backgroundLg.avif
...
/people
1158-people.avif
/video-import # répertoire surveillé par le worker
238.mp4
550.mp4
movie-list.json # index léger MovieShort
people-list.json # index léger PeopleShort

🎬 MovieDetail (fichier individuel {id}-movie.json)
{
"id": 238, // TMDB ID
"title": "Le Parrain",
"originalTitle": "The Godfather",
"releaseYear": 1972,
"genres": [18, 80],
"tagline": "Une offre que vous ne pouvez pas refuser.",
"trailerSource": "",
"isLocal": false,
"movieSource": "", // ex: TMDB URL
"overview": "", // synopsis vide au départ → worker remplit
"popularity": 137.881,
"rating": 8.707,

"externalIds": { // pour enrichissement lazy
"imdb": "tt0068646",
"wikidata": "Q14794",
"facebook": null,
"instagram": null,
"twitter": null
},

"actors": [ // jointure MoviePeople
{
"id": 1158, // TMDB person ID
"name": "Al Pacino",
"gender": 2,
"character": "Michael Corleone",
"order": 1
}
],

"directors": [
{
"id": 1776,
"name": "Francis Ford Coppola",
"gender": 2,
"department": "Directing",
"job": "Director"
}
],

"writers": [
{
"id": 1776,
"name": "Francis Ford Coppola",
"gender": 2,
"department": "Writing",
"job": "Screenplay"
},
{
"id": 3083,
"name": "Mario Puzo",
"gender": 2,
"department": "Writing",
"job": "Novel"
}
]
}

👤 PeopleDetail (fichier individuel {id}-people.json)
{
"id": 1158, // TMDB ID
"name": "Al Pacino",
"gender": 2,
"birthday": "1940-04-25",
"placeOfBirth": "New York, USA",
"biography": "", // vide → worker remplit
"knownForDepartment": "Acting",
"popularity": 38.4,
"profileImage": "./dest/1158-people.avif",

"externalIds": {
"imdb": "nm0000199",
"wikidata": "Q1363",
"facebook": null,
"instagram": null,
"twitter": null
},

"filmography": [ // dynamiquement reconstruit depuis movie-people.json
{
"movieId": 238,
"jobId": 1, // Actor
"character": "Michael Corleone",
"order": 1
}
]
}

🔹 Notes importantes
externalIds : clé pour ton worker de fond. Permet de récupérer biographie ou synopsis longue de Wikidata / Wikipedia / autres APIs.
Lazy loading : overview (movies) et biography (people) peuvent rester vides au départ.
Assets : stockés localement (poster/background/profile) et référencés par chemin. Tu peux normaliser en /assets/movies et /assets/people.
Index légers : movie-list.json et people-list.json contiennent uniquement :

[
{ "id": 238, "title": "Le Parrain", "genres": [18, 80], "releaseYear": "1972" },
...
]

Relations dynamiques : acteurs, réalisateurs, écrivains sont reconstruites depuis movie-people.json et people.json pour éviter duplication.
Extensible : tu peux ajouter facilement productionCompanies, languages, countries, etc. dans MovieDetail sans toucher à l’architecture.

🔹 Workflow conseillé pour ton backend + PRL
Import TMDB → normalisation : génère {id}-movie.json, {id}-people.json + list.json + references.json
Worker de fond : récupère les champs narratifs via externalIds (Wikipedia / Wikidata / autres)
MovieResolver : construit dynamiquement MovieDetail pour l’API ou le jeu d’essai
PeopleResolver : construit dynamiquement PeopleDetail avec filmographie et bio
Lazy load : charge les fichiers un par un à la demande
Cache optionnel : précharge films populaires ou people fréquents

✅ Résultat :
Dataset complet, extensible et indépendant de TMDB
Possibilité de lazy loading et expérimentation PRL
Base solide pour tests, preload, cache, enrichissement
Structure cohérente pour MovieDetail / PeopleDetail / Index / References

TMDB:

- Movies liste:
  - Popular
  - Top Rated
- Movie
  - Detail: Les infos de bases
  - Credits: Le casting
  - Keywords: Les mots clés qui définnissent le film Gangster, Italie, adapté d'un livre, etc...
  - Recommendations: Quoi regarder après ce film
  - Reviews: Les critiques du film
  - Similar: Les films similaires
  - Videos: Les sources vidéos (youtube)
  - Providers: Chez qui on peut voir le film (Apple Tv, Prime, Netflix, etc...)
  - Images

- People:
  - Details: les infos de base
  - Movie Credits / Combined Credits: filmographie
  - Images
