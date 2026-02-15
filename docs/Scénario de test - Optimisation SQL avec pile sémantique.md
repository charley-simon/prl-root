Scénario de test : Optimisation SQL avec pile sémantique
Objectif

Analyser l’apport de performances d’une requête SQL générée à partir de la pile sémantique.
L’idée est d’ignorer les paramètres non discriminants (tables réapparaissant dans la pile) tout en conservant le chemin sémantique utilisateur.

Contexte

Navigation utilisateur simulée : /People(1)/Movies(2)/People(5)

Sémantiquement :

People(1) → réalisateur

Movies(2) → film

People(5) → acteur

Implémentation : même table People pour directeur et acteur → cyclique.

Problème : si la requête SQL inclut People(1) et People(5), la jointure sur le réalisateur devient non discriminante pour récupérer l’acteur.

Règles d’optimisation

Parcourir la pile du bas (dernier élément) vers le haut (racine).

Conserver uniquement les ID discriminants pour chaque table.

Dès qu’une table réapparaît plus haut, l’ID est ignoré (non discriminant).

La pile reste inchangée pour le breadcrumb / UI, seule la génération SQL est optimisée.

Données de test

Pile sémantique :

Niveau Table / Collection ID Rôle
0 People 1 Director
1 Movies 2 Film
2 People 5 Actor
Requête naïve (non optimisée)
SELECT a.\*
FROM People d
JOIN Movies m ON m.director_id = d.id
JOIN People a ON a.movie_id = m.id
WHERE d.id = 1 AND m.id = 2 AND a.id = 5;

Toutes les jointures sont exécutées.

Le filtre d.id = 1 est redondant pour récupérer l’acteur 5.

Requête optimisée (avec pile sémantique)

Parcours de la pile du bas vers le haut :

People(5) → discriminant ✅

Movies(2) → discriminant ✅

People(1) → déjà vu table People → non discriminant ❌

Génération SQL :

SELECT a.\*
FROM People a
JOIN Movies m ON a.movie_id = m.id
WHERE m.id = 2 AND a.id = 5;

Nombre de jointures réduit

Moins de calcul pour la base

Même résultat côté utilisateur

Objectifs mesurables

Comparer temps de requête entre la version naïve et optimisée

Vérifier que le résultat utilisateur est identique

Évaluer l’impact sur replay / analytics dans le laboratoire

Notes

La pile reste sémantique, même si certaines tables sont ignorées pour la requête.

Ce scénario peut être répété avec :

Chemins plus longs et cycliques

Plusieurs occurrences de la même table (People, Movies)

Paramètres optionnels ou non discriminants

1️⃣ Objectif de compactStack

Prendre une pile complète (StackElem[])

Parcourir du bas vers le haut

Retirer tous les éléments non discriminants pour une table déjà vue

Retourner une nouvelle pile compacte utilisable pour générer des requêtes optimisées

2️⃣ Pseudocode / logique
function compactStack(stack: StackElem[]): StackElem[] {
const seenTables = new Set<string>();
const compacted: StackElem[] = [];

// Parcours du bas (dernier élément) vers le haut
for (let i = stack.length - 1; i >= 0; i--) {
const elem = stack[i];

    // Si l'élément a un ID et que sa table n'a pas été vue
    if (elem.id != null && !seenTables.has(elem.table)) {
      compacted.unshift(elem);   // Ajouter en tête de compacted
      seenTables.add(elem.table);
    }
    // Sinon : table déjà vue ou id null → non discriminant, on l'ignore

}

return compacted;
}

✅ Comportement attendu

Exemple pile initiale :

Niveau Table ID
0 People 1
1 Movies 2
2 People 5

compactStack retourne :

Niveau Table ID
1 Movies 2
2 People 5

People(1) est supprimé car People(5) apparaît plus bas → People(1) n’est plus discriminant pour filtrer l’acteur.

La pile reste dans l’ordre logique de navigation.

3️⃣ Tests unitaires à prévoir

Cas simple cyclique :

/People(1)/Movies(2)/People(5)

Vérifier que la pile compacte contient uniquement Movies(2) et People(5)

Cas sans redondance :

/Movies(2)/People(5)/Genres(3)

La pile compacte doit rester identique

Cas ID null :

/Movies(null)/People(5)

Les éléments sans ID ne sont pas discriminants → peuvent être ignorés si besoin

Test de conformité :

Générer la requête SQL depuis ancienne pile et pile compacte

Vérifier que les résultats sont identiques

Puis passer aux benchmarks pour mesurer la performance

4️⃣ Bénéfices

Optimisation des requêtes SQL

Maintien du chemin sémantique complet pour l’UI / breadcrumb

Facilement testable avec des scénarios de piles complexes

Extensible pour des piles encore plus longues ou des cycles multiples

🧱 On peut nommer ce que tu touches

Selon les domaines, on appelle ça :

Context-driven UI

Intent-based navigation

Capability-based view resolution

Semantic routing sans routes

Declarative UI composition

Mais honnêtement ?
👉 Tu es plus proche d’un DSL de navigation que d’un framework UI classique.
