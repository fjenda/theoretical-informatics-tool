<script lang="ts">
    import {fly} from "svelte/transition";
    import {pda_graph_store, table_index_store} from "../../stores/graphInitStore";

    export let testInputFunction : Function = () => {};
    export const processFunction : Function = processTestInput;
    export let nextFunc : Function = () => {};
    export let previousFunc : Function = () => {};
    export let stopFunc : Function = () => {};

    let input : string = '';
    let showArrows : boolean = false;

    $: if ($pda_graph_store.status === "idle") {
        showArrows = false;
    }

    // $: if (!/^[a-zA-Z0-9]+$/.test(input) && input !== '') {
    //     alert("Test input can be made of alphanumeric characters only!")
    //     input = input.substring(0, input.length - 1);
    // }
    function processTestInput() {
        table_index_store.set(0);

        showArrows = true;
        testInputFunction(input.trim());
    }

    function next() {
        table_index_store.update((table_index) => {
            if (table_index < $pda_graph_store.traversal.length) {
                return table_index + 1;
            } else {
                return table_index;
            }
        });

        // console.log($table_index_store);

        nextFunc();
    }

    function previous() {
        table_index_store.update((table_index) => {
            if (table_index > 0) {
                return table_index - 1;
            } else {
                return table_index;
            }
        });

        previousFunc();
    }

    function stopTesting() {
        showArrows = false;
        // console.log("stop");

        table_index_store.set(-1);

        stopFunc();
    }

    function isInputFocused() {
        const input = document.getElementById("test-input");
        return input === document.activeElement;
    }

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
           class="test-input {$pda_graph_store.isAccepted}"
           placeholder="ex. aa"
           readonly={showArrows}
    >
</div>

{#if showArrows}
    <div class="arrows-box" transition:fly={{ y: -50, duration: 500 }}>
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
        border: 0.05rem solid #101820;
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
        background-color: #000 !important;
        margin: 0 1rem;
        cursor: pointer;
    }

    :global(body.dark-mode) .stop {
        background-color: #f4f9ff !important;
    }

    .arrow {
        width: 1.25rem;
        height: 1.25rem;
        position: relative;
        cursor: pointer;
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
