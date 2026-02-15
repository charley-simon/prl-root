// resolver.ts
import { StackStore } from '../engine/stores/stackStore';
import type { Frame, ResolvedBy, Filter } from '../engine/stores/types';
import { precompiledGraph } from './graph';
import type { Relation } from './graph';

export class Resolver {
  constructor(private stackStore: StackStore) {}

  resolveContext() {
    const stack = this.stackStore.getFrames();

    stack.forEach((frame, index) => {
      if (frame.state === 'UNRESOLVED') {
        const resolvedBy = this.selectBestCandidate(frame, stack, index);
        if (resolvedBy) {
          frame.resolvedBy = resolvedBy;
          frame.state = 'RESOLVED';
          this.stackStore.updateFrame(index, frame);
        }
      }
    });
  }

  private selectBestCandidate(frame: Frame, stack: Frame[], currentIndex: number): ResolvedBy | null {
    // Exemple simple: on parcourt le graphe précompilé pour trouver une relation pertinente
    const candidate = precompiledGraph.find(rel => rel.fromEntity === this.getParentEntity(stack, currentIndex) && rel.toEntity === frame.entity);
    if (!candidate) return null;

    // Génération dynamique des filtres basiques
    const filters: Filter[] = [];
    const parentFrame = stack[currentIndex - 1];
    if (parentFrame && parentFrame.id) {
      if (candidate.fromEntity === 'People') filters.push({ field: 'peopleId', value: parentFrame.id });
      if (candidate.fromEntity === 'Movie') filters.push({ field: 'movieId', value: parentFrame.id });
      if (frame.intent.role) filters.push({ field: 'roleId', value: frame.intent.role });
    }

    return {
      relation: candidate.name,
      via: candidate.via,
      filters
    };
  }

  private getParentEntity(stack: Frame[], currentIndex: number): string | null {
    if (currentIndex === 0) return null;
    return stack[currentIndex - 1].entity;
  }
}
