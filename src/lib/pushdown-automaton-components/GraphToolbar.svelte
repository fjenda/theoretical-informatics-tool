<!--
    GraphToolbar.svelte
    This component is a toolbar for the graph editor.
    It is used to display buttons that allow the user to interact with the graph.
    Author: Jan Fojtík
-->

<div class="toolbar">
    <slot />
</div>

<style>
    .toolbar {
        height: 3rem;
        padding: 0 0.5rem;
        border-radius: 0.5rem 0.5rem 0 0;
        background: #dedede;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }

    :global(body.dark-mode) .toolbar {
        background: #19191e;
    }
</style>