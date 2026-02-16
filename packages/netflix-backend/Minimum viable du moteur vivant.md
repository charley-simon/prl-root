4️⃣ ⚙️ Minimum viable du moteur vivant

Tu peux démarrer SIMPLE.

🔹 composants minimum
✅ EventBus

pub/sub simple

✅ MovieRepository

lecture/écriture films

✅ EnrichmentEngine

gère niveaux basic/medium

✅ StatsTracker

compte vues & accès

✅ Housekeeper

downgrade périodique

✅ FileWatcher (optionnel au début)
🔹 niveaux d’enrichissement minimum
initial

id

title

year

filePath

basic

overview

poster original

medium

casting

genres

rating

👉 deep plus tard.

🔹 events minimum
MovieCreated
MovieRequested
MovieViewed
EnrichmentRequested
EnrichmentCompleted
HousekeepingRequested
