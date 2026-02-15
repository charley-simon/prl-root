<script lang="ts">
  import { getData } from '../engine/stores/stackStore';
  import type { Actor, Movie } from './types';

  export let actorId: number | null = null;

  // on convertit null en undefined pour correspondre au type attendu
  const actor: Actor | undefined = getData('Actors', actorId ?? undefined);

  // récupère les films dans lesquels cet acteur a joué
  const filmography: Movie[] = getData('Movies', actorId ?? undefined) || [];
</script>

{#if actor}
  <div class="p-4 border rounded">
    <h2 class="text-xl font-bold">{actor.name}</h2>
    <h3 class="mt-2 font-semibold">Filmographie :</h3>
    <ul class="list-disc ml-4">
      {#each filmography as movie}
        <li>{movie.title}</li>
      {/each}
    </ul>
  </div>
{:else}
  <div class="p-4 text-gray-500">Acteur non trouvé</div>
{/if}
