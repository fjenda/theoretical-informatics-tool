<!--
    SecondToggleSwitch.svelte
    This component is toggle switch for changing the type of the graph (DFA/NFA)
    Used in Set operations second generator
    Author: Marek Krúpa
-->

<script lang="ts">
    import {resetInputVar, second_backup_store} from "../../../stores/graphInitStore";

    let toggleState = "DFA";

    $: if ($resetInputVar) {
    }

    $: {
        if ($second_backup_store.type == "empty") {
            $second_backup_store.type = "DFA";
        }
    }

    // Function for changing the type of the graph
    const toggle = (newState) => {
        toggleState = newState;
        second_backup_store.update((n) => {
            n.type = newState
            return n;
        });
    };
</script>

<div class="toggle-box">
    <div class="toggle-label">Type</div>
    <div class="toggle-switch">
        <button
                class={$second_backup_store.type === "DFA" ? 'selected' : ''}
                on:click={() => toggle("DFA")}
        >
            DFA
        </button>
        <button
                class={$second_backup_store.type === "NFA" ? 'selected' : ''}
                on:click={() => toggle("NFA")}
        >
            NFA
        </button>
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

        overflow: hidden;
        padding: 0.25rem;
    }


    :global(body.dark-mode) .toggle-switch {
        background-color: #2f3941;
        outline: 0.15rem solid #555;
        color: #f4f9ff;
    }

    .toggle-switch button {
        flex: 1;
        text-align: center;
        cursor: pointer;
        padding: 0.25rem;
        transition: border-color 0.3s, color 0.3s;

        border: none;
        background-color: transparent;

        color: #101820;
        font-synthesis: none;
        font: normal normal 400 medium / 1.5 Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    }

    :global(body.dark-mode) .toggle-switch button {
        color: #f4f9ff;
    }

    .selected {
        border-radius: 2rem;
        outline: 0.15rem solid #007bff;
        color: #007bff;
    }

    :global(body.dark-mode) .selected {
        outline: 0.15rem solid #9c81da;
        color: #9c81da;
    }
</style>