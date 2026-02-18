Choses à faire:
🔹 formaliser tous les JSON Schemas proprement : OK
🔹 transformer un UC en test automatisé concret (avec Vitest ou Jest) : OK
🔹 formaliser un template standard UC pour tous les prochains : OK
🔹 transformer un UC en test automatisé concret : OK
🔹 On définit le schéma /people/{id}/movies: OK
🔹 Ou on structure le people-index.json interne proprement : OK
🔹 Ou on définit une convention globale pour tout le backend (movies, categories, jobs, etc.) : OK
🔹 formaliser le PeopleProfile final propre : OK
🔹 structurer MovieProfile avec la même logique : OK
🔹 définir une convention globale pour tous les externalIds du système : OK
🔹 ou réfléchir aux champs qui devraient être stricts vs optionnels : OK
🔹 formaliser MovieProfile avec enrichissement progressif : OK
🔹 créer un PaginatedResponse générique : OK
🔹 Worker: getTmdbMovie. Doit récupérer aussi le casting.: OK
🔹 Ajouter credits (cast/crew): OK
🔹 Ajouter productionCountries: OK

Fastify:
🔹 structurer une base Fastify complète minimale prête à coder
🔹 définir les contrats Fastify à partir de ces traitements attendus
🔹 structurer proprement les routes Fastify People

Divers:
🔹 Où mettre en place une validation automatique globale au boot ?
🔹 Ajouter versioning de schéma pour ton labo reality production
🔹 Pouvoir générer et maintenir des indexs pour la liste global des films ainsi que celle des personnes à partir des fichiers json des répertoires /data/(Movies|People)

Moteur:
🔹 Worker: Après Drag & Drop, une fois récupérer les données de TMDB, deplacer et renommer le fichier vdéo dans /data/assets/videos et si tout marche bien supprimer l'ancien de incoming et envoyer l'évenement interne 'New video added'
🔹 définir les levels d’enrichissement propres
🔹 écrire l’EnrichmentEngine minimal
🔹 définir le modèle Movie minimal vivant
🔹 écrire Housekeeper intelligent (pseudo code)
🔹 Créer un MovieRepository agnostique HTTP/File
🔹 Ajouter la notion de layer / enrich level (basic | medium | deep)
🔹 Intégrer un moteur d’events pour gérer les triggers “nouveau fichier vidéo” ou “clic utilisateur”
🔹 Mettre en place des statistiques d’usage pour downgrade automatique des données
🔹 Faire un exemple complet de pipeline fonctionnel : Nouveau fichier vidéo détecté → file-added Movie minimal créé → status = initial
🔹 Enrichissement layer basic puis medium puis deep selon accès utilisateur Stats mises à jour → downgrade si inutilisé
🔹 Appauvrissement: tenir compte des préférences ou des listes de souhaits de l'utilisateur. Ne pas le programmer ! Mais prévoir qu'il y a aussi d'autres contraintes qui modifie la valeur des poids dans la liste des données à supprimer.
🔹 Bonus : plus tard, envisager un bus d’événements central avec des middleware, qui permettrait de brancher des “observers” sur certaines catégories seulement, ou de filtrer certains events pour le labo / tests / UI.
🔹 Faire un exemple complet de pipeline fonctionnel :
---> 1 - Nouveau fichier vidéo détecté → file-added
---> 2 - Movie minimal créé → status = initial
---> 3 - Enrichissement layer basic puis medium puis deep selon accès utilisateur
---> 4 - Stats mises à jour → downgrade si inutilisé
🔹 Faire le prototype complet de ton moteur vivant pour le labo.

Events:
🔹 Evenements categorisés
🔹 dessiner le flux détaillé d’un seul événement (MovieRequested)
🔹 définir les events précis et leurs payloads TypeScript
🔹 écrire un EventBus minimal typé
🔹 définir les events TypeScript concrets

Labo:
🔹 choisir les métriques indispensables (version ultra minimaliste)
🔹 écrire StatsTracker minimal
🔹 Un pipeline de métrics/traces du backend vers le futur labo (pattern observer ?)

CLI
Qui permet de: lancer des jobs de maintenance (réindexa les json, des checks de validation, bref remettre de l'ordre), de déclenchements de traces de stats, de fonctions admin, de rentrer des movie ou acteur avec un token minimaliste (movieId, peopleId à aller chercher su tmdb ou filename, year, ou ajouter un fichier vidéo. demander un downgrade mais préciser le niveau: minimal, light, OnLastRead > ??:on efface tout ce qui n'a pas été consulté depuis n temps, de lancer des enrichissements, comme une console d'administration simplifiée et plein d'autres choses. Ce cli est un frontend du moteur. Il doit me permettre de piloter et surveiller le moteur.

<div>
	<a href="https://www.arte.tv/fr/videos/041600-000-A/l-armee-des-12-singes/?uct_country=fr" 
		title="Regarder L'Armée des 12 singes sur Arte" 
		target="_blank" 
		rel="noopener">
		<img src="https://media.themoviedb.org/t/p/original/vPZrjHe7wvALuwJEXT2kwYLi0gV.jpg" width="50" height="50">
	</a>
	<span class="wrapper free">
	</span>
</div>
