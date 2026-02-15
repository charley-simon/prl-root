<script lang="ts">
  import { getData } from '../engine/stores/stackStore';
  import type { Movie, Actor } from './types';

  export let movieId: number | null = null;

  // on convertit null en undefined pour correspondre au type attendu
  const movie: Movie | undefined = getData('Movies', movieId ?? undefined);

  // récupère les acteurs du film courant
  const actors: Actor[] = getData('Actors', movieId ?? undefined) || [];
</script>

{#if movie}
  <div class="p-4 border rounded">
    <h2 class="text-xl font-bold">{movie.title}</h2>
    <h3 class="mt-2 font-semibold">Acteurs :</h3>
    <ul class="list-disc ml-4">
      {#each actors as actor}
        <li>{actor.name}</li>
      {/each}
    </ul>
  </div>
{:else}
  <div class="p-4 text-gray-500">Film non trouvé</div>
{/if}
