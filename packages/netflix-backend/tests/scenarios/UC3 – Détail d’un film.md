🎯 Objectif
Retourner les informations complètes d'un film:
- Métadonnées film 
- enrichissement TMDB
- enrichissement IMDB

📥 Entrée
GET /movies/:id

⚙️ Traitement attendu
1 - Vérifier que l’ID existe dans l’index.
2 - Charger le fichier de données complet du film.
3 - Si des métadonnées enrichies existent (Wikipedia, TMDB), les fusionner.
4 - Si enrichissement manquant :
  - retourner les données disponibles
  - ne pas échouer
5 - Normaliser la structure finale :
  - description prioritaire : Wikipedia
  - fallback : description locale
6 - Retourner l’objet complet.
7 - Enregistrer métrique de durée.

📤 Sortie
Métadonnées film + enrichissement TMDB

📏 Critères
- Aucune exception si enrichissement absent.
- Données cohérentes.
- Temps mesuré.

Lazzy Loading / Notes
- Charger les données principales immédiatement, enrichissement lazy via TMDB/Wikipedia en différé