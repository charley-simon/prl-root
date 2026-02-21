import { selectBestRelation } from './selectBestRelation';
export function resolveFrame(frame, stack, relations) {
    if (frame.state === 'RESOLVED') {
        return frame;
    }
    const candidate = selectBestRelation(frame, stack, relations);
    if (!candidate) {
        console.warn(`[Resolver] No relation found for ${frame.entity}`, frame.intent);
        return frame;
    }
    const { relation, sourceFrame } = candidate;
    return {
        ...frame,
        state: 'RESOLVED',
        resolvedBy: {
            relation: relation.name,
            via: relation.via,
            filters: [
                {
                    field: `${sourceFrame.entity.toLowerCase()}Id`,
                    operator: 'equals',
                    value: sourceFrame.id
                },
                ...(relation.constraintFilters ?? [])
            ]
        }
    };
}
//# sourceMappingURL=resolveFrame.js.map