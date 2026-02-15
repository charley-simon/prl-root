🎯 Objectif
Identifier un film via TMDB.

📥 Entrée
Job queued avec nom de fichier.

⚙️ Traitement attendu
1 - Lire le nom du fichier.
2 - Extraire titre probable.
3 - Appeler service TMDB (ou mock).
4 - Sélectionner meilleure correspondance.
5 - Mettre à jour le film :
  - tmdbId
  - title normalisé
6 - Mettre job en completed ou failed.
7 - Enregistrer métrique :
  - temps d’identification
  - score confiance

📤 Sortie
Film ID, correspondances TMDB

📏 Critères
- Job passe de queued → completed ou failed
- Résultat déterministe
- Temps mesuré

Lazzy Loading / Notes