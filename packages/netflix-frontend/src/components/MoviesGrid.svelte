<script lang="ts">
  import { getData, updateContext, createStackElem } from '../engine/stores/stackStore';
  import type { Movie, Actor } from './types';
  
  const movies: Movie[] = getData('Movies') || [];

  // données simulées des acteurs par movieId
  const actors: Record<number, Actor[]> = {
    1: [{ id: 1, name: 'Marlon Brando' }, { id: 2, name: 'Al Pacino' }],
    2: [{ id: 3, name: 'Al Pacino' }]
  };

  function selectMovie(movie: Movie) {
    // met à jour le film courant dans la pile
    updateContext(createStackElem('Movies', movie.id, movie.title, movies));

    // ajoute un étage pour les acteurs du film
    updateContext(createStackElem('Actors', null, 'Acteurs', actors[movie.id] || []));
  }
</script>

<div class="grid grid-cols-2 gap-2">
  {#each movies as movie}
    <div class="p-2 border cursor-pointer hover:bg-gray-100"
         on:click={() => selectMovie(movie)}>
      {movie.title}
    </div>
  {/each}
</div>
