import { describe, expect, test } from "vitest";
import { NavigationStack } from "./navigation_stack_engine";

describe("NavigationStack – complex navigation scenarios", () => {
  test("Scenario 1 – With visible arborescence", () => {
    const stack = new NavigationStack("Movies");

    expect(stack.value.map((e) => `${e.table}(${e.id})`)).toEqual([
      "Movies(null)",
    ]);

    // Select Movie
    stack.update({ anchor: "./", table: "Movies", id: 1, label: "Le Parrain" });
    expect(stack.value.map((e) => `${e.table}(${e.id})`)).toEqual([
      "Movies(1)",
    ]);

    // Navigate to Actors under Movies
    stack.update({ anchor: "Movies", table: "Actors", id: null });
    expect(stack.value.map((e) => e.table)).toEqual(["Movies", "Actors"]);

    // Select Actor
    stack.update({ anchor: "./", table: "Actors", id: 2, label: "Al Pacino" });
    expect(stack.value.map((e) => `${e.table}(${e.id})`)).toEqual([
      "Movies(1)",
      "Actors(2)",
    ]);

    // Go to Movies of Actor (cycle)
    stack.update({ anchor: "Actors", table: "Movies", id: 4 });
    expect(stack.value.map((e) => `${e.table}(${e.id})`)).toEqual([
      "Actors(2)",
      "Movies(4)",
    ]);
  });

  test("Scenario 2 – Without arborescence (free navigation)", () => {
    const stack = new NavigationStack("Movies");

    // Select Movie
    stack.update({ anchor: "./", table: "Movies", id: 1 });

    // Jump to Actor from detail view
    stack.update({ anchor: "Movies", table: "Actors", id: 2 });
    expect(stack.value.map((e) => `${e.table}(${e.id})`)).toEqual([
      "Movies(1)",
      "Actors(2)",
    ]);

    // Navigate deeper
    stack.update({ anchor: "Actors", table: "Departments", id: null });
    expect(stack.value.map((e) => e.table)).toEqual([
      "Movies",
      "Actors",
      "Departments",
    ]);

    // Change branch higher
    stack.update({ anchor: "Movies", table: "Directors", id: null });
    expect(stack.value.map((e) => e.table)).toEqual(["Movies", "Directors"]);
  });

  test("Non-determinant parameter does not pollute stack", () => {
    const stack = new NavigationStack("Movies");

    stack.update({ anchor: "./", table: "Movies", id: 1 });
    stack.update({ anchor: "Movies", table: "Actors", id: null });
    stack.update({ anchor: "./", table: "Actors", id: 2 });

    // Navigate to Movies again (filmography)
    stack.update({ anchor: "Actors", table: "Movies", id: 5 });

    expect(stack.value.map((e) => `${e.table}(${e.id})`)).toEqual([
      "Actors(2)",
      "Movies(5)",
    ]);
  });
});
