Diagramme relationnel :
+----------------+        +----------------+        +----------------+
|   Movies       |        |   People       |        |  Departments   |
+----------------+        +----------------+        +----------------+
| movieId (PK)   |<----+  | peopleId (PK)  |        | departmentId(PK)|
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
                           | peopleId FK    |
                           | roleId FK      |
                           +----------------+

Explications claires :

Movies ↔ Movie-People ↔ People

Chaque ligne dans Movie-People lie une personne à un film avec un rôle précis.

Une personne peut avoir plusieurs rôles sur un même film (plusieurs lignes).

Roles ↔ Departments

Chaque rôle appartient à exactement un département (departmentId).

Exemple :

Lead Actor → Acting

Supporting Actor → Acting

Director → Directing

Movie-People

Contient uniquement movieId, peopleId, roleId.

Pas besoin de stocker departmentId dans Movie-People, il est implicite via le rôle.

Genres

Stockés dans Movies sous forme de tableau d’IDs (genreIds).

Référencés depuis Genres.json.

✅ Avantages de ce schéma :

Cohérent et explicite : tous les noms suivent un pattern clair (People, Movie-People).

Normalisé : pas de duplication de rôle ou de département.

Extensible : facile d’ajouter de nouveaux rôles, départements ou genres.

Lisible : pour le backend comme pour l’équipe, la relation est immédiatement compréhensible.


People ↔ Movie-People ↔ Roles ↔ Departments.

Diagramme visuel Inception
                      +----------------+
                      |    Movies      |
                      +----------------+
                      | movieId: 555   |
                      | title: Inception|
                      | year: 2010     |
                      | genreIds: [1,4,0]|
                      +----------------+
                               |
                               |  movieId
                               v
                      +----------------+
                      |  Movie-People  |
                      +----------------+
                      | movieId: 555   |
                      | peopleId: 101  |----+
                      | roleId: 0      |    |
                      +----------------+    |
                               |            |
                               | peopleId   |
                               v            |
                      +----------------+    |
                      |    People      |    |
                      +----------------+    |
                      | peopleId: 101  |<---+
                      | name: Leonardo |
                      | DiCaprio       |
                      +----------------+
                               |
                               | roleId
                               v
                      +----------------+
                      |     Roles      |
                      +----------------+
                      | roleId: 0      |
                      | name: Lead Actor|
                      | departmentId: 0|
                      +----------------+
                               |
                               | departmentId
                               v
                      +----------------+
                      |  Departments   |
                      +----------------+
                      | departmentId:0 |
                      | name: Acting   |
                      +----------------+


--------------------------------------------------------
Autres personnes / rôles pour le film :

Movie-People:
- (movieId:555, peopleId:101, roleId:5) → Producer → Production
- (movieId:555, peopleId:102, roleId:1) → Supporting Actor → Acting
- (movieId:555, peopleId:103, roleId:2) → Guest Actor → Acting
- (movieId:555, peopleId:104, roleId:3) → Director → Directing
- (movieId:555, peopleId:105, roleId:4) → Writer → Writing

Explications :

Chaque flèche relie une clé étrangère à sa référence :

movieId → Movies

peopleId → People

roleId → Roles

departmentId → Departments

Une personne peut apparaître plusieurs fois dans Movie-People si elle a plusieurs rôles.

Les rôles sont hiérarchisés par département, donc departmentId n’est jamais dupliqué dans Movie-People.

Cette représentation fonctionne parfaitement pour le backend et pour des jointures SQL ou des requêtes NoSQL.

