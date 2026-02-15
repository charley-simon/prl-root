## Qualité Logicel

# 1 - Qu'est ce que la qualité logiciel ?

Dans le cadre d'un MVP ou MVA, il est indispensable d'analyzer et de choisir une architecture ou une solution sur des critères objectifs et mesurables en situation proche du réel.
Ajourd'hui, ce qui s'approche de cette définition c'est les QAR (Quality Attribute Requirements)

- https://www.infoq.com/articles/what-software-architecture/
- https://www.infoq.com/articles/minimum-viable-architecture/

# 2 - Les qualités

- https://www.scopemaster.com/fr/blog/exigences-qualite-attributs/

Exemples:

- Concurrence — relative au nombre d'utilisateurs, de capteurs et d'autres appareils simultanés qui créent des événements auxquels le produit doit répondre.
- Débit — relatif au volume de transactions ou de données que le produit doit être capable de traiter sur une période de temps définie.
- Latence et réactivité — relatives à la rapidité avec laquelle le produit doit répondre aux événements.
- Évolutivité — relative à la capacité d'un système à gérer une charge de travail accrue en augmentant le coût du système, généralement selon une relation quasi linéaire.
- La persistance concerne le débit et la structure (ou l'absence de structure) des données que le produit doit stocker et récupérer. Elle inclut souvent des choix relatifs aux différentes technologies de stockage de données (par exemple, SGBD SQL, SGBD NoSQL, etc.).
- Sécurité — relative à la manière dont le produit se protège contre toute utilisation ou accès non autorisé aux données du produit, en garantissant la confidentialité, l'intégrité et la disponibilité.
- Surveillance — relative à la manière dont le produit sera instrumenté afin que les personnes qui le prennent en charge puissent comprendre quand il commence à ne plus répondre aux exigences de qualité et prévenir les problèmes critiques du système.
- Plateforme — relative à la manière dont le produit répondra aux exigences de qualité et d’acceptation (QAR) liées aux contraintes des ressources système telles que la mémoire, le stockage, la signalisation d’événements, etc. Par exemple, les produits en temps réel et embarqués (tels qu’une montre numérique ou un système de freinage automatique) ont des contraintes très différentes de celles des systèmes d’information basés sur le cloud.
- Interface utilisateur — relative aux décisions concernant la communication du produit avec les utilisateurs ; par exemple, les interfaces de réalité virtuelle ont des exigences qualité (QAR) très différentes de celles des interfaces graphiques 2D, qui elles-mêmes diffèrent sensiblement de celles des interfaces en ligne de commande. Ces décisions peuvent avoir une incidence sur d’autres QAR mentionnées précédemment. (Interfaces graphiques, réalité virtuelle, ligne de commande ou autres types d’interfaces.)

voir

- QAR - https://clickup.com/p/templates/qbr-planning/quarterly-architecture-review-qar-template-for-software-architecture-teams
- SMART - https://www.manager-go.com/management/dossiers-methodes/smart
- KPI - https://www.manager-go.com/finance/glossaire/key-performance-indicator
- IIBA-BABOK

# 3 - Mesurables/Interprétables

- Métrics (Mesures, Valeur)
- KPI (Valeur cible)

# 4 - Testables

- Résultats attendus

# 5 - Comparables

- Diff( resultA, resultB )

# 6 - Automatisables

- analyzeQuality( scenario )

# 7 - Expliquables

- explain( results )

# 8 - Qualités pouvant être décrites en DSL et interprétables

- scénarios en .json ou .yaml

# 9 - Types d'indicateurs

- Les exigences fonctionnelles
- Les exigences relatives aux Attributs de Qualité (QAR)
- Les contraintes

# 9 - Qualités retenues pour LinkLab

- Quels indicateurs de qualités sont pertinents
  Malheureusement cela dépends beaucoup des logiciels à analyser. Suivant le type de logiciel, les indicateurs retenus seront différents.
  Néanmoins, il nous faut en choisir quelques uns qui soient pertinents dans la plus part des circonstaces. 80/20
- C'est pourquoi, il faut que les indicateurs retenus sur un projet puissent être sélectionnés parmis une liste, dans des paramètres de configurations.
- L'idéal, serait que chaque indicateur puisse être décrit avec des metrics et une formule mathématique. Si cela pouvait être exprimé dans un DSL, nous pourrions avoir un catalogue d'indicateurs qui s'enrichirait.
