<script lang="ts">
    import { graph_store, resetInputVar } from "../../stores/graphInitStore";
    export let type = 'startState';

    let isOpen = false;
    let selectedOption = '';
    $: options = $graph_store.nodes?.map(node => node.id);

    $: if ($resetInputVar) {
        selectedOption = '';
    }

    function toggleDropdown() {
        isOpen = !isOpen;
    }

    function selectOption(option) {
        selectedOption = option;

        if (type === "startState") {
            graph_store.update((n) => {
                n.startState = option;
                return n;
            });
        }

        isOpen = false;
    }
</script>

<div class="combo-box">
    <div class="selected-option" on:click={toggleDropdown}>
        {selectedOption || 'Start state'}
    </div>
    {#if isOpen}
        <ul class="dropdown active">
            {#each options as option}
                <li class="option" on:click={() => selectOption(option)}>{option}</li>
            {/each}
        </ul>
    {/if}
</div>


<style>
    .combo-box, .dropdown {
        box-sizing: content-box; /* or box-sizing: border-box; */
        width: 7.5rem;
    }

    .combo-box {
        position: relative;
        background: #eee;
        height: fit-content;
        border-radius: 0.5rem;
    }

    .selected-option {
        padding: 0.6rem;
        outline: 0.15rem solid #ccc;
        cursor: pointer;

        /*border-radius: 2rem;*/
        border-radius: 0.5rem;

        text-align: center;
    }

    .dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        outline: 0.15rem solid #ccc;
        background-color: #eee;
        display: none;

        /*border-radius: 2rem;*/
        border-radius: 0.5rem;

        margin: 0; /* Reset margin */
        padding: 0; /* Reset padding */
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