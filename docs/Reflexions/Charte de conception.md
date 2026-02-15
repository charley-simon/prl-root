Charte pratique de conception de systèmes compréhensibles et utilisables
1. Priorité au sens sur l’abstraction

Les entités seules ne racontent rien : c’est le réseau des liaisons qui donne le sens.

Observer, mesurer et comprendre les liaisons est souvent plus critique que de définir des classes ou des services.

Une abstraction qui masque les conséquences est toxique : si on ne peut pas calculer/comprendre/voir les effets, on fait appel à la magie, pas à l’ingénierie.

2. Use cases : base de la compréhension

Les use cases réels (observés en production) sont plus fiables que ceux imaginés à la conception.

Le 80/20 s’applique : se concentrer sur les chemins les plus fréquents et les plus critiques.

Les use cases émergents révèlent :

Les priorités métier

Les flux essentiels

Les liens critiques

Les use cases détournés ou non désirés doivent être identifiés, triés et analysés (signaux d’incohérence ou d’opportunités).

3. Flux et pile sémantique

Observer le flux réel des données et des appels permet de comprendre :
- La profondeur et la complexité des liaisons
- La charge réelle sur les ressources
- Les goulots critiques et les cycles
- La pile sémantique est un outil pour relier les entités au sens métier, en faisant émerger la valeur réelle de l’usage.

4. Simplification et hiérarchie

Un système complexe doit être zoomable et pliable : la représentation doit pouvoir cacher ou révéler la complexité selon la question posée.
Des vues multiples sont nécessaires :
- Vue flux (chemins critiques, volumes)
- Vue topologique (centralité, cycles, profondeur)
- Vue cohérence/incohérence
- Vue critique/non critique
- Vue comparaison/simulation

Chaque vue est un filtre cognitif, pas un inventaire exhaustif.

5. Optimiser les chemins critiques

Le chemin d’usage le plus fréquent doit être le plus court et le plus fluide.
Exemple classique : minimiser les déplacements physiques ou cognitifs, raccourcir la séquence des actions répétées.
Toute friction ou liaison inutile est un coût réel (temps, fatigue, erreurs).

6. Transparence et discussion du coût

Exposer les coûts réels aux parties prenantes :
- Coût technique (développement, maintenance)
- Coût cognitif (pour l’utilisateur et les développeurs)
- Risques (fragilité, dette technique)
- Proposer des compromis intelligibles : par exemple, 80% des besoins pour 20% du coût, plutôt que “tout pour un prix indéterminé”.

7. Confrontation précoce à la réalité

Tester et observer le système dès que possible en conditions réelles :
- Évite la dette cognitive et technique
- Vérifie les hypothèses de conception
- Met en évidence les usages non anticipés

Le feedback de l’usage réel guide les ajustements et la priorisation.

8. Décider sur le réel, pas sur l’intention

Les décisions doivent être basées sur :
- Observations réelles
- Mesures objectives
- Use cases dominants

L’écart intention / réalité est normal :
- Les contournements ou détournements sont des messages du système
- Certains usages imaginés deviennent obsolètes

L’architecture doit s’adapter aux usages réels, pas aux hypothèses initiales.

9. Mesurer et simuler

Les métriques sont nombreuses, mais il faut :
- Les découper, classer et hiérarchiser
- Confronter les alternatives
- Faire des simulations et des comparaisons sur des sous-graphes représentatifs

L’objectif : redonner du sens à la complexité et guider les décisions.

10. Philosophie finale

Un système ne doit pas pouvoir tout faire.
Il doit faire bien ce qui est essentiel, en maximisant la valeur et minimisant le coût et la complexité inutile.
L’architecture est un instrument de raisonnement, pas un catalogue de fonctionnalités.
La complexité n’est pas le mal, l’opacité l’est.

“Un bon système ne rend pas tout possible, il rend l’essentiel rapide, fluide et évident. Toute décision doit laisser des traces compréhensibles. Là où ce n’est pas possible, c’est de la magie.”
