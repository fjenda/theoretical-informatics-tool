<script lang="ts">
    import {graph_store, table_index_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import {tooltip} from "../tooltipUtils";

    // state, input, stack, ruleNumber, rule, rowNumber
    let tableData: [string, [string], [string], [number], TransitionMeta, number][] = [];

    let traversal = [];

    let wordBackup: string = "";
    let word: string = "";

    let stackBackup: string = "";
    let stack: string = "";

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
            tableData.push([$graph_store.startState, word, "Z", firstRuleIndex ? firstRuleIndex : "#", firstRule ? firstRule : "", 0]);

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
                if (traversal[i].input === "E") {
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
                if (traversal[i].stackAfter === "E") { // pop (from the front)
                    stack = stackBackup.slice(1);
                } else if (traversal[i].stackAfter !== "E") { // push (to the front) and dont push the last symbol in the stack
                    stack = traversal[i].stackAfter + stackBackup.slice(1);
                }

                // if stack is empty
                if (!stack.length) {
                    stack = "Ø";
                } else if (stack.length > 10) { // if stack is too long (> 10 chars)
                    stack = stack.slice(0, 7) + "...";
                }

                // save stack for next transition
                stackBackup = stack;

                // push to table data
                tableData.push([traversal[i].stateAfter, word, stack, nextRuleIndex ? nextRuleIndex : "#", nextRule ? nextRule : "", i + 1]);
            }
        } else {
            // push the initial configuration into tableData
            tableData.push([$graph_store.startState, $graph_store.word.join(""), "Z", "#", "", 0]);
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
        stackBackup = "";
        stack = "";
    }
</script>

<div class="wrapper">
    <table class="styled-table">
        <thead>
        <tr>
            <th>State</th>
            <th>Input</th>
            <th>Stack</th>
            <th>Rule</th>
        </tr>
        </thead>
        <tbody>
        {#each tableData as row}
            {#if row[5] === $table_index_store}
                <tr class="active">
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    {#if row[3] === "#"}
                        <td>{row[3]}</td>
                    {:else}
                        <td><span
                                use:tooltip={`(${row[4].state}, ${row[4].input}, ${row[4].stack}) → (${row[4].stateAfter}, ${row[4].stackAfter})`}>{row[3]}</span>
                        </td>
                    {/if}
                </tr>
            {:else}
                <tr>
                    <td>{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    {#if row[3] === "#"}
                        <td>{row[3]}</td>
                    {:else}
                        <td><span
                                use:tooltip={`δ(${row[4].state}, ${row[4].input}, ${row[4].stack}) → (${row[4].stateAfter}, ${row[4].stackAfter})`}>{row[3]}</span>
                        </td>
                    {/if}
                </tr>
            {/if}
        {/each}
        </tbody>
    </table>
</div>

<style lang="scss">
  .wrapper {
    width: 90%;
    height: 90%;

    //margin: 0 auto;

    overflow: visible auto;

    border-radius: 0.5rem;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;

    //min-width: 9.5rem;
    //min-height: 15.5rem;
  }

  .active {
    background-color: #dddddd !important;
  }

  :global(body.dark-mode) .active {
    background-color: #393939 !important;
  }

  .styled-table {
    height: 100%;
    width: 100%;

    //min-width: 9.5rem;
    //min-height: 15.5rem;

    border-spacing: 0;

    font-size: 0.9em;
    font-family: sans-serif;

    background-color: #f7f7f8;

    table-layout: auto;

    border-collapse: separate;


    thead tr {
      background-color: #9CC6FB;
      color: #393939;

      position: sticky;
      top: 0;
    }

    th, td {
      padding: 0.5rem;
    }

    tbody tr {
      background-color: #f7f7f8;
      color: #101820;
      text-align: center;
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

  @media screen and (max-width: 1150px) and (min-width: 768px) {
    .wrapper {
      margin: 0.5rem auto;
    }
  }

  @media screen and (max-width: 767px) {
    .wrapper {
      width: 95%;
      height: 95%;
      margin: 0.5rem auto;
    }
  }

  :global(.tooltip) {
    white-space: nowrap;
    position: relative;
    padding-top: 0.35rem;
    cursor: pointer;
    border-bottom: 1px solid currentColor;
  }

  :global(#tooltip) {
    z-index: 9999;
    position: absolute;
    bottom: inherit;
    left: inherit;
    transform: translate(-52.5%, -100%);
    padding: 0.2rem 0.35rem;
    background: #F4F8FF;
    color: #333333;
    font-size: 1.25rem;
    border-radius: 0.25rem;
    filter: drop-shadow(0 1px 2px hsla(0, 0%, 0%, 0.2));
    width: max-content;
  }

  :global(body.dark-mode #tooltip) {
    background: #333333;
    color: #F4F8FF;
  }

  :global(.tooltip:not(:focus) #tooltip::before) {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0.6em;
    height: 0.25em;
    background: inherit;
    clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
  }
</style>