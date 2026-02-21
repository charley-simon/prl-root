// precompileGraphAdvanced.ts
import type { Filter } from '../stores/types';
import type { Relation } from './components/graph';
import entitiesJson from '../stores/context-resolver/entities.json';
import relationsJson from '../stores/context-resolver/relations.json';
import constraintsJson from '../stores/context-resolver/constraints.json';

import rolesJson from '../stores/context-resolver/roles.json';

const roles = rolesJson || [];

/**
 * Génère automatiquement le graphe précompilé
 * en combinant relations + contraintes + déduction depuis entities.json
 */
export function precompileGraphAdvanced(): Relation[] {
  const graph: Relation[] = [];

  // Créer un index des contraintes par relation pour accès rapide
  const constraintsIndex: Record<string, Filter[]> = {};
  if (constraintsJson && Array.isArray(constraintsJson)) {
    constraintsJson.forEach((c: any) => {
      if (!constraintsIndex[c.relationName]) constraintsIndex[c.relationName] = [];
      constraintsIndex[c.relationName].push({ field: c.field, value: c.value });
    });
  }

  // Parcourir toutes les relations
  relationsJson.forEach((rel: any) => {
    const fromEntity = rel.fromEntity;
    const toEntity = rel.toEntity;
    const via = rel.via;

    // Commencer avec les contraintes déclarées
    const filters: Filter[] = constraintsIndex[rel.name] ? [...constraintsIndex[rel.name]] : [];

    // Déduction automatique : si fromEntity est People et toEntity est Movie,
    // et qu'il existe des rôles dans entities.json, ajouter roleId comme filtre
    if (fromEntity === 'People' && toEntity === 'Movie') {
      const roles = entitiesJson.roles || [];
      roles.forEach((r: any) => {
        // Ici on crée un Relation par rôle
        graph.push({
          name: `${fromEntity.toLowerCase()}-${r.role.toLowerCase()}-${toEntity.toLowerCase()}`,
          fromEntity,
          toEntity,
          via,
          constraintFilters: [...filters, { field: 'roleId', value: r.role }]
        });
      });
    } else if (fromEntity === 'Movie' && toEntity === 'People') {
      // Déduction pour Movie -> People (ex: acteurs, writers, directors)
      const roles = entitiesJson.roles || [];
      roles.forEach((r: any) => {
        graph.push({
          name: `${fromEntity.toLowerCase()}-${r.role.toLowerCase()}-${toEntity.toLowerCase()}`,
          fromEntity,
          toEntity,
          via,
          constraintFilters: [...filters, { field: 'roleId', value: r.role }]
        });
      });
    } else {
      // Cas général : ajouter relation telle quelle
      graph.push({
        name: rel.name,
        fromEntity,
        toEntity,
        via,
        constraintFilters: filters.length ? filters : undefined
      });
    }
  });

  return graph;
}

// Générer et exporter le graphe
const precompiledGraph = precompileGraphAdvanced();
console.log(JSON.stringify(precompiledGraph, null, 2));
export default precompiledGraph;
