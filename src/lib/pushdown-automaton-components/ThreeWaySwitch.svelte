<!-- Toggle.svelte -->
<script lang="ts">
    import { graph_store, resetInputVar } from "../../stores/graphInitStore";
    let toggleState = "empty";

    $: if ($resetInputVar) {
        console.log("toggle");
        // toggle($graph_store.type);
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
                class={$graph_store.type === "empty" ? 'selected' : ''}
                on:click={() => toggle("empty")}
        >
            Empty
        </div>
        <div
                class={$graph_store.type === "both" ? 'selected' : ''}
                on:click={() => toggle("both")}
        >
            Both
        </div>
        <div
                class={$graph_store.type === "final" ? 'selected' : ''}
                on:click={() => toggle("final")}
        >
            Final
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
        width: 10rem;
        background-color: #eee;
        outline: 0.15rem solid #ccc;

        border-radius: 2rem;
        /*border-radius: 0.5rem;*/

        overflow: hidden;
        padding: 0.25rem;
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
</style>
