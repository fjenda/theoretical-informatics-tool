<!-- MultiSelect.svelte -->
<script>
        import {graph_store, resetInputVar} from "./stores/graphInitStore";

    let selectedOptions = [];

    $: options = $graph_store.nodes?.map(node => node.id);

    $: if ($resetInputVar) {
        selectedOptions = [];
    }

    function handleSelect(event) {
        selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        graph_store.update(n => {
            n.finishState = selectedOptions;
            return n;
        });
    }
</script>

<div class="select-wrapper">
    Final States
    <select multiple bind:value={selectedOptions} on:change={handleSelect}>
        {#each options as option (option)}
            <option value={option}>{option}</option>
        {/each}
    </select>
</div>

<style>
    .select-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    /* Style the select box */
    select {
        width: 7.5rem;
        height: 10.6rem;
        padding: 0.5rem;

        border: 0.1rem solid #ccc;
        border-radius: 0.3rem;

        font-size: 1rem;
        text-align: center;
    }
</style>