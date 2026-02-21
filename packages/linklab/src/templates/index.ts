// templates/index.ts

import { GraphBuilder } from '../builders/GraphBuilder'
import type { Graph } from '../types'

/**
 * Pre-built templates for common use cases
 *
 * @example
 * ```typescript
 * import { templates } from 'linklab'
 *
 * // Recommendation system
 * const graph = templates.recommendations({
 *   entities: ['Users', 'Products', 'Categories'],
 *   userLikes: 'user_products',
 *   productCategories: 'product_categories'
 * })
 *
 * // Social network
 * const graph = templates.social({
 *   users: usersList,
 *   friendships: friendshipsList
 * })
 * ```
 */
export const templates = {
  /**
   * Recommendation system template
   *
   * Creates a graph for: Users → Products → Categories
   */
  recommendations(config: RecommendationConfig): Graph {
    const builder = new GraphBuilder()

    // Add entities
    config.entities.forEach(entity => builder.addEntity(entity))

    // Connect users to products
    if (config.userLikes) {
      builder.connect('Users', 'Products', {
        through: config.userLikes,
        weight: 5
      })
    }

    // Connect products to categories
    if (config.productCategories) {
      builder.connect('Products', 'Categories', {
        through: config.productCategories,
        weight: 3
      })
    }

    // Connect categories back to products (navigation)
    if (config.productCategories) {
      builder.connect('Categories', 'Products', {
        through: config.productCategories,
        weight: 3
      })
    }

    return builder.build()
  },

  /**
   * Social network template
   *
   * Creates a graph for: Users ↔ Users (friendships)
   *                      Users → Posts
   *                      Users → Groups
   */
  social(config: SocialConfig): Graph {
    const builder = new GraphBuilder()

    builder.addEntity('Users').addEntity('Posts').addEntity('Groups')

    // Friendships (bidirectional)
    builder.connect('Users', 'Users', {
      through: 'friendships',
      weight: 2,
      bidirectional: true
    })

    // Posts
    builder.connect('Users', 'Posts', {
      through: 'user_posts',
      weight: 3
    })

    // Groups
    builder.connect('Users', 'Groups', {
      through: 'user_groups',
      weight: 4,
      bidirectional: true
    })

    return builder.build()
  },

  /**
   * Org chart template
   *
   * Creates a hierarchical graph: Employee → Manager → VP → CEO
   */
  orgChart(config: OrgChartConfig): Graph {
    const builder = new GraphBuilder()

    builder.addEntity('Employees')

    // Reports-to relationship
    builder.connect('Employees', 'Employees', {
      through: 'reports_to',
      weight: 1
    })

    // Add departments if provided
    if (config.departments) {
      builder.addEntity('Departments')
      builder.connect('Employees', 'Departments', {
        through: 'employee_departments',
        weight: 2
      })
    }

    return builder.build()
  },

  /**
   * Transport/routing template
   *
   * Creates a graph for: Station → Station (lines)
   *                      Station → Station (transfers)
   */
  transport(config: TransportConfig): Graph {
    const builder = new GraphBuilder()

    builder.addEntity('Stations')

    // Direct connections (same line)
    builder.connect('Stations', 'Stations', {
      through: 'direct_connections',
      weight: config.defaultTravelTime || 2
    })

    // Transfers (different lines, same station)
    if (config.includeTransfers) {
      builder.connect('Stations', 'Stations', {
        through: 'transfers',
        weight: config.defaultTransferTime || 5
      })
    }

    return builder.build()
  },

  /**
   * Knowledge base template
   *
   * Creates a graph for: Concept → Related Concept
   *                      Document → Concept
   */
  knowledgeBase(config: KnowledgeConfig): Graph {
    const builder = new GraphBuilder()

    builder.addEntity('Concepts').addEntity('Documents')

    // Concept relationships
    builder.connect('Concepts', 'Concepts', {
      through: 'related_concepts',
      weight: 3,
      bidirectional: true
    })

    // Documents to concepts
    builder.connect('Documents', 'Concepts', {
      through: 'document_concepts',
      weight: 2
    })

    // Concepts to documents (reverse)
    builder.connect('Concepts', 'Documents', {
      through: 'document_concepts',
      weight: 2
    })

    return builder.build()
  },

  /**
   * Musicians/sampling template
   *
   * Creates a graph for: Artist → Track
   *                      Track → Track (samples)
   *                      Artist → Artist (collaborations)
   */
  musicians(config: MusiciansConfig): Graph {
    const builder = new GraphBuilder()

    builder.addEntity('Artists').addEntity('Tracks')

    // Artist created track
    builder.connect('Artists', 'Tracks', {
      through: 'created',
      weight: 2
    })

    // Track samples track
    builder.connect('Tracks', 'Tracks', {
      through: 'samples',
      weight: 5
    })

    // Artist collaborated with artist
    builder.connect('Artists', 'Artists', {
      through: 'collaborated_with',
      weight: 3,
      bidirectional: true
    })

    // Add genres if provided
    if (config.includeGenres) {
      builder.addEntity('Genres')
      builder.connect('Artists', 'Genres', {
        through: 'artist_genres',
        weight: 4
      })
      builder.connect('Tracks', 'Genres', {
        through: 'track_genres',
        weight: 4
      })
    }

    return builder.build()
  }
}

// ==================== TYPES ====================

export type RecommendationConfig = {
  entities: string[]
  userLikes?: string
  productCategories?: string
}

export type SocialConfig = {
  includePosts?: boolean
  includeGroups?: boolean
}

export type OrgChartConfig = {
  departments?: boolean
}

export type TransportConfig = {
  defaultTravelTime?: number
  defaultTransferTime?: number
  includeTransfers?: boolean
}

export type KnowledgeConfig = {
  includeAuthors?: boolean
}

export type MusiciansConfig = {
  includeGenres?: boolean
  includeInfluences?: boolean
}
