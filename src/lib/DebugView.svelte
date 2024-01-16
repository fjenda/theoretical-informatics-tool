<script lang="ts">
    let debug : boolean = false;
</script>

<button class:abc={debug} on:click={() => debug = !debug}>
    DebugMode
</button>
{#if debug}
    <div class="debug-box">
        <slot />
    </div>
{:else}
    <slot />
{/if}

<style>
    .debug-box :global(*:hover) {
        outline: 1px dashed aqua;
    }

    .abc {
        background: darkgreen;
    }

    button {
        position: absolute;
        top: 4rem;
        right: 1rem;
    }
</style>