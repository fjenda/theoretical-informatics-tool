<!--
    StateComboBox.svelte
    This component is used to select the start state of the PDA.
    Author: Jan Fojtík
-->

<script lang="ts">
    import {input_error_store} from "../../stores/inputErrorStore";
    import {pda_backup_store, resetInputVar} from "../../stores/graphInitStore";
    import type {GraphNodeMeta} from "../../types/GraphNodeMeta";

    export let type = 'startState';
    export let options: GraphNodeMeta[] = [];

    let isOpen = false;
    let selectedOption = "";

    $: if ($resetInputVar) {
        selectedOption = "";
    }

    $: if (!options || options.length === 0) {
        options = [];
    }

    // Function to toggle the dropdown
    function toggleDropdown() {
        if (options.length === 0) {
            return;
        }

        isOpen = !isOpen;
    }

    // Function to select the option
    function selectOption(option: GraphNodeMeta) {
        selectedOption = option.label;

        if (type === "startState") {
            pda_backup_store.update((n) => {
                n.startState = selectedOption;
                return n;
            });
        }

        isOpen = false;
    }
</script>

<div class="combo-box">
    <button class="selected-option {$input_error_store.startState}" on:click={toggleDropdown}>
        {selectedOption || 'Start state'}
    </button>
    {#if isOpen}
        <ul class="dropdown active">
            {#each options as option}
                <button class="option" on:click={() => {
                                             selectOption(option);
                                             input_error_store.update((n) => {
                                                 n.startState = true;
                                                 return n;
                                             });}}>{option.label}</button>
            {/each}
        </ul>
    {/if}
</div>


<style>
    .false {
        transition: background-color 0.25s;
        background-color: #ff6969 !important;
    }

    :global(body.dark-mode) .option {
        color: #f4f9ff;
    }

    .combo-box, .dropdown {
        color: #101820;
        box-sizing: content-box;
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

    :global(body.dark-mode) .selected-option {
        color: #f4f9ff;
    }

    .selected-option {
        color: #101820;
        padding: 0.6rem;
        cursor: pointer;

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

        border-radius: 0.5rem;

        margin: 0;
        padding: 0;
    }

    :global(body.dark-mode) .dropdown {
        outline: 0.1rem solid #9c81da;
        background-color: #2f3941;
    }

    .dropdown.active {
        display: block;
    }

    .option {
        color: #101820;
        padding: 0.6rem;
        cursor: pointer;
        text-align: center;
        list-style: none;
    }

    button {
        width: 100%;
        height: 100%;

        background: none;
        border: none;

        color: #f4f9ff;
        font-synthesis: none;
        font: normal normal 400 medium / 1.5 Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
    }
</style>