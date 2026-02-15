<script lang="ts">
  import StackOverlay from './components/StackOverlay.svelte';
  import type { StackElem } from './engine/stores/stackStore';
  import { stack, currentStackElem } from './engine/stores/stackStore';
  import MoviesGrid from './components/MoviesGrid.svelte';
  import MovieDetail from './components/MovieDetail.svelte';
  import ActorsGrid from './components/ActorsGrid.svelte';
  import DirectorsGrid from './components/DirectorsGrid.svelte';
  import PersonDetail from './components/PersonDetail.svelte';
  import ActorDetail from './components/ActorDetail.svelte';
  import DirectorDetail from './components/DirectorDetail.svelte';

  
  // Abonnement réactif au dernier étage de la pile
  let current: StackElem | null = null;
  currentStackElem.subscribe(value => current = value);
</script>

<main>
<div class="flex flex-col md:flex-row gap-4 p-4">

{#if current}
  current.table: '{current.table}', id: {current.id}
  {#if current.table === 'Movies'}
    MoviesGrid
    <MoviesGrid />

    {#if current.id !== null}
      current.id: {current.id}
      <MovieDetail />
    {/if}
  {/if}

  {#if current.table === 'Actors'}
    <ActorsGrid />

    {#if current.id !== null}
      <ActorDetail />
    {/if}
  {/if}

  {#if current.table === 'Directors'}
    <DirectorsGrid />

    {#if current.id !== null}
      <DirectorDetail />
    {/if}
  {/if}

{/if}
</div>

<style>
  div.flex-1 {
    overflow-y: auto;
    max-height: 80vh;
  }
</style>
</main>
<!-- Overlay pile (dev only) -->
<StackOverlay />
