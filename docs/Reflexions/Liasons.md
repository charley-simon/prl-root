# Réflexions sur les Liasons

# Types

- Synchrone/Asynchrones
- Entrée/Sorties
- Friend/Foe

rendre une communication bidirectionelle (asynchrone) à l'aide d'un observateur.
exemple avec une lettre postale: On poste une lettre pour un destinataire. Soit le facteur nous dit que la lettre est bien arrivée. Sinon, on observe la boite au lettres du destinataire, si on voit la lettre, on envoi un AR à l'expéditeur.

Voir les lymphocytes T4 avec les connecteurs/emmeteurs vs récepteurs

exemple difficile:
Ciblage d'un objet par un canon laser

- Le laser est unidirectionnel, il ne sait pas si il pointe la cible
- L'objet change d'état lorsque le laser la touche
- Il faut donc un obervateur pour indiquer si la cible est touchée ou non. Le mieux c'est qu'il puisse dire (trop à gauche, trop à droite ou haut, bas). Il faut donc transmettre l'information à l'émetteur pour qu'il corrige la visée en conséquence
- donc il faut un recepteur coté canon pour recevoir les informations de l'observateur (unidirectionel)
- l'émetteur corrige la visée et on recommence jusqu'à ce que l'observateur non dis que la cible est touchée

C'est un système à 4 composantes:

- Dans le canon: emetteur laser, recepteur pour l'observation
- La cible
- l'observateur: (comment voit-il le changement d'état ? quelle liaison avec la cible ? )
- la cible pourrait dire si elle est touchée ou non (si Foe: perte de signal = cible détruite)
- Comment déterminer l'endroit où pointe le laser et savoir la déviation par rapport à la cible ?

Une solution:

- Le canon connait le vecteur (la direction du laser)
- l'observateur détermine la position de la cible (même si elle est mobile)
- Le canon peut savoir si la position de la cible est dans la direction du laser et corriger en fonction de l'écart
- Le canon doit anticiper sur la futur position de la cible. Donc l'observateur doit nous donner non seulement la position de la cible mais sa vitesse et sa direction (déduit des changements de position). Le canon pourrait le faire aussi avec les changements de position.

Cela pourrait marcher avec un canon mobile et une cible mobile; calcul d'une trajectoire d'interception
