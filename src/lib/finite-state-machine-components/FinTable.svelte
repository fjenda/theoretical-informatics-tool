<script  lang="ts">
    import {graph_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";

    let cols = [];
    let transitions = [];
    let inputSymbols = [];
    let generated = false;
    let tableData = [];

    $: if ($graph_store.transitions && $graph_store.transitions.length) {
        // do something when this store value changes

        // get traversal
        transitions = $graph_store.transitions;
        console.log("cols", cols);

        // get word
        cols = [$graph_store.input_alphabet];

        if (typeof transitions !== 'undefined' && generated === false) {
            let nodes = Array.from(new Set(transitions.map(t => t.state)));
            inputSymbols = Array.from(new Set(transitions.map(t => t.input)));

            // Initialize the table data


            // Generate the table data
            nodes.forEach(node => {
                let rowData = {node};
                inputSymbols.forEach(inputSymbol => {
                    const matchingTransitions = transitions.filter(t => t.state === node && t.input === inputSymbol);
                    const targetStates = matchingTransitions.map(t => t.stateAfter).join(', ');
                    rowData[inputSymbol] = targetStates || '';
                });
                tableData.push(rowData);
            });
        }
    }

    $: if ($input_error_store.table) {
        // do something when this store value changes

        // empty traversal
        transitions = [];

        // set to false
        $input_error_store.table = false;
    }

</script>

<table class="styled-table">
    <thead>
    <tr>
        <th>Nodes</th>
        {#if typeof cols !== 'undefined'}
            {#each cols as col}
                <th>{col}</th>
            {/each}
        {/if}
    </tr>
    </thead>
    <tbody>
        {#each tableData as row}
            <tr>
                <td>{row.node}</td>
                {#each inputSymbols as symbol}
                    <td>{row[symbol]}</td>
                {/each}
            </tr>
        {/each}
    </tbody>
</table>

<style lang="scss">
    .styled-table {
    margin: 0 auto;

    height: 90%;
    width: 90%;
    min-width: 9.5rem;
    min-height: 15.5rem;

    border-spacing: 0;
    border-radius: 0.5rem;

    overflow: hidden auto;
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
    /*table {*/
    /*    border-collapse: collapse;*/
    /*    width: 100%;*/
    /*}*/

    /*th, td {*/
    /*    border: 1px solid #dddddd;*/
    /*    text-align: left;*/
    /*    padding: 8px;*/
    /*}*/

    /*th {*/
    /*    background-color: #f2f2f2;*/
    /*}*/

    /*tr:nth-child(even) {*/
    /*    background-color: #f2f2f2;*/
    /*}*/

    /*tr:hover {*/
    /*    background-color: #e5e5e5;*/
    /*}*/
</style>