// Navigation Stack Engine
// Core types and logic for contextual navigation without a predefined tree

export type TableName = string;

export interface StackElem {
  table: TableName;
  id: number | null;
  label?: string | null;
}

export interface UpdateContextInput {
  anchor: "/" | "./" | TableName;
  table: TableName;
  id: number | null;
  label?: string | null;
}

export class NavigationStack {
  private stack: StackElem[] = [];

  constructor(defaultTable: TableName) {
    this.stack = [{ table: defaultTable, id: null }];
  }

  /**
   * Public read-only view of the stack
   */
  get value(): readonly StackElem[] {
    return this.stack;
  }

  /**
   * Update navigation context according to anchor semantics
   */
  update(input: UpdateContextInput): void {
    const baseIndex = this.resolveAnchor(input.anchor);

    // truncate stack to anchor
    this.stack = this.stack.slice(0, baseIndex + 1);

    const current = this.stack[this.stack.length - 1];

    // same table → selection update only
    if (current && current.table === input.table) {
      current.id = input.id;
      current.label = input.label;
      return;
    }

    // cyclic table handling: remove previous occurrence
    const existingIndex = this.stack.findIndex((e) => e.table === input.table);
    if (existingIndex !== -1) {
      this.stack = this.stack.slice(existingIndex);
    }

    this.stack.push({
      table: input.table,
      id: input.id,
      label: input.label,
    });
  }

  /**
   * Go back one level
   */
  pop(): void {
    if (this.stack.length > 1) {
      this.stack.pop();
    }
  }

  /**
   * Resolve anchor into a stack index
   */
  private resolveAnchor(anchor: UpdateContextInput["anchor"]): number {
    if (anchor === "/") return 0;
    if (anchor === "./") return this.stack.length - 1;

    const index = this.stack.findIndex((e) => e.table === anchor);
    if (index === -1) {
      throw new Error(`Invalid anchor: ${anchor}`);
    }
    return index;
  }
}
