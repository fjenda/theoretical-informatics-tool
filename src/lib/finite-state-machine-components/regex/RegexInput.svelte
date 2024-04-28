<!--
    RegexInput.svelte
    This component is used to input a regex pattern for testing.
    Author: Marek Krúpa
-->

<script lang="ts">

    // Variables
    export let phText : string = "";
    export let regexInputFunction : Function = () => {};
    export const processFunction : Function = processTestInput;
    let input : string = '';

    // Check if the input is valid
    $: if (!/^[a-zA-Z0-9()+.*ε]+$/.test(input) && input !== '') {
        alert("Test input can contain alphanumeric characters and special characters (, ), +, ., * only!");
        input = input.substring(0, input.length - 1);
    }

    // Process the input
    function processTestInput() {
        regexInputFunction(input.trim());
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
