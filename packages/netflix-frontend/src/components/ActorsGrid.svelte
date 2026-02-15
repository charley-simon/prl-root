<script lang="ts">
  import { currentStackElem, getData, updateContext } from '../engine/stores/stackStore';
  import type { StackElem } from '../engine/stores/stackStore';

let current: StackElem | null = null;
currentStackElem.subscribe(value => current = value);

  // Acteurs du film courant
  let actors: { id: number; name: string }[] = [];
  $: actors = current?.id ? getData('Actors', current.id) : [];
  
  function selectActor(actor: { id: number; name: string }) {
    const elem: StackElem = {
      table: 'Actors',
      id: actor.id,
      label: actor.name,
      views: ['ActorsGrid', 'PersonDetail']
    };
    updateContext(elem);
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  {#each actors as actor}
    <div
      class="p-2 border rounded hover:bg-gray-100 cursor-pointer"
      on:click={() => selectActor(actor)}
    >
      {actor.name}
    </div>
  {/each}
</div>
