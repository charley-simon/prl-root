| Use Case                                | Entrée            | Sortie attendue                                   | Métrique fonctionnelle                        | Lazy loading / Notes                                                                                                                    |
| --------------------------------------- | ----------------- | ------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **UC1 – Login simple**                  | UserId + password | SessionId valide, contexte utilisateur attaché    | Temps de login (ms), réussite / échec         | Pas concerné                                                                                                                            |
| **UC2 – Voir liste films**              | SessionId / page  | Liste de films avec ID, titre, image              | Latence de réponse, nombre de films récupérés | Charger initialement un batch limité (page 1), puis charger page suivante à la demande. Mesurer latence batch initiale et batch suivant |
| **UC3 – Voir détail d’un film**         | Film ID           | Métadonnées film + enrichissement TMDB            | Temps de réponse, complétude des métadonnées  | Charger les données principales immédiatement, enrichissement lazy via TMDB/Wikipedia en différé                                        |
| **UC4 – Voir films similaires**         | Film ID           | Liste de films similaires (TMDB)                  | Latence, nombre de films                      | Lazy load : récupérer un nombre limité initialement, puis compléter la liste sur interaction utilisateur (scroll ou clic)               |
| **UC5 – Voir contenu personnalisé**     | SessionId         | Liste de films filtrée ou triée selon utilisateur | Latence, cohérence avec l’utilisateur         | Lazy load : afficher un sous-ensemble initial, compléter sur demande                                                                    |
| **UC6 – Ajouter fichier (drag & drop)** | Fichier vidéo     | Fichier enregistré, job créé                      | Temps de réception + création job, succès     | Pas concerné                                                                                                                            |
| **UC7 – Identifier film via TMDB**      | Fichier           | Film ID, correspondances TMDB                     | Latence identification, précision             | Pas concerné                                                                                                                            |
| **UC8 – Enrichir méta via TMDB**        | Film ID           | Métadonnées enrichies                             | Latence totale du job, complétude des données | Lazy loading interne possible pour enrichissement progressif (optionnel)                                                                |
| **UC9 – Enrichir méta via Wikipedia**   | Film ID           | Métadonnées enrichies                             | Latence totale, complétude                    | Lazy loading interne possible pour enrichissement progressif (optionnel)                                                                |
| **UC10 – Maintenance / nettoyage flux** | Contexte backend  | Job purge, logs ou métriques                      | Temps d’exécution, succès                     | Pas concerné                                                                                                                            |


🔹 Métriques globales système
- Latence utilisateur (clic → affichage complet initial)
- Temps de chargement batch suivant (lazy load)
- Temps de traitement job complet (ajout fichier → enrichissement métadonnées)
- Consommation mémoire totale (backend + worker)
- Charge CPU moyenne et max
- Nombre d’erreurs / requêtes échouées
- Débit flux (nombre de requêtes / jobs traités par unité de temps)

Les métriques restent au niveau fonctionnel, indépendantes de l’implémentation interne.

          ┌─────────────┐
          │   Frontend  │
          │ (UC1-UC5)   │
          │ Login / UI  │
          └─────┬───────┘
                │ Flux utilisateur (clic, scroll, lazy load)
                ▼
          ┌─────────────┐
          │  Backend    │
          │ (UC6-UC10) │
          │ REST API,   │
          │ Worker,     │
          │ Metrics     │
          └─────┬───────┘
                │ Flux enrichi / réponse
                ▼
          ┌─────────────┐
          │ Frontend    │
          │ UI update   │
          │ Lazy loading│
          └─────────────┘

🔹 Explications
1 - Flux utilisateur :
    - Généré par clics, scrolls ou requêtes frontend (UC1-UC5).
    - Contient context / session ID.
2 - Backend :
  - Reçoit le flux utilisateur et gère :
    - Jobs (UC6-UC10)
    - Enrichissement TMDB / Wikipedia
    - Maintenance / monitoring
  - Produit un flux de retour vers le frontend.
3 - Flux retour :
  - Les données envoyées au frontend déclenchent :
    - Mise à jour de l’UI
    - Lazy loading progressif des détails / films similaires / contenu personnalisé
4 - Lazy loading :
  - Indiqué côté frontend : batch initial + chargement progressif selon interaction utilisateur
  - Backend supporte ce comportement en servant les requêtes partielles

💡 Remarques :
- Ce schéma montre la boucle fonctionnelle frontend → backend → frontend.
- Les workers / enrichissements sont intégrés dans le backend, mais ils peuvent traiter les jobs asynchrones, ce qui simule un vrai flux de traitement.
- On peut ensuite ajouter un Docker / bench fonctionnel pour mesurer latence, débit et complétude, sans se préoccuper des implémentations internes

      ┌───────────────┐
      │   FRONTEND    │
      │ (UC1-UC5)     │
      │ Login / UI    │
      └─────┬─────────┘
            │ Flux utilisateur
            │ (clics, scroll, lazy load)
            ▼
      ┌───────────────┐
      │   BACKEND     │
      │ (UC6-UC10)    │
      │ REST API      │
      │ Worker Jobs   │
      └─────┬─────────┘
            │ Flux enrichi / réponse
            │ (particules rouges: détails films,
            │  lazy load: chargement progressif)
            ▼
      ┌───────────────┐
      │   FRONTEND    │
      │ UI update     │
      │ Lazy loading  │
      └───────────────┘

Flux en action (exemple de particules en circulation) :

[Frontend Input]  → ●●●●● → [Backend] → ○○○○ → [Frontend Output]

Légende :
● : particule de flux utilisateur (clic / scroll / action)
○ : particule de flux de retour backend (film, métadonnées)
Lazy load : particules oranges (○) arrivent par batch partiel

🔹 Comment le lire
1 - Particules rouges (●) : actions utilisateur → flux envoyé vers backend.
2 - Particules orange (○) : données traitées par le backend → flux retour au frontend.
3 - Lazy loading : les particules orange ne sont pas toutes envoyées en même temps, elles arrivent par batch, ce qui simule le chargement progressif des listes / détails / contenus similaires.
4 - Worker jobs (UC6-UC10) : peuvent générer ou transformer des particules en arrière-plan, le flux reste visible côté backend → frontend.

