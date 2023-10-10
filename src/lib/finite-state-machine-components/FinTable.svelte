<script  lang="ts">
    import {configuration_store,graph_store, resetInputVar} from "../stores/graphInitStore";



    let cols = [];
    $: {
        cols = $graph_store.input_alphabet;
        console.log("cols", cols);
    }

    let tableData = [];
    let inputSymbols = [];
    let generated = false;

    let transitions = [];
    $: {
            transitions = $graph_store.transitions;
            // Extract unique nodes and input symbols
            if (typeof transitions !== 'undefined' && generated === false){
                let nodes = Array.from(new Set(transitions.map(t => t.state)));
                inputSymbols = Array.from(new Set(transitions.map(t => t.input)));

                // Initialize the table data


                // Generate the table data
                nodes.forEach(node => {
                    let rowData = { node };
                    inputSymbols.forEach(inputSymbol => {
                        const matchingTransitions = transitions.filter(t => t.state === node && t.input === inputSymbol);
                        const targetStates = matchingTransitions.map(t => t.stateAfter).join(', ');
                        rowData[inputSymbol] = targetStates || '';
                    });
                    tableData.push(rowData);
                });

                console.log("tableData", tableData);
                console.log("inputSymbols", inputSymbols);
                generated = true;
            }

    }



</script>

<table>
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

<style>
    table {
        border-collapse: collapse;
        width: 100%;
    }

    th, td {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
    }

    th {
        background-color: #f2f2f2;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }

    tr:hover {
        background-color: #e5e5e5;
    }
</style>