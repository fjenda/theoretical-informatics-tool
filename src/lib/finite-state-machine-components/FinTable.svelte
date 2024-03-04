<script lang="ts">
    import {graph_store, table_index_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";

    let cols: string[] = [];
    let transitions = [];
    let inputSymbols = [];
    let generated = false;
    let tableData = [];

    $: if ($graph_store.generated == true || $graph_store.currentStatus) {
        // console.log("HEREHERHER");
        // console.log("Current status change: ", $graph_store.currentStatus);
        // do something when this store value changes
        tableData = [];
        // get traversal
        transitions = $graph_store.transitions;

        console.log("input_alphabet", $graph_store.input_alphabet);
        console.log("transitions", transitions);

        if (typeof $graph_store.input_alphabet !== 'undefined'){
            cols = [...$graph_store.input_alphabet];
        }
        // cols = [...$graph_store.input_alphabet];
        // console.log("input_alphabet", $graph_store.input_alphabet);
        // console.log("cols", cols);

        if (typeof transitions !== 'undefined' && generated === false) {
            let nodes = Array.from(new Set(transitions.map(t => t.stateLabel)));
            inputSymbols = Array.from(new Set(transitions.map(t => t.input)));

            // Initialize the table data


            // Generate the table data
            nodes.forEach(node => {
                let rowData = {node};
                inputSymbols.forEach(inputSymbol => {
                    const matchingTransitions = transitions.filter(t => t.stateLabel === node && t.input === inputSymbol);
                    const targetStates = matchingTransitions.map(t => t.stateAfterLabel).join(', ');
                    rowData[inputSymbol] = targetStates || '';
                });


                let node_id = $graph_store.nodes.filter(n => n.label === node)[0].id;

                if ($graph_store.startState.includes(node_id)) {
                    rowData.node = '-> ' +  rowData.node;
                }

                if ($graph_store.finishState.includes(node_id)) {
                    rowData.node = '<- ' + rowData.node;
                }


                tableData.push(rowData);
            });
        }

        $graph_store.generated = false;
    }

    $: if ($input_error_store.table) {
        // do something when this store value changes

        // tableData = [];
        // empty traversal
        transitions = [];

        // set to false
        $input_error_store.table = false;

    }

</script>

<div class="wrapper">
    <table class="styled-table">
        <thead>
        <tr class="styled-row">
            <th>Nodes</th>
            {#if typeof cols !== 'undefined' && cols.length > 0}
                {#each cols as col}
                    <th>{col}</th>
                {/each}
            {/if}
        </tr>
        </thead>
        <tbody>
        {#each tableData as row}
            {#if $graph_store.currentStatus !== undefined &&
            $graph_store.traversal[$graph_store.currentStatus.step +1 ] !== undefined}
                {#if (row.node == '-> ' + $graph_store.traversal[$graph_store.currentStatus.step +1 ].state ||
                    row.node == '<- ' + $graph_store.traversal[$graph_store.currentStatus.step +1].state ||
                    row.node == $graph_store.traversal[$graph_store.currentStatus.step + 1].state)}
                    <tr class="active">
                        <td>{row.node}</td>
                        {#each inputSymbols as symbol}
                            <td>{row[symbol]}</td>
                        {/each}
                    </tr>
                {:else}
                    <tr>
                        <td>{row.node}</td>
                        {#each inputSymbols as symbol}
                            <td>{row[symbol]}</td>
                        {/each}
                    </tr>
                {/if}
            {:else}
                <tr>
                    <td>{row.node}</td>
                    {#each inputSymbols as symbol}
                        <td>{row[symbol]}</td>
                    {/each}
                </tr>
            {/if}
        {/each}
        </tbody>
    </table>
</div>


<style lang="scss">

  //.wrapper {
  //  width: 90%;
  //  height: 90%;
  //
  //  //margin: 0 auto;
  //
  //  //overflow-x: hidden;
  //  overflow: auto;
  //
  //
  //
  //  border-radius: 0.5rem;
  //
  //  box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
  //  box-sizing: border-box;
  //
  //  //min-width: 9.5rem;
  //  //min-height: 15.5rem;
  //}


  .styled-table {
    margin: 0 auto;
    height: 90%;
    width: 90%;
    min-width: 9.5rem;
    min-height: 1rem;
    border-collapse: collapse;
    display: inline-table;
    border-spacing: 0;
    border-radius: 0.5rem;

    overflow: hidden auto;
    font-size: 0.9em;
    font-family: sans-serif;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;

    background-color: #f7f7f8;

    th, td {
      padding: 0.5rem;
      text-align: center;
    }

    tbody tr {
      height: 2rem; /* Set a fixed height for the table rows */
      overflow: hidden; /* Hide any content that exceeds the row height */
      background-color: #f7f7f8;
      color: #101820;
      border-bottom: 1rem;
    }
    tr:nth-child(even) {
      background-color: #f2f2f2;
    }
    
  }

  :global(body.dark-mode) .styled-table {
    background-color: #25252d;
    color: #ffffff;

    thead tr {
      background-color: #4A3F64;
      color: #ffffff;
    }

    tbody tr {
      background-color: #25252d;
      color: #ffffff;
    }

    tr:nth-child(even) {
      background-color: #1f1f25;
    }
  }

  .active {
    background-color: #dddddd !important;
  }

  :global(body.dark-mode) .active {
    background-color: #393939 !important;
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