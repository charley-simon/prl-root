<script lang="ts">
  import { stack, updateContext, createStackElem } from '../engine/stores/stackStore';
  export let clickable = true;
</script>

<div class="flex gap-1 text-sm">
  {#each $stack as elem, i}
    <span class="cursor-pointer text-blue-600 hover:underline"
          on:click={() => clickable && (updateContext(createStackElem(elem.table, elem.id, elem.label, elem.anchor)))}>
      {elem.label || elem.table}
    </span>
    {#if i < $stack.length - 1} / {/if}
  {/each}
</div>
