<script lang="ts">

    import {fly} from 'svelte/transition';
    import {graph_store} from "../../../stores/graphInitStore";

    export let phText : string = "";

    export let regexInputFunction : Function = () => {};

    export const processFunction : Function = processTestInput;
    //
    // export let nextFunc : Function = () => {};
    //
    // export let previousFunc : Function = () => {};
    //
    // export let stopFunc : Function = () => {};

    let input : string = '';
    // let showArrows : boolean = false;

    // $: if (!/^[a-zA-Z0-9]+$/.test(input) && input !== '') {
    //     alert("Test input can be made of alphanumeric characters only!")
    //     input = input.substring(0, input.length - 1);
    // }

    function processTestInput() {
        regexInputFunction(input.trim());
        // showArrows = true;
        // testInputFunction(input.trim().split(""));
    }

</script>

<div class="input-box">
    <input id="test-input"
           bind:value={input}
           class="test-input"
           placeholder={phText}/>
</div>


<style>
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


</style>
