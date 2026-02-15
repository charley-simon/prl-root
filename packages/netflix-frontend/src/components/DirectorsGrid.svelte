<script lang="ts">
  import { currentStackElem, getData, updateContext } from '../engine/stores/stackStore';
  import type { StackElem } from '../engine/stores/stackStore';

  let current: StackElem | null = null;
  currentStackElem.subscribe(value => current = value);

  // Directeurs du film courant
  let directors: { id: number; name: string }[] = [];
  $: directors = current?.id ? getData('Directors', current.id) : [];

  function selectDirector(director: { id: number; name: string }) {
    const elem: StackElem = {
      table: 'Directors',
      id: director.id,
      label: director.name,
      views: ['DirestorsGrid', 'PersonDetail']
    };
    updateContext(elem);
  }
</script>

<div class="grid grid-cols-2 md:grid-cols-4 gap-4">
  {#each directors as director}
    <div
      class="p-2 border rounded hover:bg-gray-100 cursor-pointer"
      on:click={() => selectDirector(director)}
    >
      {director.name}
    </div>
  {/each}
</div>
