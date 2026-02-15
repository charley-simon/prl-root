# Besoins

# Approcher le vite possible des conditions de production

- Machine cible
- Configuration
- Données: Jeux d'essais (qualité, volume, tordu)
- installation

# Les uses cases (c'est crucial)

- Tester en profondeur
- Tester en orthogonal
- tests uniquement métiers/fonctionels
- Ne pas utiliser de mocks ou alors ?

# les Benchs

- Benchs (temps, mémoire, I/O) approximatifs pas besoin de détails
- Traces
- Pouvoir enchainer sur une suite de jeux d'essai

# Comparateur

- Condition reproductible indispensable VM, Docker, Données strictement identiques => résultats qui peuvent être comparés
- Session de benchs/test sur référence et stockage des résultats
- Session de benchs/test sur candidat et stockage des résultats
- comparateur des résultats:
  - Iso-Fonctionnalité: Résultats identiques
  - Diffs (temps, volume, I/O)
  - ...

# Ananlyzer

- Analyze les sources du candidat => graphe
- Enrichit le graphe avec les métriques de runtime
- Analyze les résultats d'une session
- Compare les résultats entre deux sessions
- que fait on avec les résultats ?
- que fait on avec le graph ?

# Eléments de décision

- Benchs
- Conformité fonctionnelle
- Conformité aux demandes
- Sorties: traces, rapports, tableaux, schémas, graphe visuel
- Analyze architecturale
- Recherche de patterns et d'anti patterns (récursivité cachée)
- Analyze des dépendances: recherche des dépendances cachées. % de couplage
- Trouver les goulots d'étranglements (I/O ?) les fonctions les plus utilisées, les plus lourdes, etc...

# Pouvoir aussi analyzer un vieux projet

🌟 Mantra du laboratoire

Révéler, simplifier, redonner.

- Révéler ce qui se passe vraiment, sans imposer.
- Simplifier la complexité inutile, sans masquer la réalité.
- Redonner le pouvoir de décider, sans confisquer la liberté.
  ou

Révéler. Simplifier. Autonomiser.
