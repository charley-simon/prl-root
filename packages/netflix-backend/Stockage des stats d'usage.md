3️⃣ 📊 Stockage des stats d’usage

Tu veux quelque chose :

✔ simple
✔ rapide
✔ exploitable

Option A — JSON append-only (simple & labo friendly)
usage-events.log
{ type:"MovieViewed", movieId:550, ts:... }
{ type:"PlaybackStarted", movieId:550 }

✔ historique complet
✔ rejouable
✔ parfait pour analyse

👉 idéal pour ton labo.

Option B — table stats agrégées
movie_stats.json
{
"550": {
"views": 12,
"lastAccess": 1739920200,
"popularity": 0.87
}
}

✔ rapide
✔ facile à lire

Option C — hybride (recommandé)

✔ events log (analyse labo)
✔ stats agrégées (runtime rapide)

👉 exactement ce que font les gros systèmes.
