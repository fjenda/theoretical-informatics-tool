<script lang="ts">
    import { fly } from "svelte/transition";
    import {graph_store} from "../../stores/graphInitStore";
    export let testInputFunction : Function = () => {};
    export const processFunction : Function = processTestInput;
    export let nextFunc : Function = () => {};
    export let previousFunc : Function = () => {};
    export let stopFunc : Function = () => {};

    let input : string = '';
    let showArrows : boolean = false;

    $: if (!/^[a-zA-Z0-9]+$/.test(input) && input !== '') {
        alert("Test input can be made of alphanumeric characters only!")
        input = input.substring(0, input.length - 1);
    }
    function processTestInput() {
        showArrows = true;
        testInputFunction(input.trim().split(""));
    }

    function next() {
        nextFunc();
    }

    function previous() {
        previousFunc();
    }

    function stopTesting() {
        showArrows = false;
        console.log("stop");
        stopFunc();
    }

</script>

<div class="input-box">
    <input id="test-input"
           bind:value={input}
           class="test-input {$graph_store.isAccepted}"
           placeholder="ex. aa">
</div>

{#if showArrows}
    <div class="arrows-box" transition:fly={{ y: 50, duration: 500 }}>
        <div class="arrow left" on:click={() => previous()}></div>
        <div class="stop" on:click={() => stopTesting()}></div>
        <div class="arrow right" on:click={() => next()}></div>
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
        margin: 1rem;
    }

    .test-input {
        text-align: center;
        font-size: 1.8rem;
        height: 5vh;
        width: 10.5vw;

        border-radius: 2.5rem;
        /*border-radius: 0.75rem;*/
    }

    .arrows-box {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
    }

    .stop {
        width: 1.25rem;
        height: 1.25rem;
        background-color: #000;
        margin: 0 1rem;
    }

    .arrow {
        width: 1.25rem;
        height: 1.25rem;
        position: relative;
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
