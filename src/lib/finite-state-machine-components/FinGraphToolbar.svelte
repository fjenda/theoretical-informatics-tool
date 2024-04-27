<!--
    FinGraphToolbar.svelte
    This component is a toolbar for the FinGraph component. It is used to display the buttons for the user to interact with the graph.
    Author: Marek Krúpa
-->

<script lang="ts">
</script>

<div class="toolbar">
    <slot />
</div>

<style>
    .toolbar {
        width: calc(100% - 1rem);
        height: 2rem;

        border-radius: 0.5rem 0.5rem 0 0;

        background: #dedede;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-left: 1rem;
    }

    :global(body.dark-mode) .toolbar {
        background: #19191e;
    }
</style>