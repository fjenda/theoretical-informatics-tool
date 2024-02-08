<script lang="ts">
    import {user_grammar_store} from "../../stores/graphInitStore";

    let input: string = "";

    $: if (input) {
        parseInput();
    }

    function parseInput() {
        let parsed = input
            .split('\n')
            .map((line: string) => line.trim().split(''));

        user_grammar_store.update((n) => {
            n.validateInputs(parsed);
            return n;
        });
    }
</script>

<textarea id="cfg-input"
          bind:value={input}
          rows="5"
          placeholder="{'1+1\n3+1\n1+4\n4+3\n(one test string per line)'}" />

<style>
    #cfg-input {
        width: 90%;
        height: 70%;

        border-radius: 0.5rem;

        background-color: #eee;
        border: 0.1rem solid #ccc;
        color: #393939;

        resize: none;
    }

    :global(body.dark-mode) #cfg-input {
        border: 0.1rem solid #9c81da;
        background-color: #2f3941;
        color: #f4f9ff;
    }


</style>