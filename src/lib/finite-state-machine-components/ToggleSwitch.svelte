<!-- Toggle.svelte -->
<script lang="ts">
    import {graph_store, resetInputVar} from "../../stores/graphInitStore";

    let toggleState = "dfa";

    $: if ($resetInputVar) {
        //toggle($graph_store?.type);
    }

    const toggle = (newState) => {
        toggleState = newState;
        graph_store.update((n) => {
            n.type = newState
            return n;
        });
    };
</script>

<div class="toggle-box">
    <div class="toggle-label">Type</div>
    <div class="toggle-switch">
        <div
                class={toggleState === "dfa" ? 'selected' : ''}
                on:click={() => toggle("dfa")}
        >
            DFA
        </div>
        <div
                class={toggleState === "nfa" ? 'selected' : ''}
                on:click={() => toggle("nfa")}
        >
            NFA
        </div>
    </div>
</div>


<style>
    .toggle-box {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        gap: 1rem;
    }

    .toggle-switch {
        display: flex;
        justify-content: space-between;
        width: 12.5rem;
        background-color: #eee;
        outline: 0.15rem solid #ccc;
        color: #393939;

        border-radius: 2rem;
        /*border-radius: 0.5rem;*/

        overflow: hidden;
        padding: 0.25rem;
    }

    :global(body.dark-mode) .toggle-switch {
        background-color: #2f3941;
        outline: 0.15rem solid #555;
        color: #f4f9ff;
    }

    .toggle-switch div {
        flex: 1;
        text-align: center;
        cursor: pointer;
        padding: 0.25rem;
        transition: border-color 0.3s, color 0.3s;
    }

    .selected {
        border-radius: 2rem;
        /*border-radius: 0.25rem;*/

        outline: 0.15rem solid #007bff;
        color: #007bff;
    }

    :global(body.dark-mode) .selected {
        outline: 0.15rem solid #9c81da;
        color: #9c81da;
    }
</style>