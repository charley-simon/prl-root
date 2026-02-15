import { writable } from "svelte/store";

export const selectedMovie = writable<number | null>(null);
export const selectedPerson = writable<number | null>(null);
