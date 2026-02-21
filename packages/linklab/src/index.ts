// packages/linklab/src/index.ts

/**
 * LinkLab - Universal Graph Navigation Engine
 *
 * Light. Orthogonal. Composable.
 *
 * @example
 * ```typescript
 * import { Engine, GraphBuilder, templates } from 'linklab'
 *
 * // Create a graph
 * const graph = new GraphBuilder()
 *   .addEntity('Users')
 *   .addEntity('Products')
 *   .connect('Users', 'Products', { weight: 5 })
 *   .build()
 *
 * // Or use a template
 * const graph = templates.recommendations({
 *   entities: ['Users', 'Products']
 * })
 *
 * // Create an engine for pathfinding
 * const engine = Engine.forPathfinding(graph, {
 *   from: 'user-123',
 *   to: 'product-456'
 * })
 *
 * // Run it
 * const results = await engine.run()
 * console.log(results[0].path)
 * ```
 */

// Core
export { Engine } from './core/Engine'
export { PathFinder } from './core/PathFinder'
export { Resolver } from './core/Resolver'
export { Scheduler } from './core/Scheduler'
export { AdaptiveGraph } from './core/Graph'

// Algorithms
export { findPath } from './algorithms/findPath'
export { findAllPaths } from './algorithms/findAllPaths'

// Builders
export { GraphBuilder } from './builders/GraphBuilder'

// Templates
export { templates } from './templates'

// Types
export type {
  Graph,
  Relation,
  RelationMetadata,
  GraphMetadata,
  Filter,
  Frame,
  Path,
  EngineMode,
  PathQuery,
  PathPreferences,
  ActionDefinition,
  EngineConfig,
  EngineStepResult
} from './types'

export type { DatabaseConfig, TableConfig, CSVConfig, JSONConfig } from './builders/GraphBuilder'

export type {
  RecommendationConfig,
  SocialConfig,
  OrgChartConfig,
  TransportConfig,
  KnowledgeConfig,
  MusiciansConfig
} from './templates'
