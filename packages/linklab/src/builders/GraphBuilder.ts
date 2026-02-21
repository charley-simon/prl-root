// builders/GraphBuilder.ts

import type { Graph, Relation } from '..'

/**
 * GraphBuilder - Construct graphs from various data sources
 *
 * @example
 * ```typescript
 * // From simple data
 * const graph = new GraphBuilder()
 *   .addEntity('Users')
 *   .addEntity('Products')
 *   .connect('Users', 'Products', {
 *     through: 'purchases',
 *     weight: 5
 *   })
 *   .build()
 *
 * // From database
 * const graph = await GraphBuilder.fromDatabase({
 *   type: 'postgres',
 *   connection: process.env.DATABASE_URL,
 *   tables: {
 *     users: { id: 'id', label: 'name' },
 *     products: { id: 'id', label: 'name' }
 *   },
 *   relations: [...]
 * })
 *
 * // From CSV
 * const graph = await GraphBuilder.fromCSV('employees.csv', {
 *   id: 'employee_id',
 *   parent: 'reports_to',
 *   label: 'name'
 * })
 *
 * // From JSON
 * const graph = await GraphBuilder.fromJSON('data.json')
 * ```
 */
export class GraphBuilder {
  private relations: Relation[] = []
  private entities: Set<string> = new Set()

  // ==================== INSTANCE METHODS ====================

  /**
   * Add an entity type
   */
  addEntity(name: string): this {
    this.entities.add(name)
    return this
  }

  /**
   * Connect two entities
   */
  connect(
    from: string,
    to: string,
    options: {
      through?: string
      where?: Record<string, any>
      weight?: number
      bidirectional?: boolean
    } = {}
  ): this {
    const { through, weight = 1, bidirectional = false } = options

    const via = through || `${from}-${to}`

    this.relations.push({
      name: `${from}-${to}-${this.relations.length}`,
      fromEntity: from,
      toEntity: to,
      via,
      weight
    })

    // Add reverse relation if bidirectional
    if (bidirectional) {
      this.relations.push({
        name: `${to}-${from}-${this.relations.length}`,
        fromEntity: to,
        toEntity: from,
        via,
        weight
      })
    }

    return this
  }

  /**
   * Build the graph
   */
  build(): Graph {
    return {
      relations: this.relations
    }
  }

  // ==================== FACTORY METHODS ====================

  /**
   * Create a graph from a database
   *
   * Supports: PostgreSQL, MySQL, MongoDB
   */
  static async fromDatabase(config: DatabaseConfig): Promise<Graph> {
    const builder = new DatabaseGraphBuilder(config)
    return builder.build()
  }

  /**
   * Create a graph from a CSV file
   *
   * @example
   * ```typescript
   * // Org chart from CSV
   * const graph = await GraphBuilder.fromCSV('employees.csv', {
   *   id: 'employee_id',
   *   parent: 'reports_to',
   *   label: 'name'
   * })
   * ```
   */
  static async fromCSV(filepath: string, config: CSVConfig): Promise<Graph> {
    const builder = new CSVGraphBuilder(filepath, config)
    return builder.build()
  }

  /**
   * Create a graph from a JSON file
   *
   * @example
   * ```typescript
   * const graph = await GraphBuilder.fromJSON('subway.json')
   * ```
   */
  static async fromJSON(filepath: string, config?: JSONConfig): Promise<Graph> {
    const builder = new JSONGraphBuilder(filepath, config)
    return builder.build()
  }

  /**
   * Create a graph from raw data
   */
  static fromData(): DataGraphBuilder {
    return new DataGraphBuilder()
  }
}

// ==================== TYPES ====================

export type DatabaseConfig = {
  type: 'postgres' | 'mysql' | 'mongodb'
  connection: string
  tables?: Record<string, TableConfig>
  collections?: Record<string, CollectionConfig>
  relations: RelationConfig[]
}

export type TableConfig = {
  id: string
  label?: string
}

export type CollectionConfig = {
  id: string
  label?: string
}

export type RelationConfig = {
  from: string
  to: string
  through?: string
  on?: string[]
  where?: Record<string, any>
  weight?: number
}

export type CSVConfig = {
  id: string
  parent?: string
  label?: string
  weight?: string | number
  delimiter?: string
}

export type JSONConfig = {
  nodes?: string
  edges?: string
  nodeId?: string
  edgeFrom?: string
  edgeTo?: string
  edgeWeight?: string
}

// ==================== SPECIALIZED BUILDERS ====================

/**
 * Database Graph Builder
 */
class DatabaseGraphBuilder {
  constructor(private config: DatabaseConfig) {}

  async build(): Promise<Graph> {
    // Implementation depends on database type
    // This is a placeholder
    throw new Error(
      'Database builder not yet implemented. Use GraphBuilder instance methods for now.'
    )
  }
}

/**
 * CSV Graph Builder
 */
class CSVGraphBuilder {
  constructor(
    private filepath: string,
    private config: CSVConfig
  ) {}

  async build(): Promise<Graph> {
    // Implementation using Papa Parse or similar
    throw new Error('CSV builder not yet implemented. Use GraphBuilder instance methods for now.')
  }
}

/**
 * JSON Graph Builder
 */
class JSONGraphBuilder {
  constructor(
    private filepath: string,
    private config?: JSONConfig
  ) {}

  async build(): Promise<Graph> {
    // Implementation
    throw new Error('JSON builder not yet implemented. Use GraphBuilder instance methods for now.')
  }
}

/**
 * Data Graph Builder - for in-memory data
 */
class DataGraphBuilder extends GraphBuilder {
  private nodes: Map<string, any[]> = new Map()

  /**
   * Add nodes of a specific type
   */
  addNodes(type: string, data: any[], config: { id: string; label: string }): this {
    this.nodes.set(type, data)
    this.addEntity(type)
    return this
  }

  /**
   * Link nodes by a function
   */
  linkBy(
    from: string,
    to: string,
    fn: (fromNode: any, toNode: any) => boolean,
    options: { weight?: number } = {}
  ): this {
    const fromNodes = this.nodes.get(from) || []
    const toNodes = this.nodes.get(to) || []

    fromNodes.forEach(fromNode => {
      toNodes.forEach(toNode => {
        if (fn(fromNode, toNode)) {
          this.connect(from, to, options)
        }
      })
    })

    return this
  }
}
