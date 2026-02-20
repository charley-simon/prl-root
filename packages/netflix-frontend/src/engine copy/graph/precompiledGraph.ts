// precompiledGraph.ts
// import type { Filter } from '../stores/types';
import type { Relation } from './graph';
// import entitiesJson from '../stores/entities.json';
// import relationsJson from '../stores/relations.json';
// import constraintsJson from '../stores/constraints.json';

// Chaque relation précompilée connaît :
// - d'où elle part (fromEntity)
// - vers où elle va (toEntity)
// - via quelle table (pivot)
// - filtres obligatoires
export const precompiledGraph: Relation[] = [
  {
    name: 'people-director-movies',
    fromEntity: 'People',
    toEntity: 'Movie',
    via: 'Movie-People',
    constraintFilters: [
      { field: 'roleId', value: 'Director' }
    ]
  },
  {
    name: 'movie-actors',
    fromEntity: 'Movie',
    toEntity: 'People',
    via: 'Movie-People',
    constraintFilters: [
      { field: 'roleId', value: 'Actor' }
    ]
  },
  {
    name: 'people-actor-movies',
    fromEntity: 'People',
    toEntity: 'Movie',
    via: 'Movie-People',
    constraintFilters: [
      { field: 'roleId', value: 'Actor' }
    ]
  },
  {
    name: 'movie-writers',
    fromEntity: 'Movie',
    toEntity: 'People',
    via: 'Movie-People',
    constraintFilters: [
      { field: 'roleId', value: 'Writer' }
    ]
  },
  {
    name: 'people-writer-movies',
    fromEntity: 'People',
    toEntity: 'Movie',
    via: 'Movie-People',
    constraintFilters: [
      { field: 'roleId', value: 'Writer' }
    ]
  }
];
