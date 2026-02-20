import type { Relation, Filter } from '../stores/types'

import entitiesJson from './entities.json'
import relationsJson from './relations.json'
import rolesJson from './roles.json'
import constraintsJson from './constraints.json'

interface Role {
  id: string
  department?: string
}

/**
 * Précompile le graphe relationnel global
 * → aucune logique métier dans le resolver
 */
export function precompileGraph(): Relation[] {
  const graph: Relation[] = []

  // Index des contraintes explicites
  const constraintIndex: Record<string, Filter[]> = {}

  constraintsJson?.forEach((c: any) => {
    if (!constraintIndex[c.relationName]) {
      constraintIndex[c.relationName] = []
    }
    constraintIndex[c.relationName].push({
      field: c.field,
      value: c.value
    })
  })

  relationsJson.forEach((rel: any) => {
    const baseFilters = constraintIndex[rel.name] ?? []

    // Cas People <-> Movie : déduction par rôles
    if (
      (rel.fromEntity === 'People' && rel.toEntity === 'Movie') ||
      (rel.fromEntity === 'Movie' && rel.toEntity === 'People')
    ) {
      ;(rolesJson as Role[]).forEach(role => {
        const filters: Filter[] = [...baseFilters, { field: 'roleId', value: role.id }]

        if (role.department) {
          filters.push({
            field: 'departmentId',
            value: role.department
          })
        }

        graph.push({
          name: `${rel.fromEntity.toLowerCase()}-${role.id.toLowerCase()}-${rel.toEntity.toLowerCase()}`,
          fromEntity: rel.fromEntity,
          toEntity: rel.toEntity,
          via: rel.via,
          constraintFilters: filters
        })
      })

      return
    }

    // Cas générique
    graph.push({
      name: rel.name,
      fromEntity: rel.fromEntity,
      toEntity: rel.toEntity,
      via: rel.via,
      constraintFilters: baseFilters.length ? baseFilters : undefined
    })
  })

  return graph
}

// export direct
export const precompiledGraph = precompileGraph()
