# Réflexions sur les Liaisons

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

Et pour celui la, je te donne des extraits (c'est dans le code en commentaire):
app.js:
const express = require('express')
const { getGraph } = require('./controllers/wrap-service.js')
// const { cmdAction } = require('./controllers/action-service.js')
const { getMovies, getMovie } = require('./controllers/movie-service.js')
const { getPeoples, getPeople } = require('./controllers/people-service.js')
// import { timeout } from './utils.js'

const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.get('/', (req, res) => {
const user = {
firstName: 'Tim',
lastName: 'Cook'
}

res.render('pages/index', {
user
})
})
/*
app.get(/.*cmd$/, function (req, res) {
const action = req.query.action;
const params = req.query.params;
res.send( cmdAction( action, params ) )
});
_/
Puis action-service.js:
const fs = require('fs')
const wrapper = require('wrapper')
/_
const actions = new Map()
actions['glop'] = (param) => {wrapper.setRecord(param); return wrapper.getRecord()}
actions['pas_glop'] = (param) => {wrapper.setRecord(param); return wrapper.getRecord()}
actions['exit'] = (action) => {return process.exit(0);}
\*/

function cmdAction( action, params ) {
let result = `CMD -> action: ${action}, params: ${params}`
if( actions[action] ) {
const act = actions[action]
result += ' -> ' + act(params)
}
console.log(result)
return result
}

function call_after( param ) {
/_ param = {
id: fileName,
module: moduleName,
name: fct,
content: `CALL:${moduleName}.${fct}(${getArgs(args)}) -> ${JSON.stringify(result)}`,
function: fct,
arguments: args,
result: result
} _/
if(wrapper.getRecord()) {
fs.appendFileSync('./trace.log', `fct: ${param.function}( ${param.arguments} ) -> ${param.result}\n`, 'utf8');
// console.log(param.content)
}
}

// wrapper.eventEmitter.on('call.after', call_after)

// module.exports = {cmdAction}
