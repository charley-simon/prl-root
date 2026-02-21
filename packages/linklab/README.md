# LinkLab Core

**Universal Graph Navigation Engine**

Light. Orthogonal. Composable.

---

## Installation

```bash
npm install linklab
```

---

## Quick Start

### 1. Create a graph

```typescript
import { GraphBuilder } from 'linklab'

const graph = new GraphBuilder()
  .addEntity('Users')
  .addEntity('Products')
  .connect('Users', 'Products', {
    through: 'purchases',
    weight: 5
  })
  .build()
```

### 2. Create an engine

```typescript
import { Engine } from 'linklab'

const engine = Engine.forPathfinding(graph, {
  from: 'user-123',
  to: 'product-456',
  maxPaths: 5
})
```

### 3. Run it

```typescript
const results = await engine.run()
console.log(results[0].path)
// {
//   nodes: ['user-123', 'product-456'],
//   relations: [...],
//   totalWeight: 5
// }
```

---

## API

### Factory Methods

**Pathfinding:**
```typescript
Engine.forPathfinding(graph, {
  from: 'A',
  to: 'B',
  maxPaths: 5,
  preferences: {
    minimizeTransfers: true
  }
})
```

**Scheduling:**
```typescript
Engine.forScheduling(graph, {
  stack: [{ entity: 'Movies', state: 'UNRESOLVED' }],
  actions: [
    {
      name: 'selectMovie',
      weight: 10,
      when: (stack) => stack.some(f => f.entity === 'Movies'),
      execute: async (stack, graph) => {
        // ... logic
        return updatedStack
      }
    }
  ]
})
```

**Navigation:**
```typescript
Engine.forNavigation(graph, {
  stack: [
    { entity: 'Directors', id: '2' },
    { entity: 'Movies', state: 'UNRESOLVED' }
  ]
})
```

---

## GraphBuilder

### From scratch

```typescript
const graph = new GraphBuilder()
  .addEntity('Users')
  .addEntity('Products')
  .connect('Users', 'Products', { weight: 5 })
  .build()
```

### From database (coming soon)

```typescript
const graph = await GraphBuilder.fromDatabase({
  type: 'postgres',
  connection: process.env.DATABASE_URL,
  tables: {
    users: { id: 'id', label: 'name' },
    products: { id: 'id', label: 'name' }
  },
  relations: [
    {
      from: 'users',
      to: 'products',
      through: 'purchases'
    }
  ]
})
```

### From CSV (coming soon)

```typescript
const graph = await GraphBuilder.fromCSV('employees.csv', {
  id: 'employee_id',
  parent: 'reports_to',
  label: 'name'
})
```

---

## Templates

```typescript
import { templates } from 'linklab'

// Recommendation system
const graph = templates.recommendations({
  entities: ['Users', 'Products', 'Categories']
})

// Social network
const graph = templates.social({
  includePosts: true,
  includeGroups: true
})

// Org chart
const graph = templates.orgChart({
  departments: true
})

// Transport/routing
const graph = templates.transport({
  defaultTravelTime: 2,
  includeTransfers: true
})

// Knowledge base
const graph = templates.knowledgeBase({
  includeAuthors: true
})

// Musicians/sampling
const graph = templates.musicians({
  includeGenres: true,
  includeInfluences: true
})
```

---

## Philosophy

### Light
~600 lines of core code. No dependencies.

### Orthogonal
3 independent modes (PATHFIND, NAVIGATE, SCHEDULE).
Mix and match as needed.

### Composable
Builders + Templates + Formatters.
Stack them however you want.

---

## Examples

See `/examples` for full working demos:
- NYC Subway (Art Déco PILI 1937)
- Org Chart (Futuristic)
- Musicians (Steampunk)
- Netflix (Minimalist)
- E-commerce (Synthwave)
- Knowledge Base (Cyberpunk)

---

## License

MIT

---

**"If the API doesn't fit on a post-it, think harder."**
