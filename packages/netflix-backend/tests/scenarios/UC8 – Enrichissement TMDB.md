🎯 Objectif
Enrichichir les méta-données d'un movie ou d'un people à l'aide de TMDB

📥 Entrée
Film avec titre validé.

⚙️ Traitement attendu
1 - Appeler service TMDB simplifié.
2 - Extraire description.
3 - Nettoyer texte (supprimer balises, normaliser).
4 - Sauvegarder description enrichie.
5 - Marquer film comme enriched.
6 - Enregistrer métrique durée.

📤 Sortie
- Métadonnées enrichies
  - propriété (movie/people).tmdbId renseignée
  - propriété (movie/people).wikiDescription renseignée

📏 Critères
- Pas d’échec global si TMDB échoue.
- Enrichissement idempotent.
- Temps mesuré.

Lazzy Loading / Notes
- Lazy loading interne possible pour enrichissement progressif (optionnel)