Roadmap Technique Netflix-like
Phase 1 – Backend + jeux de données mock
1️⃣ Tables / Références

Table reference (vues métiers : jobs, departments, gender)

id name type
1 Actor J
2 Director J
3 Screenwriter J
4 Producer J
5 Cinematographer J
6 Editor J
7 Composer J
8 Sound Mixer J
9 Costume Designer J
10 Makeup Artist J
11 Visual Effects Supervisor J
12 Special Effects Technician J

Departments

id name type
1 Acting D
2 Directing D
3 Writing D
4 Production D
5 Camera & Lighting D
6 Sound D
7 Music D
8 Visual Effects D
9 Costume & Makeup D
10 Art & Design D

Genders

id name type
1 Male G
2 Female G
3 Other G
2️⃣ Tables principales

movies (id, title, releaseYear, isLocal, source, etc.)

people (id, name, genderId, birthDate, deathDate?, etc.)

movie_people (id, movieId, peopleId, jobId, departmentId, characterName?, roleOrder?, etc.)

3️⃣ Endpoints Backend – OpenAPI / TypeBox

Movie-centric

Endpoint Description Filtrage
GET /movies Liste de tous les films –
GET /movies/{id} Détails d’un film –
GET /movies/{id}/actors Liste acteurs filtre interne sur jobId=Actor
GET /movies/{id}/directors Liste réalisateurs jobId=Director
GET /movies/{id}/crew Liste crew (générique) filtres facultatifs : job, department, gender

People-centric

Endpoint Description Filtrage
GET /people/{id} Fiche personne –
GET /people/{id}/movies Filmographie + rôles job/department list incluse
GET /people/{id}/roles Tous rôles détaillés –

Références

Endpoint Description
GET /jobs Tous les jobs
GET /departments Tous les départements
GET /genders Tous les genres
4️⃣ Repository interne / logique DRY

getPeoples(filters) = fonction générique

Les endpoints “vues métier” (getActors, getProducers, etc.) appellent cette fonction générique avec le filtre adéquat

Backend reste le gardien de la vérité et valide les filtres via TypeBox

Phase 2 – Frontend – indicateurs et workflow
1️⃣ Visualisation film

Liste films → chaque film a un statut local / remote

Indicateurs possibles :

✅ Film local → lecture immédiate

⏳ Film non présent → déclenche récupération / “à récupérer”

📥 Film en téléchargement → barre de progression

Vue film détaillé : affichage des actors, directors, crew, basé sur les endpoints métiers

2️⃣ Visualisation personne

Fiche personne

Filmographie + rôle

Indicateur pour chaque film : local / remote

3️⃣ Workflow UI simplifié

Clic film → vérifier isLocal

Si oui → lecture / détails immédiat

Si non → déclenche récupération via backend worker / queue, afficher indicateur

Notification / rafraîchissement automatique quand les données deviennent disponibles

Options supplémentaires : télécharger film complet en tâche de fond

Phase 3 – Backend ingestion / Worker
1️⃣ Queue de jobs

Chaque tâche = récupération film, personnes, crédits, images, vidéos…

Possibilité de prioriser : par film récent, populaire, ou demandé par le frontend

État des jobs = en cours, terminé, erreur

2️⃣ Worker / ingestion

Récupère données TMDb / Wikipedia / autres sources

Transforme et mappe dans le format interne

Stocke dans backend principal

Notifie frontend si besoin

Phase 4 – Extensions

Lecture / streaming

Téléchargement / préchargement

Notifications / alertes

Analytics / métriques

Recommandations / filtres avancés

✅ Avantages de cette roadmap

Architecture progressive et contrôlée

Backend principal = source de vérité

Frontend peut travailler dès maintenant sur données mock

Worker / ingestion = découplé → pas de code TMDb / web scraping compliqué dès le départ

API-first → contrats OpenAPI stables et testables

Prépare une architecture évolutive pour streaming, download, notifications

/movies -> collection
/movies/{id} -> film unique
/people -> collection
/people/{id} -> personne unique
/references -> collection
/references/{id} -> référence unique

Routes collections et ressources
Ressource Pluriel (collection) Singulier (élément unique) Notes / Observations
Film /movies /movies/{id} Toujours pluriel pour la collection.
Personne /people /people/{id} “people” est déjà pluriel → jamais peoples.
Référence (jobs, départements, genres) /references /references/{id} Table technique exposée comme collection.
Job /jobs /jobs/{id} Optionnel si tu veux exposer directement les jobs.
Department /departments /departments/{id} Optionnel si tu veux exposer directement les départements.
Gender /genders /genders/{id} Optionnel, utile pour filtrage ou UI.
Casting / Crew d’un film /movies/{id}/people N/A Vue métier générique → filtres job/department/role.
Filmographie d’une personne /people/{id}/movies N/A Vue métier → liste des films + rôle de la personne.
✅ Règles REST appliquées ici

Collections → pluriel

/movies, /people, /references

Indique clairement que c’est un ensemble d’objets

Ressources uniques → même nom que la collection + ID

/movies/{id}, /people/{id}, /references/{id}

Garde la cohérence, facile à documenter et à consommer

Mots déjà pluriels → pas de “s” ajouté

Ex : people → correct

Ne jamais écrire /peoples

Vues métier spécialisées

/movies/{id}/actors → appelle le filtre générique /movies/{id}/people?roles=Actor

/movies/{id}/directors, /movies/{id}/producers → mêmes principes

Filtres facultatifs pour endpoint générique

/movies/{id}/people?roles=Actor,Producer&departments=Directing,Production&gender=1

Backend reste le gardien → pas de filtrage client-side

Structure du projet backend:
/backend
├─ data/
│ ├─ movies.json
│ ├─ people.json
│ ├─ movie_people.json
│ └─ reference.json
├─ src/
│ ├─ repository.ts
│ ├─ server.ts
│ └─ types.ts
└─ package.json

Structure du projet Svelte:
/frontend
├─ src/
│ ├─ App.svelte
│ ├─ components/
│ │ ├─ MovieList.svelte
│ │ ├─ MovieDetail.svelte
│ │ └─ PersonDetail.svelte
│ └─ stores.ts
└─ package.json

npm install fastify @sinclair/typebox ajv fastify-swagger
npm install --save-dev typescript ts-node @types/node @types/ajv

pour lancer le serveur:
npx ts-node src/server.ts
