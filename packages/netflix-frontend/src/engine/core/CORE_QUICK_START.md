# 🚀 LinkLab Core - Quick Start Guide

## 📦 Ce que vous avez

**LinkLab Core finalisé** avec :

- ✅ Factory methods (`Engine.forPathfinding`, etc.)
- ✅ GraphBuilder (manuel, fromDatabase, fromCSV, fromJSON)
- ✅ Templates (recommendations, social, orgChart, transport, musicians, knowledgeBase)
- ✅ Types TypeScript complets
- ✅ Exemples d'utilisation

---

## 📁 Structure

```
linklab-core/
├── core/
│   └── Engine.ts              # Engine avec factory methods
├── builders/
│   └── GraphBuilder.ts        # Construction de graphs
├── templates/
│   └── index.ts               # Templates pré-configurés
├── types/
│   └── index.ts               # Types TypeScript
├── examples/
│   └── usage-example.ts       # Exemples complets
├── index.ts                   # Point d'entrée principal
├── README.md                  # Documentation
├── package.json
└── tsconfig.json
```

---

## 🎯 API finale

### Factory Methods (Simple & Clair)

```typescript
// Pathfinding
const engine = Engine.forPathfinding(graph, {
  from: 'A',
  to: 'B',
  maxPaths: 5
})

// Scheduling
const engine = Engine.forScheduling(graph, {
  stack: [...],
  actions: [...]
})

// Navigation
const engine = Engine.forNavigation(graph, {
  stack: [...]
})
```

### GraphBuilder

```typescript
// Manuel
const graph = new GraphBuilder()
  .addEntity('Users')
  .connect('Users', 'Products', { weight: 5 })
  .build()

// Depuis DB (à implémenter)
const graph = await GraphBuilder.fromDatabase({...})

// Depuis CSV (à implémenter)
const graph = await GraphBuilder.fromCSV('file.csv', {...})
```

### Templates

```typescript
import { templates } from 'linklab'

const graph = templates.recommendations({...})
const graph = templates.social({...})
const graph = templates.orgChart({...})
const graph = templates.transport({...})
const graph = templates.musicians({...})
const graph = templates.knowledgeBase({...})
```

---

## ✅ Ce qui est fait

1. **Engine avec factory methods** ✅
   - `Engine.forPathfinding()`
   - `Engine.forScheduling()`
   - `Engine.forNavigation()`

2. **GraphBuilder** ✅
   - Instance methods (`.addEntity()`, `.connect()`)
   - Factory methods (signatures définies)
   - DataGraphBuilder (pour données en mémoire)

3. **Templates** ✅
   - `recommendations`
   - `social`
   - `orgChart`
   - `transport`
   - `musicians`
   - `knowledgeBase`

4. **Types TypeScript** ✅
   - Tous les types définis
   - Exports propres

5. **Documentation** ✅
   - README complet
   - Exemples d'usage
   - JSDoc sur les méthodes

---

## 🔧 Ce qui reste à implémenter

### Builders spécialisés

Les signatures sont définies mais l'implémentation manque :

1. **DatabaseGraphBuilder**
   - PostgreSQL
   - MySQL
   - MongoDB

2. **CSVGraphBuilder**
   - Utiliser Papa Parse

3. **JSONGraphBuilder**
   - Parser JSON custom

**Note :** Ces builders peuvent être implémentés progressivement.
L'API est stable et prête.

---

## 🎯 Prochaines étapes

### Option A : Implémenter les builders

```
1. CSVGraphBuilder (le plus simple)
   → Utilise Papa Parse
   → Parse le CSV
   → Construit le graph

2. JSONGraphBuilder (simple aussi)
   → Parse le JSON
   → Map aux relations

3. DatabaseGraphBuilder (plus complexe)
   → Connecter à la DB
   → Query les tables
   → Générer les relations
```

### Option B : Créer les exemples

```
1. Musicians Knowledge Graph
   → Dataset de sampling
   → UI Steampunk
   → Pathfinding musical

2. NYC Subway (finir PILI)
3. Netflix (minimaliste)
4. Org Chart (futuriste)
```

---

## 📊 Utilisation immédiate

Vous pouvez déjà utiliser le core pour :

1. **Créer des graphs manuellement**

   ```typescript
   const graph = new GraphBuilder().addEntity('A').connect('A', 'B', { weight: 5 }).build()
   ```

2. **Utiliser les templates**

   ```typescript
   const graph = templates.musicians({ includeGenres: true })
   ```

3. **Faire du pathfinding**
   ```typescript
   const engine = Engine.forPathfinding(graph, {
     from: 'artist-will-smith',
     to: 'artist-manu-dibango'
   })
   const results = await engine.run()
   ```

---

## 🎨 L'API tient sur un post-it ✅

```
Engine.forPathfinding(graph, {from, to})
Engine.forScheduling(graph, {stack, actions})
Engine.forNavigation(graph, {stack})

new GraphBuilder()
  .addEntity('X')
  .connect('X', 'Y', {weight})
  .build()

templates.musicians({...})
templates.social({...})
templates.orgChart({...})
```

**Simple. Clair. Orthogonal.** ✨

---

## 💚 Prêt pour la suite !

Le core est **finalisé et utilisable**.

On peut maintenant :

1. Implémenter les builders spécialisés
2. Créer les exemples visuels
3. Écrire la documentation complète

**Vous choisissez la priorité !** 🎯
