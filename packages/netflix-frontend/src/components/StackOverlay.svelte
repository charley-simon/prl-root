<script lang="ts">
  import { stack } from '../engine/stores/stackStore'
</script>

<div class="fixed bottom-2 right-2 bg-black text-white text-xs p-2 rounded w-72 opacity-90">
  <div class="font-bold mb-1">STACK</div>
  {#each $stack as elem, i}
    <div class="border-b border-gray-600 py-1">
      {i}: {elem.table} | id: {elem.id ?? '--'} | {elem.label ?? ''}
    </div>
  {/each}
</div>
