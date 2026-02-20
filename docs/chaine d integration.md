Exemple sur un Netflix like (oui encore un!) qui récupère ses données sur internet via des providers comme Tmdb, Imdb, Wikipedia

# Description de la chaine d'intégration de données externes:

engine → loader → translator/integrator → provider -> entity

1️⃣ Engine
Responsabilité : orchestration globale

- Ne connaît pas les providers ni les détails de récupération.
- Demande au loader de fournir un objet métier complet (Movie, Person, Company) selon le niveau d’enrichissement souhaité (basic, medium, deep).
- Peut déclencher des workflows comme “ajout de fichier vidéo” ou “clic sur film inconnu”, qui se traduisent en events.
- Suit les stats d’usage, déclenche éventuellement le downgrade ou upgrade des statuts via le loader.

Exemple d’appel :
const movie = await engine.getMovieById(internalId, 'medium')

// Entities métiers
export type EntityKind = 'Movie' | 'Person' | 'Company'
export type EnrichLevel = 'basic' | 'medium' | 'deep'

export interface IEntity {
id: UUID // ID interne
kind: EntityKind
externalIds: Record<string, string> // clé = provider.name, valeur = ID externe
status?: EnrichLevel // status d'enrichissement actuel
}

export interface Movie extends IEntity {
title: string
year?: number
posterPath?: string
backdropPath?: string
.../...
}

export interface Person extends IEntity {
name: string
profilePath?: string
knownFor?: Movie[]
.../...
}

export interface Company extends IEntity {
name: string
logoPath?: string
.../...
}

2️⃣ EntityLoader (ou Loader)
Responsabilité : accès et cohérence des données

- Vérifie si l’objet existe localement et si le niveau demandé est déjà présent.
- Passe l’objet dans AJV / TypeBox pour valider la conformité au schéma.
- Si des champs obligatoires manquent → demande au transformer/integrator de compléter (lazy loading).
- Gère le cache local, les statuts d’enrichissement, et éventuellement la génération de fichiers pour replay/offline.

Fonctions typiques :

interface IEntityLoader<TEntity> {
resolveMovieBy( {title: string, year?: number, ... }): UUID
resolvePersonBy( {title: string, year?: number, ... }): UUID
getById(kind: EntityKind, id: UUID, level?: EnrichLevel): Promise<TEntity> // ?
getMovieById(id: UUID, level?: EnrichLevel): Promise<Movie>
getPersonById(id: UUID, level?: EnrichLevel): Promise<Person>
getCompanyById(id: UUID, level?: EnrichLevel): Promise<Company>
enrich(item: TEntity, level: EnrichLevel): Promise<TEntity>
}

Exemple de fonctionnement :
let movie = await loader.getById(uuid, 'medium')
// loader valide le Movie
// si poster_path ou credits manquent -> enrich automatiquement via transformer
ou
const movieId = await loader.resoleMovieBy( {title: 'Titanic'})
const movie = loader.getMovieById( movieId )
loader.enrich( movie, ')

3️⃣ Translator / Integrator (ou Transformer) il faut choisir un nom clair
Responsabilité : traduction et enrichissement

- Connaît le format interne métier (Movie, Person, Company) et le format du provider (ex: TmdbMovieDetails, TmdbMovieCredits, TmdbMovieExternalIds).
- Transforme les données brutes en objets métiers.
- Peut combiner plusieurs sources pour enrichir un même objet (ex: détails TMDB + credits TMDB + Wikipedia).
- Ne fait aucune récupération directe HTTP / file, il reçoit les données brutes des providers.

Exemple :

// src/providers/constants.ts
export const PROVIDERS = {
TMDB: 'tmdb',
IMDB: 'imdb',
WIKIPEDIA: 'wikipedia',
} as const
export type ProviderName = (typeof PROVIDERS)[keyof typeof PROVIDERS]

// Tranformer
class TmdbMovieTransformer {
export function getProviderId(entity: IEntity, providerName: string): string | undefined { // Helper qui retourne id interne (utiliser par les providers pour le découplage métier)
return entity.externalIds[providerName]
}
integrate( movieId: UUID ): Movie {
const movie: Movie = new Movie();
const tmdbId = getProviderId( movie, TMDB )
const tmdbProvider = new TmdbProviderTmdb(tmdbId)
const tmdbDetails = tmdbProvider.getDetails()
movie.tile = tmdbDetails.title;
movie.releaseYear: parseInt(tmdbDetails.release_date.split('-')[0]),
movie.posterPath: tmdbDetails.posters?.[0]?.file_path,
movie.externalsIds: tmdbDetails.externalIds
.../...
return newMovie
}
}

4️⃣ Provider (HTTP / File / Replay)

// src/providers/constants.ts
Responsabilité : récupération brute des données

- Fournit uniquement des objets bruts dans leur format natif :
  - TMDB : TmdbMovieBundle, TmdbMovieDetails, TmdbMovieCredits, TmdbExternalIds, TPeopleDetails, TPeopleExternalIds, etc...
  - IMDb, Wikipedia, autre provider…
- Deux types de provider possibles :
  - HTTPProvider → récupère les données depuis l’API externe.
  - FileProvider / ReplayProvider → lit les fichiers JSON ou images pour tests/offline.
- Ne connaît ni les objets métiers, ni les niveaux d’enrichissement, ni les règles métier.

5️⃣ Flux global résumé
Engine
│
▼
EntityLoader
├─ vérifie cache/local storage
├─ valide avec TypeBox / AJV
├─ Gère les downGrade et upGrade
└─ déclenche enrich si nécessaire
│
▼
Translator/Integrator
├─ transforme les données brutes des providers
├─ normalise en objet métier
└─ applique la logique d’enrichissement (basic → medium → deep)
│
▼
Provider(s)
├─ TMDB HTTP / JSON
├─ IMDb, Wikipedia HTTP / JSON
└─ FileProvider pour replay / tests offline

🔹 Points clés

- Engine : orchestration + events + stats
- Loader : accès, validation, lazy-loading, gestion du cache et des niveaux d’enrichissement
- Translator/Integrator : transforme le format brut provider → objet métier, enrichissement purement logique
- Provider : lecture brute (HTTP / file / replay), aucune logique métier
