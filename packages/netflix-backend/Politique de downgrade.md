2️⃣ 🧹 Politique de downgrade intelligente

Objectif :

👉 minimiser stockage
👉 conserver expérience fluide
👉 conserver données utiles

🎯 Facteurs à considérer

1. Dernier accès

   > 90 jours → eligible
   > 180 jours → downgrade medium → basic
   > 365 jours → downgrade deep → minimal

2. Popularité
   si views > seuil → ne pas downgrader

3. Taille disque
   si stockage > seuil
   downgrader contenus les moins utilisés

4. Reconstructibilité

Certaines données sont faciles à régénérer :

✔ images
✔ credits
✔ external ids

Plus délicat :

⚠ métadonnées enrichies manuellement
⚠ annotations utilisateur

🎚 Exemple de downgrade progressif
deep → medium

supprimer images HD

garder poster original

medium → basic

supprimer casting complet

garder principaux acteurs

basic → minimal

garder :

id

titre

année

poster original

🧠 Astuce intelligente

👉 ne jamais supprimer l’original poster
👉 supprimer dérivés (thumbnails)
👉 régénérer à la demande
