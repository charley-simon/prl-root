// compactStack.test.ts
import { expect, test } from "vitest";
import { compactStack } from "./compactStack";
import { buildCriteria } from "./queryBuilder";
import type { StackElem } from "./stack.types";

test("cycle People → Movies → People", () => {
  const stack: StackElem[] = [
    { table: "People", id: 1, label: "Francis Ford Coppola" },
    { table: "Movies", id: 2, label: "Le Parrain" },
    { table: "People", id: 5, label: "Al Pacino" },
  ];

  const compacted = compactStack(stack);

  expect(compacted).toEqual([
    { table: "Movies", id: 2, label: "Le Parrain" },
    { table: "People", id: 5, label: "Al Pacino" },
  ]);

  // conformité fonctionnelle
  const naiveCriteria = buildCriteria(stack);
  const compactCriteria = buildCriteria(compacted);

  // le résultat attendu côté données doit être identique
  expect(compactCriteria).toEqual({
    Movies: 2,
    People: 5,
  });

  expect(naiveCriteria.People).toBe(5); // écrasement logique
});
test("no redundancy keeps full stack", () => {
  const stack: StackElem[] = [
    { table: "Movies", id: 2 },
    { table: "Genres", id: 7 },
    { table: "Years", id: 1972 },
  ];

  const compacted = compactStack(stack);

  expect(compacted).toEqual(stack);
});
test("null id is ignored", () => {
  const stack: StackElem[] = [
    { table: "Movies", id: null },
    { table: "People", id: 5 },
  ];

  const compacted = compactStack(stack);

  expect(compacted).toEqual([{ table: "People", id: 5 }]);
});
test("complex cyclic path", () => {
  const stack: StackElem[] = [
    { table: "People", id: 1 }, // Director
    { table: "Movies", id: 2 },
    { table: "People", id: 5 }, // Actor
    { table: "Movies", id: 8 }, // Filmographie acteur
  ];

  const compacted = compactStack(stack);

  expect(compacted).toEqual([
    { table: "People", id: 5 },
    { table: "Movies", id: 8 },
  ]);
});
