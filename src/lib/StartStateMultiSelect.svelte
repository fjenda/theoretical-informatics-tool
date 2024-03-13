<script>

    import {graph_store, resetInputVar} from "../stores/graphInitStore";
    import {input_error_store} from "../stores/inputErrorStore";

    let selectedOptions = [];
    let selectedOptionsId = [];
    $: options = $graph_store.nodes?.map(node => node);

    $: if ($resetInputVar) {
        selectedOptions = [];
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
            n.startState = true;
            return n;
        });
        selectedOptionsId = findIDs();
        selectedOptions = Array.from(event.target.selectedOptions, option => option.label);
        graph_store.update(n => {
            n.startState = selectedOptionsId;
            return n;
        });
        console.log("Start states v boxu" + $graph_store.startState)
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