<script lang="ts">
    import {grammar_results_store} from "../../stores/graphInitStore";

    // SimpleBar
    import 'simplebar'
    import 'simplebar/dist/simplebar.css'
    import ResizeObserver from "resize-observer-polyfill";
    window.ResizeObserver = ResizeObserver;

    let tableData;
    let showDerivation: boolean = false;
    let shownDerivation: {rule: string, result: string}[];
    let shownInput: string;

    $: if (grammar_results_store) {
        tableData = $grammar_results_store;
    }

    function toggleDerivation(derivation: string[], inputIndex: number) {
        showDerivation = !showDerivation;

        if (inputIndex === -1 || !showDerivation) {
            return;
        }

        shownDerivation = derivation;
        shownInput = tableData[inputIndex].input.join("");
    }
</script>

<div class="wrapper">
    {#if showDerivation}
        <div class="derivation-box">
            <div class="derivation-header">
                <u class="close-button clickable" on:click={() => { toggleDerivation([], -1) }}>
                    &lt Back
                </u>

                <p class="in">"{shownInput}"</p>
            </div>

            <div class="wrapper-smaller" data-simplebar>
                <div class="divTable">
                    <div class="divTableHeading">
                        <div class="divTableRow">
                            <div class="divTableHead">Step</div>
                            <div class="divTableHead">Rule</div>
                            <div class="divTableHead">Result</div>
                        </div>
                    </div>
                    {#each shownDerivation as step, i}
                        <div class="divTableBody">
                            <div class="divTableRow">
                                <div class="divTableCell step">{i + 1}</div>
                                <div class="divTableCell rule">{step.rule}</div>
                                <div class="divTableCell">{step.result}</div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    {:else}
        <div class="divTable" data-simplebar>
            <div class="divTableHeading">
                <div class="divTableRow">
<!--                    <div class="divTableHead">#</div>-->
                    <div class="divTableHead input">String</div>
                    <div class="divTableHead acc">Accepted</div>
                    <div class="divTableHead der">Derivation</div>
                </div>
            </div>
            <div class="divTableBody">
                {#if tableData}
                    {#each tableData as row, i}
                        <div class="divTableRow">
                            <div class="divTableCell input">{`"${row.input.join("")}"`}</div>
                            <div class="divTableCell acc">{row.accepted ? "Yes" : "No"}</div>
                            {#if row.accepted}
                                {#if row.length > 1}
                                    <div class="divTableCell der">
                                        <div class="flex-col">
                                            {#each row.derivation as der, j}
                                                    <u class="clickable" on:click={() => { toggleDerivation(der, i) }}>
                                                        Show {j + 1}
                                                    </u>
                                            {/each}
                                        </div>
                                    </div>
                                {:else}
                                    <div class="divTableCell der">
                                        <u class="clickable" on:click={() => { toggleDerivation(row.derivation, i) }}>
                                            Show
                                        </u>
                                    </div>
                                {/if}
                            {:else}
                                <div class="divTableCell">-</div>
                            {/if}
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>

<style lang="scss">
  .wrapper {
    width: 30vw;
    height: 37.75vh;

    //min-height: 15.5rem;
    border-radius: 0.5rem;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;

    //margin: 0 auto;

    //overflow: visible scroll;
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

  .divTable {
    display: table;
    width: 100%;
    height: 37.75vh;

    background-color: #f4f9ff;
    color: #393939;

    border-radius: 0.5rem;
  }

  :global(body.dark-mode) .divTable {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .divTableHeading {
    display: table-header-group;

    position: sticky;
    top: 0;

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

  .divTableCell {
    background-color: #f7f7f8;
    color: #101820;
  }

  .acc {
    width: 10%;
  }

  .der {
    width: 20%;
  }

  .step {
    width: 10%;
  }

  .rule {
    width: 35%;
  }

  :global(body.dark-mode) .divTableCell {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .divTableRow:nth-child(even) {
    background-color: #f2f2f2;
  }

  :global(body.dark-mode) .divTableRow:nth-child(even) {
    background-color: #1f1f25;
  }

  .clickable {
    cursor: pointer;
  }

  .close-button {
    font-size: 1rem;
    margin: auto 0.5rem;
  }

  .in {
    margin: auto 0.5rem;
    font-weight: bold;
    font-size: 1rem;
  }

  .derivation-box {
    position: relative;

    width: 100%;
    height: 100%;

    background-color: #f7f7f8;
    color: #101820;

    border-radius: 0.5rem;
    //overflow: hidden;
  }

  :global(body.dark-mode) .derivation-box {
    background-color: #25252d;
    color: #f4f9ff;
  }

  .derivation-header {
    position: sticky;
    top: 0;
    display: flex;
    justify-content: space-between;

    z-index: 10;

    height: 12.5%;
  }

  .wrapper-smaller {
    height: 87.5%;
    overflow: hidden auto;
  }

  .flex-col {
    display: flex;
    flex-direction: column;
  }
</style>