<!-- Toggle.svelte -->
<script lang="ts">
    import {resetInputVar, second_graph_store} from "../../../stores/graphInitStore";

    let toggleState = "DFA";

    $: if ($resetInputVar) {
    }

    $: {
        if ($second_graph_store.type == "empty") {
            $second_graph_store.type = "DFA";
        }
    }

    const toggle = (newState) => {
        toggleState = newState;
        second_graph_store.update((n) => {
            n.type = newState
            return n;
        });

        console.log("KA type: ",$second_graph_store.type);
    };
</script>

<div class="toggle-box">
    <div class="toggle-label">Type</div>
    <div class="toggle-switch">
        <div
                class={$second_graph_store.type === "DFA" ? 'selected' : ''}
                on:click={() => toggle("DFA")}
        >
            DFA
        </div>
        <div
                class={$second_graph_store.type === "NFA" ? 'selected' : ''}
                on:click={() => toggle("NFA")}
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