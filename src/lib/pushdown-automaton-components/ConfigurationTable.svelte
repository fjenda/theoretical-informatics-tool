<!--
    ConfigurationTable.svelte
    Table showing the configuration of the PDA
    Author: Jan Fojtík
-->

<script lang="ts">
    import {pda_configuration_store, pda_graph_store, table_index_store} from "../../stores/graphInitStore";
    import type {TransitionType} from "../../types/pda-cfg/TransitionType";
    import {input_error_store} from "../../stores/inputErrorStore";
    import {tooltip} from "../tooltipUtils";

    // SimpleBar
    import 'simplebar'
    import 'simplebar/dist/simplebar.css'
    import ResizeObserver from "resize-observer-polyfill";
    window.ResizeObserver = ResizeObserver;

    // state, input, stack, ruleNumber, rule, rowNumber
    let tableData: [string, string, string[], number | string, TransitionType, number | string][] = [];

    let traversal = [];

    let wordBackup: string = "";
    let word: string = "";

    let stackBackup: string[] = [];
    let stack: string[] = [];

    // Reactive statements to update tableData
    $: if ($table_index_store === -1) {
        tableData = [];
    }

    $: if ($pda_graph_store.traversal) {
        tableData = [];

        if ($pda_graph_store.traversal.length) {
            // get traversal
            traversal = $pda_graph_store.traversal;

            // get word
            if ($pda_graph_store.word.length === 0) {
                wordBackup = "ε";
            } else {
                wordBackup = $pda_graph_store.word;
            }

            // find the first rule that will be used from traversal
            let firstRuleIndex = $pda_graph_store.transitions.findIndex((transition) => {
                return transition === traversal[0];
            });

            // check if rule exists
            let firstRule;
            if (firstRuleIndex !== -1) {
                firstRule = $pda_graph_store.transitions[firstRuleIndex];
                firstRuleIndex++;
            }

            // check if word is longer than 10 chars
            if (wordBackup.length > 10) {
                word = wordBackup.slice(0, 7) + "...";
            } else {
                word = wordBackup;
            }


            // push the initial configuration into tableData
            tableData.push([$pda_graph_store.startState, word, [$pda_graph_store.stackBottom], firstRuleIndex ? firstRuleIndex : "#", firstRule ? firstRule : "", 0]);

            for (let i = 0; i < traversal.length; i++) {
                // rule about to be used
                let nextRuleIndex, nextRule;
                if (i !== traversal.length - 1) {
                    nextRuleIndex = $pda_graph_store.transitions.findIndex((transition) => {
                        return transition === traversal[i + 1];
                    });

                    if (nextRuleIndex !== -1)
                        nextRule = $pda_graph_store.transitions[nextRuleIndex];

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
                    word = "ε";
                } else if (word.length > 10) { // if word is too long (> 10 chars)
                    word = word.slice(0, 7) + "...";
                }

                // stack
                if (traversal[i].stackAfter[0] === "ε") { // pop (from the front)
                    stack = stackBackup.slice(1);
                } else if (traversal[i].stackAfter[0] !== "ε") { // push (to the front) and don't push the last symbol in the stack
                    stack = traversal[i].stackAfter.concat(stackBackup.slice(1));
                }
                // console.log(`${traversal[i].stackAfter[0]} -> ${stack}`);


                // if stack is empty
                if (stack.length === 0) {
                    stack = ["ε"];
                } else if (stack.length > 10) { // if stack is too long (> 10 chars)
                    stack = stack.slice(0, 7);
                    stack.push("...");
                }

                // save stack for next transition
                stackBackup = stack;

                // push to table data
                tableData.push([traversal[i].stateAfter, word, stack, nextRuleIndex ? nextRuleIndex : "#", nextRule ? nextRule : "", i + 1]);
            }
        } else {
            if ($pda_graph_store.word) {
                if ($pda_graph_store.word.length > 10) {
                    word = $pda_graph_store.word.slice(0, 7) + "...";
                } else {
                    word = $pda_graph_store.word;
                }
                // push the initial configuration into tableData
                tableData.push([$pda_graph_store.startState, $pda_graph_store.word, [$pda_graph_store.stackBottom], "#", {} as TransitionType, 0]);
            }
        }


        // reset vars
        pda_configuration_store.update((n) => {
            n.data = tableData;
            return n;
        });
        resetVars();
    }

    $: if ($input_error_store.table) {

        // empty traversal
        traversal = [];

        // set to false
        $input_error_store.table = false;
    }

    // Function that resets the variables
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

<div class="wrapper" data-simplebar>
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
                        <div class="divTableCell">{row[2].join("")}</div>
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
                        <div class="divTableCell">{row[2].join("")}</div>
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
    border-radius: 0.5rem !important;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;

    //margin: 0 auto;

    //overflow: visible scroll;
  }

  @media screen and (max-width: 1200px) and (min-width: 768px) {
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

  .simplebar-content-wrapper {
    border-radius: 0.5rem;
  }

  :global(.tooltip) {
    white-space: nowrap;
    position: relative;
    padding-top: 0.35rem;
    cursor: pointer;
    border-bottom: 1px solid currentColor;
  }

  .divTableCell :global(#tooltip) {
    transform: translate(-110%, 0%);
  }

  .divTable {
    display: table;
    width: 100%;
    height: 37.75vh;

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

  .divTableRow:nth-child(even) {
    background-color: #f2f2f2;
  }

  :global(body.dark-mode) .divTableRow:nth-child(even) {
    background-color: #1f1f25;
  }
</style>