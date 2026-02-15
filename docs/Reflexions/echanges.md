Suivi avec pile:
2 box (une avec liste et une avec fiche)
Etat de départ:

- Liste (Table: -- ) Affichage - 'Veuillez sélectionner une entrée'
- Fiche (Table:--, id: --) Affichage: 'Veuillez sélectionner un élément dans la liste'

1/ Action System: On choisi de démarrer avec la vue des films par défaut.
stack.push({table: 'Movies', id: --, MovieList, MovieDetail }) => stack: 0
Réactivité svelte (onStackChange ou équivalent ?):
la liste va lire la table courante: { this.table, , this.listeToUse } = stack.getCurrent()
Donc elle peut récupérer/afficher des données car la table est renseignée avec this.listeToUse
la fiche va lire la table courante: { this.table, this.id, , this.ficheToUse } = stack.getCurrent()

- si this.id est null affichage 'Veuillez sélectionner un élément dans la liste'
- si this.table et this.id renseignée alors on peut récupérer/afficher les données avec this.ficheToUse

2/ Action Utilisateur: L'utilisateur clic sur une vignette de film userSelection = {table: 'Movies', id: 1, label: 'Le parrain'} - stack.updateId( userSelection.id ) - la pile va renseigner {table,id} de la liste et de la fiche avec userSelection et comme table et id sont renseignés alors elles peuvent récupérer/afficher les données.

Que penses tu de la logique suivante ? :
Logique lorsque modification de pile avec une stackElem ex:
1/ Avec une arborescence visible :

- on définit la vue 'Movies' comme la vue par défaut: stackElem = {table: 'Movies', id: --, label: -- }
- clic sur une vignette de la liste des films : {table: 'Movies', id: 1, label: 'Le parrain'}
- clic sur arborescence sous noeud '/Actors' ou {table: 'Actors', id: --, label: -- }
- clic sur une vignette de la liste des acteurs d'un film: {table: 'Actors', id: 2, label: 'Al Pacino'}:
  2/ Sans vue arborescente:
- on définit la vue 'Movies' comme la vue par défaut: stackElem = {table: 'Movies', id: --, label: -- }
- clic sur une vignette de la liste des films : {table: 'Movies', id: 1, label: 'Le parrain'}
- clic sur un acteur dans la liste des acteurs de la fiche MovieDetail {table:'Actors', id: 2, label: 'Al Pacino'}

{ curTable, curId, curListe, curFiche } = stack.getCurrent()
if( curTable == stackElem.table ) {
// On passe de /Movies à /Movies(1)
// Seul l'enregistrement courant change (même objet liste et fiche)
stack.updateId( stackElem.id )
} else {
// On change de table donc l'objet liste va changer et l'objet fiche aussi
// ex: liste.vue = MovieGrid => ActorsGrid et fiche.vue = MovieDetail => PersonDetail
if( stack.contain( stackElem.table) ) {
// Problème on est face à la situation suivante
// /Movies/Actors/Movies !
// Soit: la filmographie d'Al Pacino' qui joue dans 'Le parrain'
// la dernière table 'Movies' n'est pas affectée pas la sélection précédente de 'Movies'
// La filmographie d'Al Pacino ne dépends pas du film le parrain. Elle est indépendante.
// Lorsqu'on push une table déjà présente dans la pile, la précédente n'est plus discriminante
// 2 Solutions:
// 1 - On laisse, même si on peut avoir /Movies(1)/Actoirs(2)/Movies(4)/Directors(6)/Movies
// C'est pas très cohérent, cela encombre la pile et le contexte utilisateur devient illisible/n'a pas de sens
// 2 - On corrige la pile; on repart juste après la précédente occurence de la table qui est redondante.
// Donc on ne garde que ce qui est discriminant (La filmographie d'Al Pacino. Le fait que l'on vienne de 'Le Parrain', n'est pas discriminant):
// /Movies(1)/Actors(2)/Movies devient Actors(2)/Movies. C'est comme si l'utilisateur avait changer de branche dans l'arborescence.
stack.shift( {table: stackElem.table}) // Il faut glisser le contenu de la pile (de un étage ? Jusqu'a ce que les tables: 'Movies' disparaissent)
} else {
stack.push( stackElem )
// On était /Movies(1) on devient /Movies/Actors par exemple
}
}

J'aimerai définir deux sortes de scénarios utilisateurs comme test, il faut rendre ce qui suit plus long:
1/ Avec une arborescence visible :

- on définit la vue 'Movies' comme la vue par défaut: stackElem = {anchor: /, table: 'Movies', id: --, label: -- }
- clic sur une vignette de la liste des films : {anchor: ./, table: 'Movies', id: 1, label: 'Le parrain'}
- clic sur arborescence sous noeud '/Actors' ou {anchor: /Movies, table: 'Actors', id: --, label: -- }
- clic sur une vignette de la liste des acteurs d'un film: {anchor: /Movies, table: 'Actors', id: 2, label: 'Al Pacino'}
- On descend l'arborescence...
- On remonte de niveau avec des 'clics'
- On redescend l'arborescence dans une autre sous branches...
- On remonte de plusieurs niveaux en cliquant sur un autre noeud dans la branche active
  2/ Sans vue arborescente:
- on définit la vue 'Movies' comme la vue par défaut: stackElem = {anchor: /, table: 'Movies', id: --, label: -- }
- clic sur une vignette de la liste des films : {anchor: ./, table: 'Movies', id: 1, label: 'Le parrain'}
- clic sur un acteur dans la liste des acteurs de la fiche MovieDetail {anchor: /Movies, table:'Actors', id: 2, label: 'Al Pacino'}
- On descend l'arborescence...
- On remonte de niveau avec des 'précédents'
- On redescend l'arborescence dans une autre sous branches...
- On remonte de plusieurs niveaux à l'aide de breadcrump
  Avec un test de conformité de la pile avec le résultat attendu
  Affiner la notion d'anchor
