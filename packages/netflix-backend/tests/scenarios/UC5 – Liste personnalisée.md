🎯 Objectif
Liste personnalisée

📥 Entrée
GET /users/:id/movies

⚙️ Traitement attendu
1 - Charger préférences utilisateur.
2 - Charger index films.
3 - Appliquer filtre :
  - genres favoris
  - année minimale
4 - Trier selon règle définie.
5 - Retourner liste filtrée.
6 - Enregistrer métrique durée + nombre résultats.

📤 Sortie
Liste de films filtrée ou triée selon utilisateur

📏 Critères
- Variation selon utilisateur.
- Déterminisme.
- Temps mesuré.

Lazzy Loading / Notes
- Lazy load : afficher un sous-ensemble initial, compléter sur demande