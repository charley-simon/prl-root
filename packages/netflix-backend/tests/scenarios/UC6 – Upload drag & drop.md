🎯 Objectif
Permettre au backend de recevoir des fichiers vidéo ou métadonnées via drag & drop et les intégrer dans le système (mocké pour le labo reality-production).

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
