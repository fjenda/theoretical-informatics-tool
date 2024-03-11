<script lang="ts">
    import {graph_store, table_index_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import {tooltip} from "../tooltipUtils";

    // state, input, stack, ruleNumber, rule, rowNumber
    let tableData: [string, [string], [string], [number], TransitionMeta, number][] = [];

    let traversal = [];

    let wordBackup: string = "";
    let word: string = "";

    let stackBackup: string[] = [];
    let stack: string[] = [];

    $: if ($table_index_store === -1) {
        tableData = [];
    }

    $: if ($graph_store.traversal) {
        tableData = [];

        if ($graph_store.traversal.length) {
            // get traversal
            traversal = $graph_store.traversal;

            // get word
            wordBackup = $graph_store.word.join("");

            // find the first rule that will be used from traversal
            let firstRuleIndex = $graph_store.transitions.findIndex((transition) => {
                return transition === traversal[0];
            });

            // check if rule exists
            let firstRule;
            if (firstRuleIndex !== -1) {
                firstRule = $graph_store.transitions[firstRuleIndex];
                firstRuleIndex++;
            }

            // check if word is longer than 10 chars
            if (wordBackup.length > 10) {
                word = wordBackup.slice(0, 7) + "...";
            } else {
                word = wordBackup;
            }


            // push the initial configuration into tableData
            tableData.push([$graph_store.startState, word, $graph_store.stackBottom, firstRuleIndex ? firstRuleIndex : "#", firstRule ? firstRule : "", 0]);

            for (let i = 0; i < traversal.length; i++) {
                // rule about to be used
                let nextRuleIndex, nextRule;
                if (i !== traversal.length - 1) {
                    nextRuleIndex = $graph_store.transitions.findIndex((transition) => {
                        return transition === traversal[i + 1];
                    });

                    if (nextRuleIndex !== -1)
                        nextRule = $graph_store.transitions[nextRuleIndex];

                    nextRuleIndex++;
                }

                // characters remaining
                if (traversal[i].input === "ε") {
                    word = wordBackup
                } else {
                    word = wordBackup.slice(1);
                }

                // save word for next transition
                wordBackup = word;

                // if word is empty
                if (!word.length) {
                    word = "Ø";
                } else if (word.length > 10) { // if word is too long (> 10 chars)
                    word = word.slice(0, 7) + "...";
                }

                // stack
                if (traversal[i].stackAfter[0] === "ε") { // pop (from the front)
                    stack = stackBackup.slice(1);
                } else if (traversal[i].stackAfter[0] !== "ε") { // push (to the front) and dont push the last symbol in the stack
                    stack = traversal[i].stackAfter.concat(stackBackup.slice(1));
                }
                console.log(`${traversal[i].stackAfter[0]} -> ${stack}`);


                // if stack is empty
                if (stack.length === 0) {
                    stack = ["Ø"];
                } else if (stack.length > 10) { // if stack is too long (> 10 chars)
                    stack = stack.slice(0, 7);
                    stack.push("...");
                }

                // save stack for next transition
                stackBackup = stack;

                // push to table data
                tableData.push([traversal[i].stateAfter, word, stack.join(""), nextRuleIndex ? nextRuleIndex : "#", nextRule ? nextRule : "", i + 1]);
            }
        } else {
            if ($graph_store.word) {
                if ($graph_store.word.length > 10) {
                    word = $graph_store.word.slice(0, 7) + "...";
                } else {
                    word = $graph_store.word.join("");
                }
                // push the initial configuration into tableData
                tableData.push([$graph_store.startState, $graph_store.word.join(""), $graph_store.stackBottom, "#", "", 0]);
            }
        }


        console.log(tableData);
        // reset vars
        resetVars();
    }

    $: if ($input_error_store.table) {

        // empty traversal
        traversal = [];

        // set to false
        $input_error_store.table = false;
    }

    function resetVars() {
        // empty traversal
        traversal = [];

        // empty word
        wordBackup = "";
        word = "";

        // empty stack
        stackBackup = [];
        stack = [];
    }
</script>

<div class="wrapper">
    <div class="divTable">
        <div class="divTableHeading">
            <div class="divTableRow">
                <div class="divTableHead">State</div>
                <div class="divTableHead">Input</div>
                <div class="divTableHead">Stack</div>
                <div class="divTableHead">Rule</div>
            </div>
        </div>
        <div class="divTableBody">
            {#each tableData as row, i}
                {#if row[5] === $table_index_store}
                    <div class="divTableRow active">
                        <div class="divTableCell">{row[0]}</div>
                        <div class="divTableCell">{row[1]}</div>
                        <div class="divTableCell">{row[2]}</div>
                        {#if row[3] === "#" || row[3] === -1}
                            <div class="divTableCell">{row[3]}</div>
                        {:else}
                            <div class="divTableCell tooltip-wrapper">
                                <span use:tooltip={`δ(${row[4].state}, ${row[4].input}, ${row[4].stack}) → (${row[4].stateAfter}, ${row[4].stackAfter.join("")})`}>{row[3]}</span>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div class="divTableRow">
                        <div class="divTableCell">{row[0]}</div>
                        <div class="divTableCell">{row[1]}</div>
                        <div class="divTableCell">{row[2]}</div>
                        {#if row[3] === "#" || row[3] === -1}
                            <div class="divTableCell">{row[3]}</div>
                        {:else}
                            <div class="divTableCell tooltip-wrapper">
                                <span use:tooltip={`δ(${row[4].state}, ${row[4].input}, ${row[4].stack}) → (${row[4].stateAfter}, ${row[4].stackAfter.join("")})`}>{row[3]}</span>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style lang="scss">

  .wrapper {
    width: 30vw;
    height: 37.75vh;

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

  //table {
  //  overflow: visible auto;
  //}
  //
  //.styled-table {
  //  height: 100%;
  //  width: 100%;
  //
  //  z-index: 100;
  //
  //  position: relative;
  //
  //  //min-width: 9.5rem;
  //  //min-height: 15.5rem;
  //
  //  border-spacing: 0;
  //
  //  font-size: 0.9em;
  //  font-family: sans-serif;
  //
  //  background-color: #f7f7f8;
  //
  //  table-layout: auto;
  //
  //  border-collapse: separate;
  //
  //
  //  thead tr {
  //    background-color: #9CC6FB;
  //    color: #393939;
  //
  //    position: sticky;
  //    top: 0;
  //
  //    z-index: 1;
  //  }
  //
  //  th, td {
  //    padding: 0.5rem;
  //  }
  //
  //  tbody tr {
  //    background-color: #f7f7f8;
  //    color: #101820;
  //    text-align: center;
  //  }
  //
  //  tr:nth-child(even) {
  //    background-color: #f2f2f2;
  //  }
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
  //@media screen and (max-width: 1023px) and (min-width: 768px) {
  //  .wrapper {
  //    margin: 0.5rem auto;
  //  }
  //}
  //
  //@media screen and (max-width: 768px) {
  //  .wrapper {
  //    width: 95%;
  //    height: 95%;
  //    margin: 0.5rem auto;
  //  }
  //}

  :global(.tooltip) {
    white-space: nowrap;
    position: relative;
    padding-top: 0.35rem;
    cursor: pointer;
    border-bottom: 1px solid currentColor;
  }

  :global(#tooltip) {
    z-index: 999;
    position: absolute;
    bottom: inherit;
    left: inherit;
    transform: translate(-110%, -22.5%);
    padding: 0.2rem 0.35rem;
    background: #F4F8FF;
    color: #333333;
    font-size: 1rem;
    border-radius: 0.25rem;
    filter: drop-shadow(0 1px 2px hsla(0, 0%, 0%, 0.2));
    width: max-content;
  }

  :global(body.dark-mode #tooltip) {
    background: #333333;
    outline: 0.125rem solid #4A3F64;
    color: #F4F8FF;
  }

  //:global(.tooltip:not(:focus) #tooltip::before) {
  //  content: '';
  //  position: absolute;
  //  top: 100%;
  //  left: 50%;
  //  transform: translateX(-50%);
  //  width: 0.6em;
  //  height: 0.25em;
  //  background: inherit;
  //  clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
  //}

  .divTable {
    display: table;
    width: 100%;
    height: 100%;

    background-color: #f4f9ff;
    color: #393939;
  }

  :global(body.dark-mode) .divTable {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .divTableHeading {
    display: table-header-group;

    position: sticky;
    top: 0;

    z-index: 10;

    background-color: #9CC6FB;
    color: #393939;
  }

  :global(body.dark-mode) .divTableHeading {
    background-color: #4A3F64;
    color: #f4f9ff;
  }

  .divTableBody {
    display: table-row-group;
  }

  :global(body.dark-mode) .divTableBody {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .divTableRow {
    display: table-row;
  }

  :global(body.dark-mode) .divTableRow {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .divTableHead, .divTableCell {
    display: table-cell;
    padding: 0.5rem;
    text-align: center;
    vertical-align: middle;
  }

  .divTableHead {
    font-weight: bold;
    background-color: #9CC6FB;
    color: #393939;
    height: 1rem;
  }

  :global(body.dark-mode) .divTableHead {
    background-color: #4A3F64;
    color: #f4f9ff;
  }

  //.divTableCell {
  //  background-color: #f7f7f8;
  //  color: #101820;
  //}
  //
  //:global(body.dark-mode) .divTableCell {
  //  background-color: #25252d;
  //  color: #f4f9ff;
  //}

  .divTableRow:nth-child(even) {
    background-color: #f2f2f2;
  }

  :global(body.dark-mode) .divTableRow:nth-child(even) {
    background-color: #1f1f25;
  }
</style>