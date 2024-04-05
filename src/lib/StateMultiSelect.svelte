<script>

    import {graph_store, resetInputVar} from "../stores/graphInitStore";
    import {input_error_store} from "../stores/inputErrorStore";

    let selectedOptions = [];
    let selectedOptionsId = [];
    let selectHeight = "10.6rem"; // Výchozí výška

    $: options = $graph_store.nodes?.map(node => node);

    $: if ($resetInputVar) {
        selectedOptions = [];
    }

    $: if ($graph_store.type === "DFA") {
        selectHeight = "10.6rem"; // Výška pro typ DFA
    } else if ($graph_store.type === "NFA") {
        selectHeight = "5.9rem"; // Výška pro typ NFA
    } else {
        selectHeight = "10.6rem"; // Výška pro ostatní typy
    }

    function findIDs(){
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

    function handleSelect(event) {
        input_error_store.update((n) => {
            n.finishState = true;
            return n;
        });
        selectedOptionsId = findIDs();
        selectedOptions = Array.from(event.target.selectedOptions, option => option.label);
        // console.log(selectedOptionsId);
        // console.log(selectedOptions);
        graph_store.update(n => {
            n.finishState = selectedOptionsId;
            return n;
        });
    }
</script>

<div class="select-wrapper">
    Final States
    <select class={$input_error_store.finishState} style="height: {selectHeight}" multiple bind:value={selectedOptions} on:change={handleSelect}>
        {#each options as option (option)}
            <option value={option.label}>{option.label}</option>
        {/each}
    </select>
</div>

<style>
    .false {
        transition: background-color 0.25s;
        background-color: #ff6969 !important;
    }

    .select-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    }

    select {
        width: 7.5rem;
        /*height: 5.9rem;*/
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