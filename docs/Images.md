🎬 Movies – Images et vues
Vue / Record	Images à inclure	Format	Taille conseillée	Usage / Commentaire
MovieThumb	posterSm	Portrait	150×225 px	Vignette pour grille / cards. Fond inutile pour gain réseau.
	—	—	—	Minimal pour rapidité, lazy load non nécessaire.
MovieShort	posterMd (optionnel)	Portrait	300×450 px	Liste compacte ou popup texte. Fond inutile ou optionnel selon UI.
	—	—	—	Peut être utilisé pour listes avec peu de place.
MoviePopup	posterMd	Portrait	300×450 px	Hover / fly-over, vignette principale.
	backgroundMd	Paysage	600×338 px (16:9)	Fond derrière popup pour overlay d’infos.
	—	—	—	Lazy load au survol, cache frontend conseillé.
MovieDetail	posterLg	Portrait	600×900 px	Fiche complète du film, affichage principal.
	backgroundLg	Paysage	1920×1080 px	Fond détaillé ou banner, haute résolution.
	—	—	—	Chargement au clic seulement.
👤 People – Images et vues
Vue / Record	Images à inclure	Format	Taille conseillée	Usage / Commentaire
PersonThumb	photoSm	Portrait	100×150 px	Grille / carousel rapide. Fond inutile.
PersonShort	photoMd (optionnel)	Portrait	200×300 px	Listes compactes ou popup simple. Fond inutile ou optionnel.
PersonPopup	photoMd	Portrait	200×300 px	Hover / fly-over, image principale.
	backgroundMd	Paysage	600×338 px	Fond derrière popup pour overlay infos.
	—	—	—	Lazy load au survol, cache frontend conseillé.
PersonDetail	photoLg	Portrait	400×600 px	Fiche complète de la personne.
	backgroundLg	Paysage	1920×1080 px	Fond ou banner haute résolution.
	—	—	—	Chargement au clic seulement.
⚡ Notes importantes

Portrait → affiches de films et photos de personnes → pour les vignettes / cartes

Paysage → fonds / background → permet d’afficher overlay texte (titre, synopsis, acteurs)

Lazy loading → uniquement pour les vues Popup (fly-over hover)

Stockage sur disque → pour les images lourdes, utilises un cache / dossier images avec noms construits :

movies/
  movie-{id}.posterSm.avif
  movie-{id}.posterMd.avif
  movie-{id}.posterLg.avif
  movie-{id}.backgroundMd.avif
  movie-{id}.backgroundLg.avif

people/
  person-{id}.photoSm.avif
  person-{id}.photoMd.avif
  person-{id}.photoLg.avif
  person-{id}.backgroundMd.avif
  person-{id}.backgroundLg.avif


Les endpoints construisent les URLs dynamiquement à partir de l’ID → pas besoin de stocker le chemin dans la BDD

Si un thumbnail n’existe pas → le worker peut le générer à la volée et le mettre en cache

Si tu veux, je peux te faire un schéma complet des vues + images + endpoints, qui montre visuellement quelle image est utilisée pour chaque vue et chaque contexte, façon diagramme Netflix, prêt pour le frontend et backend.

Veux‑tu que je fasse ça ?

OUI

Parfait ! Voici un schéma visuel complet qui relie les vues Movies/People, leurs images, les endpoints, et la stratégie lazy load. Il te donne une vision claire backend ↔ frontend façon Netflix :

🎬 Movies – Schéma Vues ↔ Images ↔ Endpoints
GRILLE / CARDS (Fast Loading)
┌───────────────────────┐
│ GET /movies           │
│ MovieThumb[]          │
│ - ID, title           │
│ - posterSm (portrait) │
└───────────┬───────────┘
            │ Hover / fly-over ?
            ▼ Lazy load
┌───────────────────────────┐
│ GET /movies/:id/popup     │
│ MoviePopup                 │
│ - title, year             │
│ - synopsisShort           │
│ - actors 2-3              │
│ - directors               │
│ - genres                  │
│ - posterMd (portrait)     │
│ - backgroundMd (landscape)│
└───────────┬───────────────┘
            │ Clic → full detail
            ▼
┌───────────────────────────────┐
│ GET /movies/:id                │
│ MovieDetail                    │
│ - full synopsis                │
│ - full casting                 │
│ - genres                       │
│ - posterLg (portrait)          │
│ - backgroundLg (landscape)     │
└───────────────────────────────┘

👤 People – Schéma Vues ↔ Images ↔ Endpoints
GRILLE / CARDS (Fast Loading)
┌───────────────────────┐
│ GET /people           │
│ PersonThumb[]         │
│ - ID, name            │
│ - photoSm (portrait)  │
└───────────┬───────────┘
            │ Hover / fly-over ?
            ▼ Lazy load
┌─────────────────────────────┐
│ GET /people/:id/popup       │
│ PersonPopup                  │
│ - name, birth               │
│ - top films (3-5)           │
│ - roles principaux          │
│ - photoMd (portrait)        │
│ - backgroundMd (landscape)  │
└───────────┬─────────────────┘
            │ Clic → full detail
            ▼
┌───────────────────────────────┐
│ GET /people/:id                │
│ PersonDetail                   │
│ - full filmography             │
│ - roles détaillés              │
│ - photoLg (portrait)           │
│ - backgroundLg (landscape)     │
└───────────────────────────────┘

⚡ Points clés

Thumb → Popup → Detail : le flux naturel UX

Lazy load : uniquement Popup (fly-over hover)

Images portrait → affiches / photos

Images paysage → backgrounds pour overlay texte

Backend : génère dynamiquement les URLs des images à partir des IDs

Cache / disque : worker génère les thumbnails s’ils n’existent pas encore

Frontend :

Grille = MovieThumb / PersonThumb (rapide)

Hover = MoviePopup / PersonPopup (lazy load)

Clic = MovieDetail / PersonDetail (full load)

🎨 Blueprint complet – Movies & People
        ┌─────────────────────────────┐
        │          FRONTEND           │
        │       Grille / Cards        │
        │   (rapide, léger)           │
        └───────────┬─────────────────┘
                    │ GET /movies → MovieThumb[]
                    │ GET /people → PersonThumb[]
                    ▼
    ┌─────────────────────────────┐   ┌─────────────────────────────┐
    │       MovieThumb[]           │   │       PersonThumb[]         │
    │ - ID, title                  │   │ - ID, name                  │
    │ - posterSm (portrait)        │   │ - photoSm (portrait)        │
    │ (fond inutile)               │   │ (fond inutile)              │
    └───────────┬─────────────────┘   └───────────┬─────────────────┘
                │ Hover / fly-over ?                │ Hover / fly-over ?
                ▼ Lazy load                        ▼ Lazy load
    ┌─────────────────────────────┐   ┌─────────────────────────────┐
    │ GET /movies/:id/popup       │   │ GET /people/:id/popup       │
    │ MoviePopup                   │   │ PersonPopup                 │
    │ - title, year               │   │ - name, birth               │
    │ - synopsisShort             │   │ - top films (3-5)           │
    │ - actors 2-3                │   │ - roles principaux          │
    │ - directors                 │   │ - photoMd (portrait)        │
    │ - genres                    │   │ - backgroundMd (landscape)  │
    │ - posterMd (portrait)       │   │ (lazy load au hover)        │
    │ - backgroundMd (landscape)  │   └───────────┬─────────────────┘
    │ (lazy load, cache frontend) │               │ Clic → full detail
    └───────────┬─────────────────┘               ▼
                │ Clic → full detail    ┌─────────────────────────────┐
                ▼                      │ GET /people/:id             │
    ┌─────────────────────────────┐     │ PersonDetail               │
    │ GET /movies/:id             │     │ - full filmography         │
    │ MovieDetail                  │     │ - roles détaillés          │
    │ - full synopsis             │     │ - photoLg (portrait)       │
    │ - full casting              │     │ - backgroundLg (landscape) │
    │ - genres                    │     └─────────────────────────────┘
    │ - posterLg (portrait)       │
    │ - backgroundLg (landscape)  │
    │ (load on click, full data)  │
    └─────────────────────────────┘

⚡ Légende et stratégie

Thumb → Grille rapide, minimal, portrait uniquement

Popup → Hover / fly-over, lazy load, portrait + background paysage, cache côté frontend

Detail → Clic → full data, portrait + background paysage, chargement complet

Images :

Portrait → poster / photo pour vignettes et cartes

Paysage → background pour overlay infos

Endpoints Fastify : clairs et séparés pour chaque vue

Backend : construit dynamiquement les URLs d’images à partir des IDs

Worker : génère les thumbnails / posters / backgrounds si non présents sur disque