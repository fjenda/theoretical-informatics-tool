<!--
    ResultTestInput.svelte
    This component is used to test the input string on the finite automaton, in
    SetOperations
    Author: Marek Krúpa
-->

<script lang="ts">

    import {fly} from 'svelte/transition';
    import {result_graph_store} from "../../../stores/graphInitStore";

    // Variables
    export let phText : string = "";
    export let testInputFunction : Function = () => {};
    export const processFunction : Function = processTestInput;
    export let nextFunc : Function = () => {};
    export let previousFunc : Function = () => {};
    export let stopFunc : Function = () => {};
    let input : string = '';
    let showArrows : boolean = false;

    // Check if the input is alphanumeric
    $: if (!/^[a-zA-Z0-9]+$/.test(input) && input !== '') {
        alert("Test input can be made of alphanumeric characters only!")
        input = input.substring(0, input.length - 1);
    }

    // Function to process the input
    function processTestInput() {
        showArrows = true;
        testInputFunction(input.trim().split(""));
    }

    // Function to move to the next
    function next() {
        nextFunc();
    }

    // Function to move to the previous
    function previous() {
        previousFunc();
    }

    // Function to stop testing
    function stopTesting() {
        showArrows = false;
        stopFunc();
    }

    // Function to check if the input is focused
    function isInputFocused() {
        const input = document.getElementById("test-input");
        return input === document.activeElement;
    }

    // Function to handle keydown events
    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && isInputFocused()) {
            processTestInput();
            return;
        }

        if (!showArrows) return;

        if (e.key === "ArrowRight") {
            next();
        } else if (e.key === "ArrowLeft") {
            previous();
        } else if (e.key === "Escape") {
            stopTesting();
        }
    }

</script>

<svelte:window on:keydown={onKeydown}/>

<div class="input-box">
    <input id="test-input"
           bind:value={input}
           class="test-input {$result_graph_store.isAccepted}"
           placeholder={phText}/>
</div>

{#if showArrows}
    <div class="arrows-box" transition:fly={{ y: 50, duration: 500 }}>
        <button class="arrow left" on:click={() => previous()}></button>
        <button class="stop" on:click={() => stopTesting()}></button>
        <button class="arrow right" on:click={() => next()}></button>
    </div>
{/if}

<style>
    .true {
        transition: background-color 0.25s;
        background-color: #00ff00;
    }

    .false {
        transition: background-color 0.25s;
        background-color: #ff0000;
    }

    .input-box {
        text-align: center;
        /*margin: 1rem;*/
        padding-top: 1rem;
    }

    .test-input {
        text-align: center;
        font-size: 1.8rem;
        height: 5vh;
        width: 60%;

        min-width: 7.5rem;
        min-height: 2.5rem;

        border-radius: 0.5rem;
        border: 0.125rem solid #101820;
    }

    .arrows-box {
        display: flex;
        justify-content: center;
        margin: 1rem 0;
    }

    .arrows-box > button {
        background: none;
        border: none;
    }

    .stop {
        width: 1.25rem;
        height: 1.25rem;
        background-color: #000;
        margin: 0 1rem;
    }

    :global(body.dark-mode) .stop {
        background-color: #f4f9ff;
    }

    .arrow {
        width: 1.25rem;
        height: 1.25rem;
        position: relative;
    }

    :global(body.dark-mode) .left::before {
        border-color: transparent #f4f9ff transparent transparent;
    }

    :global(body.dark-mode) .right::before {
        border-color: transparent transparent transparent #f4f9ff;
    }

    .left::before {
        content: '';
        border-width: 0.625rem 0.625rem 0.625rem 0;
        border-color: transparent #000 transparent transparent;
        border-style: solid;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
    }

    .right::before {
        content: '';
        border-width: 0.625rem 0 0.625rem 0.625rem;
        border-color: transparent transparent transparent #000;
        border-style: solid;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
    }
</style>
