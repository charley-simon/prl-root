🧰 Qu’est-ce qu’un Helper ?

Un helper est une petite fonction utilitaire qui :

✅ évite de répéter du code
✅ centralise une logique simple
✅ améliore la lisibilité
✅ évite les bugs subtils
✅ rend le code testable

👉 Ce n’est pas une couche métier
👉 Ce n’est pas un service
👉 Ce n’est pas un modèle

C’est juste un outil.

🔎 Exemple concret

Sans helper :

const prefs = user.preferences ?? {
favoriteCategories: [],
sortBy: 'rating',
sortOrder: 'desc'
}

Tu vas répéter ça partout.

➡️ duplication
➡️ incohérences futures
➡️ bugs garantis

Avec helper :

const prefs = normalizePreferences(user.preferences)

👉 clair
👉 centralisé
👉 robuste

🧠 Dans TON cas : pourquoi utile ?

Les préférences peuvent être :

absentes

partielles

invalides

anciennes versions

mal générées

Le helper garantit :

✔ une structure stable
✔ des valeurs par défaut
✔ aucun crash
✔ un comportement déterministe

📦 Où placer les helpers ?

Bonne question 👇

✅ Option recommandée
src/
helpers/
preferences.helper.ts

👉 logique transverse
👉 pas métier pur
👉 réutilisable

📦 Alternative possible

Si spécifique au domaine user :

src/services/user/preferences.helper.ts

👉 acceptable
👉 mais moins réutilisable

❌ À éviter

❌ dans userService directement
❌ dans schema
❌ dans controller

✍️ Helper complet
📄 src/helpers/preferences.helper.ts
import { UserPreferences } from '../schemas/users/user.schema'

export function normalizePreferences(
prefs?: Partial<UserPreferences>
): UserPreferences {
return {
favoriteCategories: prefs?.favoriteCategories ?? [],
minYear: prefs?.minYear,
sortBy: prefs?.sortBy ?? 'rating',
sortOrder: prefs?.sortOrder ?? 'desc'
}
}

🧪 Comment l’utiliser
Dans userService
import { normalizePreferences } from '../../helpers/preferences.helper'

getPreferences(userId: number): UserPreferences {
const user = this.getUserById(userId)
return normalizePreferences(user.preferences)
}

Dans UC5
const prefs = normalizePreferences(user.preferences)

if (prefs.minYear) {
movies = movies.filter(m => m.year >= prefs.minYear)
}

🧪 Bonus : helper = facile à tester
📄 preferences.helper.test.ts
it('should apply defaults', () => {
const prefs = normalizePreferences()

expect(prefs.sortBy).toBe('rating')
})

👉 ultra simple
👉 ultra robuste

⚖️ Helper vs Service vs Util
Type Usage
Helper petite logique pure
Service logique métier
Repository accès données
Util bas niveau (dates, hash…)
🧠 Règle simple

👉 Si la fonction :

✔ ne dépend pas d’un service
✔ ne dépend pas d’I/O
✔ est pure
✔ peut être réutilisée

➡️ c’est un helper

🧠 Dans le monde réel

Tu en verras partout :

normalizeUser()

formatDate()

buildCacheKey()

sanitizeInput()

mapApiResponse()

mergeConfig()

Les bons systèmes en ont beaucoup 😄
