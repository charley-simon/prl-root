🧭 Vue globale du système vivant

🧱 1. Points d’entrée du système
🎬 Frontend (utilisateur)
Actions → Events - ouverture d’un film → MovieRequested - clic filmographie → RelatedMovieRequested - recherche → SearchRequested - lecture vidéo → PlaybackStarted0
👉 déclenche lazy loading + enrichissement.

💾 Système de fichiers (watcher) - nouveau fichier vidéo détecté → VideoFileDetected - suppression → VideoRemoved
👉 crée Movie minimal.

⏱ Jobs planifiés - nouveautés TMDB → DiscoverMoviesFetched - top 50 → TrendingMoviesFetched - mise à jour providers → ProviderRefreshRequested

🖥 CLI / scripts - import dataset → BulkImportRequested - enrich batch → BulkEnrichRequested - nettoyage → HousekeepingRequested

🔌 Services tiers - webhook Plex/Jellyfin → PlaybackStarted - webhook recommendation → RecommendationTriggered

🧭 2. Event Bus (le cœur)
Tous les événements arrivent ici :

EventBus.publish(event)

Le bus distribue vers : - EnrichmentEngine - Watchers - StatsTracker - Housekeeper - CacheManager
👉 découplage total.

⚙️ 3. Création / récupération d’un Movie
Exemple : nouveau fichier détecté
Event:
VideoFileDetected

Handler:
create Movie {
id,
title,
year,
filePath,
status: "initial"
}

Emit:
MovieCreated

⚡ 4. Lazy loading à la demande
Exemple : utilisateur ouvre un film
Event:
MovieRequested(id)

Flow:
MovieRepository.get(id)

    if status < requiredLevel:
      emit EnrichmentRequested(level)

👉 l’utilisateur n’attend pas tout.

🧩 5. Enrichment Engine
Event:
EnrichmentRequested(movieId, level)

Le moteur - lit le statut actuel - sélectionne les enrichers nécessaires - les exécute dans l’ordre - met à jour le statut - émet événements

Exemple pipeline:
initial → basic → medium → deep

Enrichers possibles
BASIC - TMDB details - poster original

MEDIUM - credits - genres - rating

DEEP - images - keywords - external ids // a mettre en premier car nécéssaire à l'enrichissement - Wikipedia summary

🧩 6. Providers & DataProviders
Provider logique:
TmdbMovieProvider
ImdbProvider
WikipediaProvider

DataProviders interchangeables:
HttpDataProvider
JsonReplayProvider
HybridProvider

👉 offline & labo ready.

💾 7. Persistance & normalisation

Après enrichissement :

Transformation:
TmdbMovie + Credits → Movie normalisé

Stockage

- movies.json
- people.json
- relations.json
- images/

📊 8. Stats & Usage Tracking
Events capturés

- MovieViewed
- PlaybackStarted
- SearchHit
- RecommendationShown

Stockage :
viewCount
lastAccess
popularityScore

👉 sert au housekeeping.

🧹 9. Housekeeping & downgrade
Event planifié:
HousekeepingRequested

Règles possibles:
si lastAccess > 180 jours
downgrade deep → basic

    si disque plein
      supprimer images HD

    si popularity faible
      garder résumé seulement

Emit:
MovieDowngraded

🔄 10. Régénération à la demande

Si un film downgradé est consulté :

    MovieRequested
      ↓
    status insuffisant
      ↓
    EnrichmentRequested
      ↓
    ré-enrichissement

👉 données régénérées automatiquement.

🔁 Cycle de vie complet d’un film
Découverte (file / TMDB / recherche)
↓
Initial
↓
Lazy enrich → Basic
↓
Usage réel
↓
Medium / Deep enrich si nécessaire
↓
Stats & observation
↓
Downgrade si inactif
↓
Réactivation si consulté

🧠 Exemple concret de circulation
🎬 Cas réel utilisateur

1️⃣ clic filmographie acteur
→ RelatedMovieRequested

2️⃣ film inconnu localement
→ TMDB fetch minimal
→ MovieCreated(initial)

3️⃣ ouverture film
→ lazy enrich basic

4️⃣ utilisateur ouvre casting
→ enrich medium

5️⃣ jamais rouvert 6 mois
→ housekeeping downgrade

6️⃣ utilisateur revient
→ enrich automatique

👉 stockage minimal + illusion d’infini.

⚙️ Les composants principaux
Core

- EventBus
- EnrichementEngine
- Housekeeper
- StatsTracker
  Domain
- MovieRepository
- PeopleRepository
  Providers
- TmdbProvider
- ImDbProvider
- WikipediaProvider
  Infrastructure
- HttpDataProvider
- JsonReplayProvider
- FileWatcher

🎯 Ce que ce diagramme montre

✔ données vivantes
✔ enrichissement progressif
✔ lazy loading
✔ auto-optimisation
✔ pipeline événementiel
✔ cache intelligent
✔ offline & replay ready

🧠 Ce que tu construis réellement

Pas un backend.
Mais :
✅ un moteur de connaissance progressif
✅ un cache intelligent auto-optimisé
✅ un système observable et scientifique
✅ un laboratoire d’architecture vivante
