// queryBuilder.ts
import type { StackElem } from "./stack.types";

export function buildCriteria(stack: StackElem[]): Record<string, number> {
  const criteria: Record<string, number> = {};

  for (const e of stack) {
    if (e.id != null) {
      criteria[e.table] = e.id;
    }
  }

  return criteria;
}
