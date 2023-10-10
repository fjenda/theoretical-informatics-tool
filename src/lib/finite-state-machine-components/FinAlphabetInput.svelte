<script lang="ts">

    import {fly} from 'svelte/transition';

    export let phText : string = "";

    export let testInputFunction : Function = () => {};

    export const processFunction : Function = processTestInput;

    export let nextFunc : Function = () => {};

    export let previousFunc : Function = () => {};

    export let stopFunc : Function = () => {};

    let input : string = '';
    let showArrows : boolean = false;

    // $: if (!/^[a-zA-Z0-9]+$/.test(input) && input !== '') {
    //     alert("Test input can be made of alphanumeric characters only!")
    //     input = input.substring(0, input.length - 1);
    // }

    function processTestInput() {
        console.log("Getted here");
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
    <input bind:value={input} class="test-input" placeholder={phText}>
</div>


<style>
    .input-box {
        text-align: center;
        margin: 1rem 0;
    }

    .test-input {
        text-align: center;
        font-size: 1.3rem;
        height: 5vh;
        width: 10.5vw;
        border-radius: 2.5rem;
    }

    .arrows-box {
        display: flex;
        justify-content: center;
        margin-top: 1rem;
    }

    .stop {
        width: 20px;
        height: 20px;
        background-color: #000;
        margin: 0 1rem;
    }

    .arrow {
        width: 20px;
        height: 20px;
        position: relative;
    }

    .left::before {
        content: '';
        border-width: 10px 10px 10px 0;
        border-color: transparent #000 transparent transparent;
        border-style: solid;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
    }

    .right::before {
        content: '';
        border-width: 10px 0 10px 10px;
        border-color: transparent transparent transparent #000;
        border-style: solid;
        position: absolute;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
    }
</style>
