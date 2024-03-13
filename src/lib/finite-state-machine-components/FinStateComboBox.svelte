<script lang="ts">
    import {input_error_store} from "../../stores/inputErrorStore";
    import {graph_store, resetInputVar} from "../../stores/graphInitStore";

    export let type = 'startState';

    let isOpen = false;
    let selectedOption = "";
    let selectedOptionsID = "";
    $: options = $graph_store.nodes?.map(node => node);

    $: if ($resetInputVar) {
        selectedOption = "";
    }

    function toggleDropdown() {
        isOpen = !isOpen;
    }

    function selectOption(option) {
        selectedOptionsID = option.id;
        selectedOption = option.label;

        if (type === "startState") {
            graph_store.update((n) => {
                n.startState =  [selectedOptionsID];
                return n;
            });
        }
        console.log($graph_store.startState);

        isOpen = false;
    }
</script>

<div class="combo-box">
    <div class="selected-option {$input_error_store.startState}" on:click={toggleDropdown}>
        {selectedOption || 'Start state'}
    </div>
    {#if isOpen}
        <ul class="dropdown active">
            {#each options as option}
                <li class="option" on:click={() => {
                                             selectOption(option);
                                             input_error_store.update((n) => {
                                                 n.startState = true;
                                                 return n;
                                             });}}>{option.label}</li>
            {/each}
        </ul>
    {/if}
</div>


<style>
    .false {
        transition: background-color 0.25s;
        background-color: #ff0000;
    }

    .combo-box, .dropdown {
        box-sizing: content-box; /* or box-sizing: border-box; */
        width: 7.5rem;
    }

    .combo-box {
        position: relative;
        background: #eee;
        outline: 0.1rem solid #ccc;
        height: fit-content;
        border-radius: 0.5rem;
    }

    :global(body.dark-mode) .combo-box {
        background: #2f3941;
        color: #f4f9ff;
        outline: 0.1rem solid #9c81da;
    }

    .selected-option {
        padding: 0.6rem;
        cursor: pointer;

        /*border-radius: 2rem;*/
        border-radius: 0.5rem;

        text-align: center;
    }

    .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        background-color: #eee;
        display: none;
        outline: 0.1rem solid #ccc;

        /*border-radius: 2rem;*/
        border-radius: 0.5rem;

        margin: 0; /* Reset margin */
        padding: 0; /* Reset padding */
    }

    :global(body.dark-mode) .dropdown {
        outline: 0.1rem solid #9c81da;
        background-color: #2f3941;
    }

    .dropdown.active {
        display: block;
    }

    .option {
        padding: 0.6rem;
        cursor: pointer;
        text-align: center;
        list-style: none;
    }
</style>