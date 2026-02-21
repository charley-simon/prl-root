import type { Frame, Filter } from '../stores/types';
import type { Relation } from '../graph/graph';

/**
 * Sélectionne la meilleure relation pour résoudre un frame
 */
export function selectBestRelation(
  frame: Frame,
  stack: Frame[],
  graph: Relation[]
): { relation: Relation; sourceFrame: Frame } | null {

  // Frames déjà résolus, du plus récent au plus ancien
  const resolvedFrames = [...stack]
    .reverse()
    .filter(f => f.state === 'RESOLVED' && f.id !== undefined);

  for (const source of resolvedFrames) {
    const candidates = graph.filter(rel =>
      rel.toEntity === frame.entity &&
      rel.fromEntity === source.entity &&
      constraintsMatch(frame.intent, rel.constraintFilters)
    );

    if (candidates.length > 0) {
      // pour l’instant : le premier est le meilleur
      return {
        relation: candidates[0],
        sourceFrame: source
      };
    }
  }

  return null;
}

/**
 * Vérifie si les contraintes d’une relation
 * sont compatibles avec l’intent du frame
 */
function constraintsMatch(
  intent: Record<string, any>,
  filters?: Filter[]
): boolean {
  if (!filters || filters.length === 0) return true;

  return filters.every(f => {
    // intent vide → accepte tout
    if (intent[f.field] === undefined) return true;
    return intent[f.field] === f.value;
  });
}
