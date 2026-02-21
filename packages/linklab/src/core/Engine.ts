// core/Engine.ts

import type {
  Graph,
  Frame,
  ActionDefinition,
  EngineMode,
  EngineConfig,
  EngineStepResult,
  PathQuery
} from '../types'

import { PathFinder } from './PathFinder'
import { Resolver } from './Resolver'
import { Scheduler } from './Scheduler'

/**
 * LinkLab Engine - Universal graph navigation and scheduling
 *
 * @example
 * ```typescript
 * // Pathfinding
 * const engine = Engine.forPathfinding(graph, {
 *   from: 'Station-A',
 *   to: 'Station-B',
 *   maxPaths: 5
 * })
 *
 * // Scheduling
 * const engine = Engine.forScheduling(graph, {
 *   stack: initialStack,
 *   actions: actionDefinitions
 * })
 *
 * // Navigation
 * const engine = Engine.forNavigation(graph, {
 *   stack: initialStack
 * })
 * ```
 */
export class Engine {
  private mode: EngineMode
  private graph: Graph
  private state: any
  private pathFinder?: PathFinder
  private resolver?: Resolver
  private scheduler?: Scheduler
  private config: EngineConfig

  constructor(config: EngineConfig) {
    this.config = config
    this.mode = config.mode
    this.graph = config.graph
    this.state = {}

    // Initialize components based on mode
    switch (this.mode) {
      case 'PATHFIND':
        this.pathFinder = new PathFinder(this.graph)
        break

      case 'NAVIGATE':
        this.resolver = new Resolver(this.graph)
        this.state = { stack: config.initialStack || [] }
        break

      case 'SCHEDULE':
        this.scheduler = new Scheduler(config.actions || [], this.graph)
        break
    }
  }

  // ==================== FACTORY METHODS ====================

  /**
   * Create an engine for pathfinding
   *
   * @example
   * ```typescript
   * const engine = Engine.forPathfinding(graph, {
   *   from: 'user-123',
   *   to: 'product-456',
   *   maxPaths: 5,
   *   preferences: {
   *     minimizeTransfers: true
   *   }
   * })
   *
   * const results = await engine.run()
   * console.log(results[0].path)
   * ```
   */
  static forPathfinding(graph: Graph, query: PathQuery): Engine {
    return new Engine({
      mode: 'PATHFIND',
      graph,
      pathQuery: query
    })
  }

  /**
   * Create an engine for scheduling actions
   *
   * @example
   * ```typescript
   * const engine = Engine.forScheduling(graph, {
   *   stack: [{ entity: 'Movies', state: 'UNRESOLVED' }],
   *   actions: [
   *     {
   *       name: 'selectMovie',
   *       weight: 10,
   *       when: (stack) => stack.some(f => f.entity === 'Movies'),
   *       execute: async (stack, graph) => {
   *         // ... action logic
   *         return updatedStack
   *       }
   *     }
   *   ]
   * })
   *
   * const results = await engine.run(20)
   * ```
   */
  static forScheduling(
    graph: Graph,
    options: {
      stack: Frame[]
      actions: ActionDefinition[]
    }
  ): Engine {
    return new Engine({
      mode: 'SCHEDULE',
      graph,
      initialStack: options.stack,
      actions: options.actions
    })
  }

  /**
   * Create an engine for semantic navigation
   *
   * @example
   * ```typescript
   * const engine = Engine.forNavigation(graph, {
   *   stack: [
   *     { entity: 'Directors', id: '2' },
   *     { entity: 'Movies', state: 'UNRESOLVED' }
   *   ]
   * })
   *
   * const results = await engine.run(10)
   * ```
   */
  static forNavigation(
    graph: Graph,
    options: {
      stack: Frame[]
    }
  ): Engine {
    return new Engine({
      mode: 'NAVIGATE',
      graph,
      initialStack: options.stack
    })
  }

  // ==================== RUN ====================

  /**
   * Run the engine
   *
   * @param maxSteps - Maximum number of steps (for SCHEDULE/NAVIGATE modes)
   * @returns Array of step results
   */
  async run(maxSteps: number = 1): Promise<EngineStepResult[]> {
    switch (this.mode) {
      case 'PATHFIND':
        return this.runPathfind()

      case 'NAVIGATE':
        return this.runNavigate(maxSteps)

      case 'SCHEDULE':
        return this.runSchedule(maxSteps)

      default:
        throw new Error(`Unknown mode: ${this.mode}`)
    }
  }

  // ==================== PRIVATE METHODS ====================

  private async runPathfind(): Promise<EngineStepResult[]> {
    if (!this.pathFinder || !this.config.pathQuery) {
      throw new Error('PathFinder mode requires pathQuery')
    }

    const { from, to, maxPaths = 5 } = this.config.pathQuery
    const paths = this.pathFinder.findAll(from, to, maxPaths)

    if (paths.length === 0) {
      return [
        {
          time: 0,
          mode: 'PATHFIND',
          result: { type: 'FAIL', reason: 'No path found' }
        }
      ]
    }

    // Return best path
    const bestPath = paths[0]
    this.state = { ...this.state, currentPath: bestPath }

    return [
      {
        time: 0,
        mode: 'PATHFIND',
        path: bestPath,
        result: {
          type: 'SUCCESS',
          data: { allPaths: paths }
        }
      }
    ]
  }

  private async runNavigate(maxSteps: number): Promise<EngineStepResult[]> {
    if (!this.resolver) {
      throw new Error('Navigate mode requires Resolver')
    }

    const results: EngineStepResult[] = []
    let currentStack = this.state.stack

    for (let t = 0; t < maxSteps; t++) {
      const resolved = currentStack.filter((f: Frame) => f.state === 'RESOLVED').length
      const unresolved = currentStack.filter((f: Frame) => f.state === 'UNRESOLVED').length

      if (unresolved === 0) {
        results.push({
          time: t,
          mode: 'NAVIGATE',
          phase: 'COMPLETE',
          resolvedCount: resolved,
          unresolvedCount: unresolved,
          result: { type: 'SUCCESS' }
        })
        break
      }

      // Resolve next frame
      currentStack = await this.resolver.resolve(currentStack)

      results.push({
        time: t,
        mode: 'NAVIGATE',
        phase: 'RESOLVE',
        resolvedCount: resolved,
        unresolvedCount: unresolved
      })
    }

    this.state.stack = currentStack
    return results
  }

  private async runSchedule(maxSteps: number): Promise<EngineStepResult[]> {
    if (!this.scheduler) {
      throw new Error('Schedule mode requires Scheduler')
    }

    const results: EngineStepResult[] = []
    const currentStack = this.state.stack

    for (let t = 0; t < maxSteps; t++) {
      const stepResult = await this.scheduler.step(t, currentStack)

      if (!stepResult) {
        results.push({
          time: t,
          mode: 'SCHEDULE',
          phase: 'COMPLETE',
          result: { type: 'SUCCESS', reason: 'No more actions' }
        })
        break
      }

      results.push({
        time: t,
        mode: 'SCHEDULE',
        phase: 'EXECUTE',
        selectedAction: stepResult.selectedAction,
        result: stepResult.result
      })
    }

    return results
  }

  // ==================== GETTERS ====================

  getState() {
    return this.state
  }

  getGraph() {
    return this.graph
  }

  getMode() {
    return this.mode
  }
}
