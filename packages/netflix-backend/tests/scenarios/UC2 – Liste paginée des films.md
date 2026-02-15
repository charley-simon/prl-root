🎯 Objectif
Retourner une liste paginée de films disponibles.

📥 Entrée
GET /movies?page=1&limit=20

⚙️ Traitement attendu
1 - Lire les paramètres page et limit.
2 - Vérifier qu’ils respectent les bornes autorisées.
3 - Charger l’index movies-list.json.
4 - Calculer :
  - offset = (page - 1) × limit
5 - Extraire le sous-ensemble correspondant.
6 - Ne retourner que les champs :
  - id
  - title
  - year
  - poster
7 - Calculer total = nombre total de films.
8 - Retourner la structure paginée.
9 - Enregistrer la métrique :
  - durée de traitement
  - nombre d’éléments retournés

📤 Sortie
Liste de films avec ID, titre, image

📏 Critères
- Pas de duplication.
- Pagination cohérente.
- Temps de réponse mesuré.
- Total exact.

Lazzy Loading / Notes
- Charger initialement un batch limité (page 1), puis charger page suivante à la demande. Mesurer latence batch initiale et batch suivant