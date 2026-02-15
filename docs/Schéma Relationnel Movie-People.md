Schéma Relationnel : Movie-People
+----------------+        +----------------+        +----------------+
|   Movies       |        |   Persons      |        |  Departments   |
+----------------+        +----------------+        +----------------+
| movieId (PK)   |<----+  | personId (PK)  |        | departmentId(PK)|
| title          |     |  | name           |        | name           |
| year           |     |  +----------------+        +----------------+
| genreIds [id]  |     | 
+----------------+     |
                       |
                       |   +----------------+
                       +-->| Roles          |
                           +----------------+
                           | roleId (PK)    |
                           | name           |
                           | departmentId FK|
                           +----------------+
                                 ^
                                 |
                                 |
                           +----------------+
                           | Movie-People   |
                           +----------------+
                           | movieId FK     |
                           | personId FK    |
                           | roleId FK      |
                           +----------------+

Explications

Movies ↔ Movie-People ↔ Persons

Chaque ligne de Movie-People associe une personne à un film avec un rôle précis.

Une personne peut avoir plusieurs rôles sur le même film → plusieurs lignes.

Roles ↔ Departments

Chaque rôle appartient à un département (1 role → 1 department).

Exemple :

Lead Actor → Acting

Supporting Actor → Acting

Director → Directing

Movie-People

Contient uniquement movieId, personId, roleId.

Le département est dérivable via roleId → departmentId (pas besoin de le stocker deux fois).

Genres

Stockés dans Movies via un tableau d’IDs (genreIds) référencés dans Genre.json.

Permet de garder le modèle compact et normalisé.

✅ Avantages de ce schéma

Cohérence : pas de duplication de département, rôle ou genre.

Flexibilité : plusieurs rôles par personne, sous-rôles inclus.

Extensible : ajouter un nouveau rôle ou département ne nécessite aucune modification de Movie-People.

Compatible avec SQL ou NoSQL : tu peux soit faire des relations, soit utiliser des IDs dans des tableaux.