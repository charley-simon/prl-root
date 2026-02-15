            +----------------------+
            |  État / Contexte     |
            |  (Stack / Frames)    |
            +----------+-----------+
                       |
                       v
            +----------------------+
            |  Graphe de Relations |
            |  (précompilé, poids)|
            +----------+-----------+
                       |
                       v
            +----------------------+
            |  Filtrage par WHEN   |
            |  (conditions dynamiques|
            |   sur contexte ou métriques) |
            +----------+-----------+
                       |
                       v
            +----------------------+
            |  Sélection de l'action |
            |  (poids, coût, priorité)|
            +----------+-----------+
                       |
                       v
            +----------------------+
            |  Exécution de l'action|
            |  - Résolution du Frame|
            |  - Side-effects / alertes|
            +----------+-----------+
                       |
                       v
            +----------------------+
            |  Mise à jour du contexte |
            |  - StackFrame résolu     |
            |  - Metrics, logs         |
            +----------------------+

✅ Notes importantes :

État / Contexte : c’est ton StackStore + Frames résolus / non résolus.

Graphe de Relations : toutes les relations possibles, éventuellement pondérées.

Filtrage par WHEN : conditionnel, dépend du contexte et éventuellement de métriques externes (pannes, temps de réponse…).

Sélection de l’action : choix déterministe du chemin le “moins coûteux” selon poids et contraintes.

Exécution de l’action : résout un Frame, met à jour resolvedBy, déclenche des alertes si nécessaire.

Mise à jour du contexte : chaque action modifie l’état, influence le prochain choix, et peut être réutilisée pour éviter de recalculer.

💡 Ce schéma représente exactement le moteur actuel + l’extension WHEN/adaptative, sans jamais perdre la traçabilité ni la détermination des résultats.

Parfait ! Voici un exemple concret et minimal pour visualiser comment ton moteur pourrait fonctionner avec des WHEN et des chemins de fallback. Je vais le faire sans code complexe, juste pour que l’intuition soit claire.

Scénario

Objectif : Résoudre la liste des acteurs pour un film donné, avec possibilité de fallback si la liaison principale est indisponible.

1️⃣ Contexte initial (Stack)
[
  {
    "entity": "Movie",
    "id": 1,
    "purpose": "Inspect movie",
    "intent": {},
    "state": "RESOLVED",
    "resolvedBy": null
  },
  {
    "entity": "People",
    "purpose": "List actors of the movie",
    "intent": { "role": "Actor" },
    "state": "UNRESOLVED",
    "resolvedBy": null
  }
]

2️⃣ Graphe de relations (précompilé)
Relation	From	To	Via	Weight	WHEN	onUse
movie-actors	Movie	People	Movie-People	1	service.moviePeople.available === true	-
movie-actors-fallback	Movie	People	Movie-People	5	service.moviePeople.available === false	emitAlert("Fallback used")

Poids : priorise la route normale (1 < 5)

WHEN : condition dynamique (disponibilité du service)

onUse : action secondaire (alerte)

3️⃣ Résolution du moteur

Étape 1 : filtre par WHEN

Le moteur regarde le contexte et les métriques.

service.moviePeople.available est vrai → la relation movie-actors est valide.

Étape 2 : sélection de l’action

Choix déterministe : prendre la relation avec le poids le plus bas parmi celles valides.

Ici : movie-actors (poids 1)

Étape 3 : exécution

Résout le frame People (actors)

Remplit resolvedBy avec détails de la relation

4️⃣ Cas fallback (service indisponible)

service.moviePeople.available === false

movie-actors ne passe pas le filtre WHEN

movie-actors-fallback passe le filtre

Moteur choisit movie-actors-fallback

Exécute la résolution avec poids 5

Déclenche emitAlert("Fallback used")

5️⃣ Mise à jour de la pile
[
  {
    "entity": "Movie",
    "id": 1,
    "purpose": "Inspect movie",
    "intent": {},
    "state": "RESOLVED",
    "resolvedBy": null
  },
  {
    "entity": "People",
    "purpose": "List actors of the movie",
    "intent": { "role": "Actor" },
    "state": "RESOLVED",
    "resolvedBy": {
      "relation": "movie-actors-fallback",
      "via": "Movie-People",
      "filters": [
        { "field": "movieId", "value": 1 },
        { "field": "roleId", "value": "Actor" }
      ]
    }
  }
]


✅ Tout est déterministe pour l’état donné, mais adaptatif si le contexte ou les métriques changent.

6️⃣ Ce que ça illustre

WHEN = condition dynamique qui active ou désactive une relation

Poids = guide le choix quand plusieurs relations sont valides

onUse = side-effect / alerte pour suivi ou labo

Pile / Contexte = état observé par le moteur pour la résolution

Fallback = adaptation automatique sans rupture
