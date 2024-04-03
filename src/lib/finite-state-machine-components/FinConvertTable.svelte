<script lang="ts">
    import {graph_store, table_index_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import type {ConvertorTab} from "../../types/ConvertorTab";

    let cols: string[] = [];
    let alphabet = [];
    let tableData = [];
    let convertedTable : ConvertorTab[] = [];
    let hideTable = true;
    // console.log("convertedTable alpahbet", alphabet);
    //



    $: if ($graph_store.convertDict) {
        alphabet = $graph_store.input_alphabet;
        alphabet = alphabet.filter(function (el) {
            return el != 'ε';
        });

        if (typeof $graph_store.input_alphabet !== 'undefined'){
            cols = [...alphabet];
        }

        // convertedTable.forEach((row) => {
        //     let splitedKey = row.key.split('{');
        //     if (splitedKey.length > 1) {
        //         splitedKey = splitedKey[1].split('}');
        //         splitedKey = splitedKey[0].split(',');
        //         for(let nodeId of splitedKey){
        //             nodeId = nodeId.trim();
        //             if ($graph_store.startState.includes(nodeId)) {
        //                 row.key = '-> ' +  row.key;
        //             }
        //
        //             if ($graph_store.finishState.includes(nodeId)) {
        //                 row.key = '<- ' +  row.key;
        //             }
        //
        //         }
        //     }
        //     // splitedKey = splitedKey[1].split('}');
        //     // splitedKey = splitedKey[0].split(',');
        //     // for(let nodeId of splitedKey){
        //     //     nodeId = nodeId.trim();
        //     //     if ($graph_store.startState.includes(nodeId)) {
        //     //         row.key = '-> ' +  row.key;
        //     //     }
        //     //
        //     //     if ($graph_store.finishState.includes(nodeId)) {
        //     //         row.key = '<- ' +  row.key;
        //     //     }
        //     //
        //     // }
        // });

        convertedTable = $graph_store.convertDict;


        console.log("convertedTable IN TABLE: ", convertedTable);
    }

    $: if ($graph_store.hideConvertTable != hideTable) {
        hideTable = $graph_store.hideConvertTable;
    }

</script>

<div hidden={hideTable} class="wrapper">
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
            {#each convertedTable as row}
                <div class="tableRow">
                    <div class="tableCell">{row.key}</div>
                    {#each row.values as symbol}
                        <div class="tableCell">{symbol}</div>
                    {/each}
                </div>
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
  //
  //
  //.styled-table {
  //  margin: 0 auto;
  //  height: 90%;
  //  width: 90%;
  //  min-width: 9.5rem;
  //  min-height: 1rem;
  //  border-collapse: collapse;
  //  display: inline-table;
  //  border-spacing: 0;
  //  border-radius: 0.5rem;
  //
  //  overflow: hidden auto;
  //  font-size: 0.9em;
  //  font-family: sans-serif;
  //
  //  box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
  //  box-sizing: border-box;
  //
  //  background-color: #f7f7f8;
  //
  //  th, td {
  //    padding: 0.5rem;
  //    text-align: center;
  //  }
  //
  //  tbody tr {
  //    height: 2rem; /* Set a fixed height for the table rows */
  //    overflow: hidden; /* Hide any content that exceeds the row height */
  //    background-color: #f7f7f8;
  //    color: #101820;
  //    border-bottom: 1rem;
  //  }
  //  tr:nth-child(even) {
  //    background-color: #f2f2f2;
  //  }
  //
  //}
  //
  //:global(body.dark-mode) .styled-table {
  //  background-color: #25252d;
  //  color: #ffffff;
  //
  //  thead tr {
  //    background-color: #4A3F64;
  //    color: #ffffff;
  //  }
  //
  //  tbody tr {
  //    background-color: #25252d;
  //    color: #ffffff;
  //  }
  //
  //  tr:nth-child(even) {
  //    background-color: #1f1f25;
  //  }
  //}
  //
  //.active {
  //  background-color: #dddddd !important;
  //}
  //
  //:global(body.dark-mode) .active {
  //  background-color: #393939 !important;
  //}
  //
  //:global(body.dark-mode) .styled-table {
  //  background-color: #25252d;
  //  color: #ffffff;
  //}
  //
  //.styled-table thead tr {
  //  background-color: #9CC6FB;
  //  color: #393939;
  //}
  //
  //:global(body.dark-mode) .styled-table thead tr {
  //  background-color: #4A3F64;
  //  color: #ffffff;
  //}
  //
  //.styled-table th,
  //.styled-table td {
  //  padding: 0.5rem;
  //}
  //
  //.styled-table tbody tr {
  //  background-color: #f7f7f8;
  //  color: #101820;
  //}
  //
  //:global(body.dark-mode) .styled-table tbody tr {
  //  background-color: #25252d;
  //  color: #ffffff;
  //}

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