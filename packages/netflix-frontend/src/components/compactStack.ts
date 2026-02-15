// compactStack.ts
import type { StackElem } from "./stack.types";

export function compactStack(stack: StackElem[]): StackElem[] {
  const seenTables = new Set<string>();
  const compacted: StackElem[] = [];

  // Parcours du bas vers le haut
  for (let i = stack.length - 1; i >= 0; i--) {
    const elem = stack[i];

    if (elem.id == null) continue;

    if (!seenTables.has(elem.table)) {
      compacted.unshift(elem);
      seenTables.add(elem.table);
    }
  }

  return compacted;
}
