<!--
    StackVisualiser.svelte
    This component is responsible for visualising the stack of the PDA.
    Author: Jan Fojtík
-->

<script lang="ts">
    import {pda_graph_store, stack_store} from "../../stores/graphInitStore";

    let stackElements : string[] = [];

    // Reactive statement that updates the stack elements based on the current state of the PDA
    $: if ($stack_store) {
        if ($pda_graph_store.status === "testing")
            stackElements = $stack_store.slice().reverse();
        else
            stackElements = [];
    }


</script>

<div class="stack">
    <div class="stack__title">Stack</div>
    <div class="stack__elements">
        {#each stackElements as element}
            <div class="stack__element">{element}</div>
        {/each}
    </div>
</div>

<style>
    .stack {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-top: 1rem;
    }

    .stack__title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .stack__elements {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 3.75rem;
    }

    .stack__element {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 2rem;
        border: 0.1rem solid #c5c5c5;
        border-radius: 0.3rem;
        margin-bottom: 0.5rem;
    }
</style>