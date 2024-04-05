<!-- Toggle.svelte -->
<script lang="ts">
    import {pda_backup_store, pda_graph_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";

    $pda_backup_store.type = "empty";

    const toggle = (newState: string) => {
        pda_backup_store.update((n) => {
            n.type = newState
            return n;
        });

        input_error_store.update((n) => {
            n.type = true;
            return n;
        });
    };


</script>

<div class="toggle-box">
    <div class="toggle-label">Type</div>
    <div class="toggle-switch {$input_error_store.type}">
        <button
                class={$pda_backup_store.type === "empty" ? 'selected' : ''}
                on:click={() => toggle("empty")}
        >
            Empty
        </button>
        <button
                class={$pda_backup_store.type === "both" ? 'selected' : ''}
                on:click={() => toggle("both")}
        >
            Both
        </button>
        <button
                class={$pda_backup_store.type === "final" ? 'selected' : ''}
                on:click={() => toggle("final")}
        >
            Final
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
        width: 10rem;
        background-color: #eee;
        outline: 0.1rem solid #ccc;
        color: #393939;

        border-radius: 2rem;
        /*border-radius: 0.5rem;*/

        overflow: hidden;
        padding: 0.25rem;
    }

    :global(body.dark-mode) .toggle-switch {
        background-color: #2f3941;
        outline: 0.1rem solid #9c81da;
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

        color: #f4f9ff;
        font-synthesis: none;
        font: normal normal 400 medium / 1.5 Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
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

    .false {
        transition: background-color 0.25s;
        background-color: #ff6969 !important;
    }
</style>
