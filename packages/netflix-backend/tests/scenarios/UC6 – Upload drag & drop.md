🎯 Objectif
Lors du drag and drop d'un fichier vidéo dans le répertoire ./data/import-video, le watcher qui surveille ce répertoire doit:
- Parser le nom du fichier pour extraire le titre [et l'année]
- Faire une recherche sur TMDB
- Lancer un job qui:
  - Récupére toutes les informations liées au film (MovieDetail et le casting)

📥 Entrée
Fichier vidéo (multipart)

⚙️ Traitement attendu
1 - Vérifier format du fichier.
2 - Sauvegarder dans dossier /import.
3 - Générer un jobId.
4 - Créer une entrée job avec statut queued.
5 - Retourner immédiatement :
  - jobId
  - status
6 - Enregistrer métrique upload.
⚠️ Le traitement d’identification ne se fait pas ici.

📤 Sortie
Fichier enregistré, job créé
  - jobId
  - status

📏 Critères
- Upload non bloquant.
- Job créé systématiquement.
- Pas d’identification immédiate.

Lazzy Loading / Notes