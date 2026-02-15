import { derived } from "svelte/store";
import { stack } from "./stackStore";
import { movies, actors, moviesByActor } from "./mockData";

export const currentMovies = derived(stack, ($stack) => {
  const last = $stack[$stack.length - 1];
  const prev = $stack[$stack.length - 2];

  if (!last) return [];

  // Racine : /Movies
  if ($stack.length === 1 && last.table === "Movies") {
    return movies;
  }

  // Actors → Movies
  if (last.table === "Movies" && prev?.table === "Actors" && prev.id != null) {
    return moviesByActor[prev.id] ?? [];
  }

  return [];
});

export const currentActors = derived(stack, ($stack) => {
  const last = $stack[$stack.length - 1];
  const prev = $stack[$stack.length - 2];

  if (last?.table === "Actors" && prev?.table === "Movies" && prev.id != null) {
    return actors[prev.id] ?? [];
  }

  return [];
});
