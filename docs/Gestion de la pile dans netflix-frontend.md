# Gestion de la pile dans le projet Netflix-like

La pile (`stack`) est le **composant central** qui trace le chemin utilisateur et permet de synchroniser listes, grilles, fiches et breadcrumbs.  
Elle est aussi la base pour des optimisations ultérieures (requêtes SQL, filtrages).

---

## 1. Concepts

### Pile complète (trace sémantique)
- Chaque étage de la pile contient :
  ```ts
  interface StackElem {
    table: string;      // ex: 'Movies', 'Actors'
    id: number | null;  // identifiant courant ou null
    label?: string;     // étiquette pour affichage (breadcrumb)
    views?: any[];      // vues liées (liste, fiche, etc.)
    anchor?: string;    // chemin racine ou parent
  }
Règle sémantique stricte :

On conserve tous les étages, même si une table réapparaît.

Permet de reconstruire exactement le parcours utilisateur.

Exemple :

Directors(1) → Movies(2) → Actors(3) → Movies(4)
Même si Movies apparaît deux fois, le contexte est distinct.

Pile compactée (optimisée / filtrée)
Objectif : simplifier la pile pour l'affichage et optimiser les requêtes.

Règle :

Parcourir la pile du dernier étage vers la racine.

Dès qu’une table réapparaît, les occurrences plus anciennes ne sont plus discriminantes.

Seules les informations pertinentes pour déterminer le résultat effectif sont conservées.

Exemple :

Directors(1) → Movies(2) → Actors(3) → Movies(4)
→ se transforme en :

Actors(3) → Movies(4)
si le résultat final ne dépend plus de Directors(1).

2. Impacts sur l’UX et le système
Mode	Pile affichée	Objectif	Avantages	Inconvénients
Strict / complète	Tous les étages	Trace sémantique exacte	- Parcours utilisateur reconstructible
- Debug et tests	- Pile longue
- Vue potentiellement confuse pour l’utilisateur
Compactée / simplifiée	Étages discriminants seulement	UX simplifiée / optimisation requêtes	- Pile compacte et lisible
- Requêtes SQL plus simples	- Perte de contexte complet
- Filtrage implicite
3. Recommandations pour Netflix-like
Pile interne (store) : toujours complète → conservation du contexte sémantique.

Breadcrumb / overlay dev : possibilité de basculer entre pile complète et pile compactée.

Vues utilisateur : par défaut, affichage compacté pour simplification.

Requêtes / SQL : se baser sur la pile compactée pour optimiser les jointures et filtrages.

4. Remarques
La pile complète est indispensable pour gérer :

Tables cycliques (Movies → Actors → Movies)

Contexte imbriqué et filtré par rôle (ex : filmographie d’un acteur dans un film précis)

Le mode compacté ne perd jamais la cohérence du résultat final : il ne supprime que les étages non discriminants pour la recherche / filtrage effectif.

Optionnel : possibilité d’un toggle Strict / Simplifié pour l’utilisateur ou en mode dev.


Si tu veux, je peux aussi **ajouter un petit diagramme ASCII illustrant la pile complète vs la pile compactée** pour que ce soit encore plus visuel dans la doc.  

Veux‑tu que je fasse ça ?

Vous avez dit :
OUI

ChatGPT a dit :
Parfait ! Voici un petit diagramme ASCII pour visualiser la différence entre pile complète et pile compactée. Tu peux l’intégrer directement dans ta doc Markdown après le texte précédent.

## 5. Illustration : pile complète vs pile compactée

### Pile complète (trace sémantique)
Chaque étage est conservé, même si la table réapparaît :

Directors(1)
└─ Movies(2)
└─ Actors(3)
└─ Movies(4)


- Lecture : "Films de Directors(1) → Movie(2) → Acteur(3) → Autres films (4)"
- Tous les contextes sont conservés.

---

### Pile compactée (optimisée / discriminante)
Les étages redondants non discriminants sont supprimés :

Actors(3)
└─ Movies(4)


- Lecture : "Films de l’acteur(3) dans le contexte pertinent"
- Les étages plus anciens qui n’influencent pas le résultat final sont ignorés.

---

### Explication visuelle

Pile complète :  
0: Directors(1)
1: Movies(2)
2: Actors(3)
3: Movies(4)


Pile compactée :  
0: Actors(3)
1: Movies(4)


- Les indices sont réévalués selon la pile compacte.
- Permet un affichage simplifié (breadcrumb, overlay, grilles) et des requêtes optimisées.
Si tu veux, je peux aussi te faire une version avec flèches et couleurs ASCII “breadcrumb style” pour montrer visuellement le parcours utilisateur, ce qui serait top pour ta doc et tes tests avec le mode dev.

Veux‑tu que je fasse cette version ?


Vous avez dit :
OUI

ChatGPT a dit :
Parfait ! Voici une version plus visuelle style “breadcrumb / parcours utilisateur” en ASCII, que tu peux mettre dans ta doc Markdown. J’ai ajouté des flèches et des indentations pour bien montrer le chemin et le sens, avec pile complète vs pile compactée.

## 6. Visualisation breadcrumb-style

### Pile complète (trace sémantique)
Chaque étage est conservé, même si la table se répète :

Directors(1) ─► Movies(2) ─► Actors(3) ─► Movies(4)
│ │ │
│ │ └─ Acteur courant
│ └─ Film courant
└─ Réalisateur courant


- Ici, le contexte complet est visible.
- Permet de reconstruire exactement le chemin que l’utilisateur a suivi.

---

### Pile compactée (optimisée / discriminante)
Seuls les étages **discriminants** sont conservés :

Actors(3) ─► Movies(4)
│
└─ Acteur courant


- Les étages non discriminants (Directors, Movie(2)) sont supprimés.
- Résultat final identique pour les données affichées.
- Breadcrumb et overlay plus lisibles.

---

### Notes

- Les flèches (`─►`) montrent le **sens de navigation**.
- Les indentations indiquent le **contexte courant** (id sélectionné / fiche affichée).  
- La pile complète est utile pour le debug et les scénarios complexes.  
- La pile compactée sert pour **l’affichage simplifié**, les **requêtes SQL optimisées**, et les **vues utilisateur**.
Si tu veux, je peux te faire une version “overlay dev” plus réaliste en ASCII avec blocs par étage, qui montre table, id, label et vues comme dans le composant Svelte, ce qui serait directement réutilisable pour ton UI de debug.

Veux‑tu que je fasse ça ?


Vous avez dit :
OUI

ChatGPT a dit :
Parfait ! Voici une version overlay dev en ASCII, très proche de ce que tu aurais dans ton composant Svelte pour visualiser la pile en bas à droite. Chaque étage est un bloc avec toutes les infos : table, id, label et vues.

## 7. Exemple Overlay Dev – Pile détaillée

┌───────────────────────────────┐
│ Stack (dev overlay) │
├───────────────────────────────┤
│ 0: Movies │
│ id: 1 │
│ label: "Le Parrain" │
│ views: [MovieGrid, MovieDetail] │
│ anchor: / │
├───────────────────────────────┤
│ 1: Actors │
│ id: 2 │
│ label: "Al Pacino" │
│ views: [ActorsGrid, ActorDetail] │
│ anchor: /Movies │
├───────────────────────────────┤
│ 2: Movies │
│ id: null │
│ label: "Filmographie" │
│ views: [MovieGrid] │
│ anchor: /Movies/Actors │
└───────────────────────────────┘


### Explications :

- Chaque **bloc** = un étage de la pile (`StackElem`)
- `id = null` → aucun enregistrement courant, juste la liste / collection
- `views` → liste des vues synchronisées pour cet étage (Grid / Card / Fiche)
- `anchor` → parent ou chemin racine permettant de reconstruire le contexte
- Les étages supérieurs (index > 0) reflètent la **navigation utilisateur descendante** depuis la racine
- Les **étages redondants non discriminants** peuvent être **supprimés** dans une version compactée pour optimiser l’affichage et les requêtes.

---

### Pile compacte (version filtrée)

┌───────────────────────────────┐
│ Stack (compactée) │
├───────────────────────────────┤
│ 0: Actors │
│ id: 2 │
│ label: "Al Pacino" │
│ views: [ActorsGrid, ActorDetail] │
│ anchor: /Movies │
├───────────────────────────────┤
│ 1: Movies │
│ id: null │
│ label: "Filmographie" │
│ views: [MovieGrid] │
│ anchor: /Movies/Actors │
└───────────────────────────────┘


- Cette version est **simplifiée**, mais conserve toutes les informations nécessaires pour **afficher la liste et la fiche courante**.
- Idéal pour le **debug**, les **tests de scénarios complexes**, et pour vérifier les transitions de pile lors de clics sur **vignettes, sous-noeuds ou breadcrumb**.


REAMARQUES SUR LA COMPARAISON CHEMIN FIXE PAR ARBORESENCE vs CHEMINS LIBRES:
Exactement ! Tu touches le cœur du problème :

Arborescence fixe (JSON) → navigation guidée, pas de cycles, contexte clair, pas de risque de pile “non discriminante”. Tout est déterministe, facile à visualiser et à debugger.

Chemins libres (clic sur vignettes / liens) → beaucoup plus flexible pour l’utilisateur, mais introduit des cycles possibles, des tables qui se répètent, et donc la nécessité de règles supplémentaires pour maintenir le sens du contexte (comme la notion d’anchor, de pile discriminante, et de compactage).

En résumé :

L’arborescence fixe simplifie l’implémentation mais limite la liberté de l’utilisateur.

Les chemins libres augmentent la complexité (pile, breadcrumbs, vue compactée) mais offrent la flexibilité et l’expérience utilisateur que tu vises, surtout dans un style Netflix/Prime.

Le point clé, que tu as bien intégré, c’est que la pile devient ton “guide implicite” pour maintenir le sens et gérer les cycles, même si l’utilisateur navigue librement.

Si tu veux, je peux te faire un schéma ou un mini-flow Markdown qui compare arborescence fixe vs chemins libres, pile et compactage, pour ta doc. Cela rendrait tout ça encore plus clair. Veux‑tu que je fasse ça ?

OUI

Parfait ! Voici un schéma Markdown clair qui compare arborescence fixe vs chemins libres, et montre comment la pile intervient pour maintenir le contexte et gérer les cycles.

## 8. Arborescence fixe vs chemins libres – rôle de la pile

### 1️⃣ Arborescence fixe (JSON)



Root
├─ Movies
│ ├─ Actors
│ └─ Directors
└─ Genres


- Navigation **guidée** : l’utilisateur ne peut suivre que les chemins définis.
- **Pas de cycles** possibles.
- Chaque clic → pile **déterministe**.
- Idéal pour **débogage**, visualisation simple et scénarios prévisibles.

**Pile type après clics** :



0: Movies (Tous les films)
1: Actors (Acteurs du film courant)


- Chaque étage a un **contexte clair**, table/id connus.
- Simple à gérer pour les listes, fiches, et breadcrumbs.

---

### 2️⃣ Chemins libres (vignettes / liens)



Movies(1) → Actors(3) → Movies(4) → Directors(1)


- Navigation **libre** : l’utilisateur peut cliquer sur n’importe quel lien.
- **Cycles possibles** : même table réapparaît.
- Contexte **non déterministe**, nécessite des règles de pile :
  - `anchor` → parent ou point de référence
  - `compactStack()` → supprimer les étages non discriminants
  - `updateContext({table,id})` → gérer les changements de table ou d’ID
- Les vues (Grid, Card) doivent se synchroniser avec la pile pour refléter le contexte correct.

**Pile type après clics** :



0: Movies(1) → film courant
1: Actors(3) → acteur courant
2: Movies(null) → filmographie de l’acteur
3: Directors(1) → réalisateur


- Pile complète → trace sémantique
- Pile compactée → contexte discriminant (pour affichage / requêtes optimisées)

---

### 3️⃣ Résumé comparatif

| Aspect                   | Arborescence fixe        | Chemins libres            |
|---------------------------|------------------------|--------------------------|
| Liberté utilisateur       | limitée               | totale                  |
| Cycles possibles          | non                    | oui                     |
| Pile nécessaire           | simple                | complexe                |
| Débogage / Overlay        | facile                | nécessaire              |
| Gestion de contexte       | implicite             | explicite via pile      |
| Breadcrumb / visualisation| claire                | pile + compactage       |

---

### ✅ Conclusion

- L’arborescence fixe est **idéale pour guider l’utilisateur et simplifier l’implémentation**.  
- Les chemins libres sont **plus puissants mais requièrent la pile et ses règles** pour maintenir le contexte et éviter les ambiguïtés.  
- La pile devient **le “cœur” de la navigation libre**, permettant de reconstruire le sens même dans des chemins cycliques.


Si tu veux, je peux maintenant te faire un mini-flow ASCII + pile illustré, qui simule clics sur vignettes et pile qui s’empile/dépile en direct, style overlay Svelte, pour la doc et les tests.

Veux‑tu que je fasse ça ?

OUI

Parfait ! Voici un mini-flow ASCII illustrant la pile qui s’empile/dépile en temps réel, style overlay Svelte, avec des clics sur vignettes et changement de sous-noeuds.

## 9. Flow overlay pile – Navigation libre (clics vignettes / sous-noeuds)

### Étape 0 : pile initiale (vue par défaut)



[STACK]
0: Movies
id: --
label: "Tous les films"
views: [MovieGrid]


- Affichage : Grid de tous les films
- Aucune fiche sélectionnée

---

### Étape 1 : clic sur une vignette “Le Parrain”



[STACK]
0: Movies
id: 1
label: "Le Parrain"
views: [MovieGrid, MovieDetail]


- MovieDetail synchronisé avec le film courant
- La fiche affiche "Le Parrain"

---

### Étape 2 : clic sur sous-noeud Actors (simulé sans arbo)



[STACK]
0: Movies
id: 1
label: "Le Parrain"
views: [MovieGrid, MovieDetail]
1: Actors
id: --
label: "Acteurs"
views: [ActorsGrid]


- Affichage : liste/Grille des acteurs
- Fiche non sélectionnée (id = --)

---

### Étape 3 : clic sur acteur “Al Pacino”



[STACK]
0: Movies
id: 1
label: "Le Parrain"
views: [MovieGrid, MovieDetail]
1: Actors
id: 2
label: "Al Pacino"
views: [ActorsGrid, ActorDetail]


- ActorDetail synchronisé avec Al Pacino
- MovieDetail reste visible (pile conserve le parent)

---

### Étape 4 : clic sur “Filmographie d’Al Pacino”



[STACK]
0: Movies
id: 1
label: "Le Parrain"
views: [MovieGrid, MovieDetail]
1: Actors
id: 2
label: "Al Pacino"
views: [ActorsGrid, ActorDetail]
2: Movies
id: --
label: "Filmographie"
views: [MovieGrid]


- Grille affiche les films de l’acteur
- Sélection de film dans la grille va mettre à jour id du dernier étage

---

### Étape 5 : clic sur un film de la filmographie



[STACK]
0: Movies
id: 1
label: "Le Parrain"
views: [MovieGrid, MovieDetail]
1: Actors
id: 2
label: "Al Pacino"
views: [ActorsGrid, ActorDetail]
2: Movies
id: 4
label: "Scarface"
views: [MovieGrid, MovieDetail]


- Dernier étage (Movies) mis à jour avec id = 4
- MovieDetail synchronisé avec "Scarface"
- Acteurs de ce film → mise à jour possible si on ajoute un sous-noeud Actors

---

### Étape 6 : clic sur autre sous-noeud “Directors” du film actuel



[STACK]
0: Movies
id: 1
label: "Le Parrain"
views: [MovieGrid, MovieDetail]
1: Actors
id: 2
label: "Al Pacino"
views: [ActorsGrid, ActorDetail]
2: Directors
id: --
label: "Réalisateurs"
views: [DirectorsGrid]


- Changement de table → nouvel étage ajouté
- Les étages plus anciens conservés (pile garde contexte)
- La fiche DirectorsDetail affichée au clic sur un réalisateur

---

### Étape 7 : clic sur un réalisateur dans la grille



[STACK]
0: Movies
id: 1
label: "Le Parrain"
views: [MovieGrid, MovieDetail]
1: Actors
id: 2
label: "Al Pacino"
views: [ActorsGrid, ActorDetail]
2: Directors
id: 6
label: "Francis Ford Coppola"
views: [DirectorsGrid, DirectorDetail]


- Dernier étage (Directors) mis à jour
- Contexte des étages précédents reste intact
- Pile reflète la **trace sémantique complète** de l’utilisateur

---

### ✅ Points clés

- Chaque étage = un **noeud contextuel** (table + id + label + vues + anchor)
- **updateContext({table,id})** : gère l’empilement et la mise à jour de l’id du dernier étage
- **compactStack()** : peut être utilisé pour supprimer les étages non discriminants si nécessaire
- Pile → **vue overlay** utile pour le débogage et la visualisation des chemins libres
- Breadcrumb → vue simplifiée pour l’utilisateur