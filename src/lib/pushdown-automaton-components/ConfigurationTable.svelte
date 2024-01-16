<script lang="ts">
    import {graph_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import { fly } from "svelte/transition";

    let traversal = [];
    let word: string[] = [];
    $: if ($graph_store.traversal && $graph_store.traversal.length) {
        // do something when this store value changes

        // get traversal
        traversal = $graph_store.traversal;

        // get word
        word = [$graph_store.word];
        word[0] = word[0].join("");

        for (let i = 0; i < traversal.length; i++) {
            if (word[i][0] === traversal[i].input) {
                if (traversal[i].stackAfter === "E")
                    word.push(word[i].slice(1));
                else
                    word.push(word[i]);
            }
        }

        // connect traversal and word
    }

    $: if ($input_error_store.table) {
        // do something when this store value changes

        // empty traversal
        traversal = [];

        // set to false
        $input_error_store.table = false;
    }
</script>

<table class="styled-table">
    <thead>
        <tr>
            <th>State</th>
            <th>Input</th>
            <th>Stack</th>
            <th>State after</th>
            <th>Stack after</th>
            <th>Left to read</th>
        </tr>
    </thead>
    <tbody>
        {#each traversal as row}
            <tr>
                <td>{row.state}</td>
                <td>{row.input}</td>
                <td>{row.stack}</td>
                <td>{row.stateAfter}</td>
                <td>{row.stackAfter}</td>
                <td>left to read</td>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .styled-table {
        margin: 0 2rem;

        height: 90%;
        /*width: 90%;*/
        min-width: 9.5rem;
        min-height: 15.5rem;

        border-spacing: 0;
        border-radius: 0.5rem;

        overflow: hidden;
        font-size: 0.9em;
        font-family: sans-serif;

        box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
        box-sizing: border-box;

        background-color: #f7f7f8;
    }

    :global(body.dark-mode) .styled-table {
        background-color: #25252d;
        color: #ffffff;
    }

    .styled-table thead tr {
        background-color: #9CC6FB;
        color: #393939;
    }

    :global(body.dark-mode) .styled-table thead tr {
        background-color: #4A3F64;
        color: #ffffff;
    }

    .styled-table th,
    .styled-table td {
        padding: 0.5rem;
    }

    .styled-table tbody tr {
        background-color: #f7f7f8;
        color: #101820;
    }

    :global(body.dark-mode) .styled-table tbody tr {
        background-color: #25252d;
        color: #ffffff;
    }
</style>