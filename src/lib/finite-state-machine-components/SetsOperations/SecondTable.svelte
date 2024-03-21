<script lang="ts">
    import {second_graph_store} from "../../../stores/graphInitStore";
    import {input_error_store} from "../../../stores/inputErrorStore";

    let cols: string[] = [];
    let transitions = [];
    let inputSymbols = [];
    let generated = false;
    let tableData = [];
    let nodesMeta = [];

    $: if ($second_graph_store.generated == true || $second_graph_store.currentStatus) {
        tableData = [];
        // get traversal
        transitions = $second_graph_store.transitions;
        nodesMeta = $second_graph_store.nodes;

        console.log("input_alphabet", $second_graph_store.input_alphabet);
        console.log("transitions", transitions);

        let alphabet = $second_graph_store.input_alphabet;
        if (alphabet.includes('ε')) {
            alphabet.splice(alphabet.indexOf('ε'), 1);
            alphabet.push('ε');
        }


        if (typeof $second_graph_store.input_alphabet !== 'undefined'){
            cols = [...alphabet];
        }

        if (typeof transitions !== 'undefined' && generated === false) {
            let nodes = Array.from(new Set(nodesMeta.map(t => t.label)));
            inputSymbols = Array.from(new Set(transitions.map(t => t.input)));
            if (inputSymbols.includes('ε')) {
                inputSymbols.splice(inputSymbols.indexOf('ε'), 1);
                inputSymbols.push('ε');
            }

            // Generate the table data
            nodes.forEach(node => {
                let rowData = {node};
                inputSymbols.forEach(inputSymbol => {
                    const matchingTransitions = transitions.filter(t => t.stateLabel === node && t.input === inputSymbol);
                    const targetStates = matchingTransitions.map(t => t.stateAfterLabel).join(', ');
                    rowData[inputSymbol] = targetStates || '';
                });


                let node_id = $second_graph_store.nodes.filter(n => n.label === node)[0].id;

                if ($second_graph_store.startState.includes(node_id)) {
                    rowData.node = '-> ' +  rowData.node;
                }

                if ($second_graph_store.finishState.includes(node_id)) {
                    rowData.node = '<- ' + rowData.node;
                }


                tableData.push(rowData);
                console.log("tableData", tableData);
            });

            //if in table data is node and empty stiong fill it with -
            tableData.forEach(row => {
                inputSymbols.forEach(inputSymbol => {
                    if (row[inputSymbol] === '') {
                        row[inputSymbol] = '-';
                    }
                });
            });
        }

        $second_graph_store.generated = false;
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
    <div class="table">
        <div class="tableHead">
            <div class="tableRow">
                <div class="tableHeadCell">Nodes</div>
                {#if typeof cols !== 'undefined' && cols.length > 0}
                    {#each cols as col}
                        <div class="tableHeadCell">{col}</div>
                    {/each}
                {/if}
            </div>
        </div>
        <div class="tableBody">
            {#each tableData as row}
                {#if $second_graph_store.currentStatus !== undefined &&
                $second_graph_store.traversal[$second_graph_store.currentStep + 1 ] !== undefined}
                    {#if (row.node == '-> ' + $second_graph_store.traversal[$second_graph_store.currentStep +1 ].stateLabel ||
                        row.node == '<- ' + $second_graph_store.traversal[$second_graph_store.currentStep +1 ].stateLabel ||
                        row.node == $second_graph_store.traversal[$second_graph_store.currentStep +1 ].stateLabel)}
                        <div class="tableRow active">
                            <div class="tableCell">{row.node}</div>
                            {#each inputSymbols as symbol}
                                <div class="tableCell">{row[symbol]}</div>
                            {/each}
                        </div>
                    {:else}
                        <div class="tableRow">
                            <div class="tableCell">{row.node}</div>
                            {#each inputSymbols as symbol}
                                <div class="tableCell">{row[symbol]}</div>
                            {/each}
                        </div>
                    {/if}
                {:else}
                    <div class="tableRow">
                        <div class="tableCell">{row.node}</div>
                        {#each inputSymbols as symbol}
                            <div class="tableCell">{row[symbol]}</div>
                        {/each}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style lang="scss">

  .wrapper{
    width: 24vw;
    height: 34.2vh;

    min-height: 15.5rem;
    border-radius: 0.5rem;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;

    //margin: 0 auto;

    overflow: visible scroll;
  }

  @media screen and (max-width: 1000px) and (min-width: 768px) {
    .wrapper {
      margin: 0.5rem auto;
      width: 45vw;
      height: 33.2vh;
    }
  }

  @media screen and (max-width: 768px) {
    .wrapper {
      width: 95vw;
      height: 40vh;
      margin: 0.5rem auto;
    }
  }

  .active {
    background-color: #dddddd !important;
  }

  :global(body.dark-mode) .active {
    background-color: #393939 !important;
  }

  .table {
    display: table;
    width: 100%;
    height: 100%;

    background-color: #f4f9ff;
    color: #393939;
  }

  :global(body.dark-mode) .table {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .tableHead {
    display: table-header-group;

    position: sticky;
    top: 0;

    z-index: 10;

    background-color: #9CC6FB;
    color: #393939;
  }

  :global(body.dark-mode) .tableHead {
    background-color: #4A3F64;
    color: #f4f9ff;
  }

  .tableBody {
    display: table-row-group;
  }

  :global(body.dark-mode) .tableBody {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .tableRow {
    display: table-row;
  }

  :global(body.dark-mode) .tableRow {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .tableCell {
    display: table-cell;
    vertical-align: inherit;
  }

  .tableHeadCell, .tableCell {
    display: table-cell;
    padding: 0.5rem;
    text-align: center;
    vertical-align: middle;
  }

  .tableHeadCell{
    font-weight: bold;
    background-color: #9CC6FB;
    color: #393939;
    height: 1rem;
  }

  :global(body.dark-mode) .tableHeadCell {
    background-color: #4A3F64;
    color: #f4f9ff;
  }

  .tableRow:nth-child(even) {
    background-color: #f2f2f2;
  }

  :global(body.dark-mode) .tableRow:nth-child(even) {
    background-color: #1f1f25;
  }

</style>