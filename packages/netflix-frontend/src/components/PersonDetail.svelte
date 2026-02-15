<script lang="ts">
  import { getData } from '../engine/stores/stackStore';
  import type { Movie, Actor, Director } from './types';

  export let table: string;           // ex: 'Actors', 'Directors'
  export let personId: number | null; // id courant dans la pile

  // Conversion null → undefined pour getData
  const person = getData(table, personId ?? undefined);

  // filmographie de la personne
  const filmography : Movie[] = getData('Movies', personId ?? undefined) || [];
</script>

{#if person}
  <div class="p-4 border rounded">
    <h2 class="text-xl font-bold">{person.name}</h2>
    <h3 class="mt-2 font-semibold">Filmographie :</h3>
    <ul class="list-disc ml-4">
      {#each filmography as movie}
        <li>{movie.title}</li>
      {/each}
    </ul>
  </div>
{:else}
  <div class="p-4 text-gray-500">Personne non trouvée</div>
{/if}
