<script lang="ts">
  import { onMount } from 'svelte'
  import { selectedMovie } from '../stores'

  let movies: any[] = []

  onMount(async () => {
    const res = await fetch('http://localhost:3000/movies')
    movies = await res.json()
  })

  function selectMovie(id: number) {
    console.log('Selected movie ID:', id)
    selectedMovie.set(id)
  }
</script>

<h2>Films</h2>
<ul>
  {#each movies as movie}
    <li on:click={() => selectMovie(movie.id)}>
      {movie.title} ({movie.releaseYear}) 
      {movie.isLocal ? '✅ local' : '⏳ à récupérer'}
    </li>
  {/each}
</ul>
