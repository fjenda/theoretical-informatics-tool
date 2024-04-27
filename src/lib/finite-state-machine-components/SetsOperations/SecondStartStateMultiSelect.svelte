<!--
    SecondStartStateMultiSelect.svelte
    This component is used to select multiple start states in the second graph.
    Author: Marek Krúpa
-->

<script>

    import {input_error_store} from "../../../stores/inputErrorStore";
    import {resetInputVar, second_graph_store} from "../../../stores/graphInitStore";

    // Variables
    let selectedOptions = [];
    let selectedOptionsId = [];

    // Get options from the second graph nodes
    $: options = $second_graph_store.nodes?.map(node => node);

    // Reset selected options
    $: if ($resetInputVar) {
        selectedOptions = [];
    }

    // Function to find IDs of selected options
    function findIDs() {
        let finalStates = [];
        for (let i = 0; i < selectedOptions.length; i++) {
            for (let j = 0; j < options.length; j++) {
                if (selectedOptions[i] === options[j].label) {
                    finalStates.push(options[j].id);
                }
            }
        }
        return finalStates;
    }

    // Function to handle select event
    function handleSelect(event) {
        input_error_store.update((n) => {
            n.startState = true;
            return n;
        });
        selectedOptionsId = findIDs();
        selectedOptions = Array.from(event.target.selectedOptions, option => option.label);
        second_graph_store.update(n => {
            n.startState = selectedOptionsId;
            return n;
        });
    }
</script>

<div class="select-wrapper">
    Start States
    <select class={$input_error_store.startState} multiple bind:value={selectedOptions} on:change={handleSelect}>
        {#each options as option (option)}
            <option value={option.label}>{option.label}</option>
        {/each}
    </select>
</div>

<style>
    .false {
        transition: background-color 0.25s;
        background-color: #ff0000;
    }

    .select-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    select {
        width: 7.5rem;
        height: 5.9rem;
        padding: 0.5rem;

        border: 0.1rem solid #ccc;
        border-radius: 0.3rem;

        font-size: 1rem;
        text-align: center;

        background-color: #eee;
    }

    :global(body.dark-mode) select {
        background-color: #2f3941;
        color: #f4f9ff;
        border: 0.1rem solid #9c81da;
    }
</style>