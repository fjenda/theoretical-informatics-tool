<script lang="ts">
    import {user_grammar_store} from "../../stores/graphInitStore";

    let input: string = "";

    // Function that parses the input inside the text area
    function parseInput() {
        // split by new line and split the strings
        let parsed = input
            .split('\n')
            .map((line: string) => line.split(''));

        // check for empty strings
        parsed.forEach((line: string[], index) => {
            if (line.length < 1) {
                parsed[index] = [""];
            }
        });


        // calling a function to check the inputs
        user_grammar_store.update((n) => {
            n.validateInputs(parsed);
            return n;
        });
    }
</script>

<!-- Text area for the input strings -->
<textarea id="cfg-input"
          bind:value={input}
          on:input={() => parseInput()}
          rows="5"
          placeholder="{'1+1\n3+1\n1+4\n4+3\n(one test string per line)'}"/>

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