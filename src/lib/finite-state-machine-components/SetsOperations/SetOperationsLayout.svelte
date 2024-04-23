<script lang="ts">
    import Button from "../../Button.svelte";

    export let title: string;

    const tabs = [
        ["Finite state automaton", "finite-state-automaton"],
    ];
</script>

<div class="header">
    <h1>{title}</h1>
    <div class="tab-box">
        {#each tabs as tab}
            <Button type="tab" text={tab[0]} url={tab[1]}/>
        {/each}
    </div>
</div>
<div class="wrap">
    <div class="layout">
        <div class="first-automaton">
            <slot name="first-automaton"/>
        </div>
        <div class="first_table">
            <slot name="first_table"/>
        </div>
        <div class="operation_bar">
            <slot name="operation_bar"/>
        </div>
        <div class="second-automaton">
            <slot name="second-automaton"/>
        </div>
        <div class="second-table">
            <slot name="second-table"/>
        </div>
        <div class="result-automaton">
            <slot name="result-automaton"/>
        </div>
        <div class="result-table">
            <slot name="result-table"/>
        </div>
        <div class="tool-bar">
            <slot name="tool-bar"/>
        </div>
    </div>
</div>

<style lang="scss">
  h1 {
    //margin: 2rem 1rem;
    margin-right: 2rem;
    font-size: 2.5rem;
  }

  .wrap {
    overflow-y: auto; /* Add vertical scroll if content exceeds viewport height */
    //max-height: calc(100vh - 60px); /* Adjust as needed depending on your header size */
  }

  .layout {
    //width: 100vw;
    height: calc(100vh - 8rem);
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    grid-template-rows: repeat(3, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }

  .first-automaton {
    width: 100%;
    height: 24vw;
    display: flex;
    justify-content: center;
    align-content: center;
    grid-area: 1 / 1 / 2 / 4;
  }

  .first_table {
    width: 100%;
    height: 20vw;
    display: flex;
    justify-content: center;
    align-content: center;
    grid-area: 2 / 1 / 3 / 4;
  }

  .operation_bar {
    width: 100%;
    //height: fit-content;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    grid-area: 1 / 4 / 3 / 5;
  }

  .second-automaton {
    width: 100%;
    height: 24vw;
    display: flex;
    justify-content: center;
    align-content: center;
    grid-area: 1 / 5 / 2 / 8;
  }

  .second-table {
    width: 100%;
    height: 20vw;
    display: flex;
    justify-content: center;
    align-content: center;
    grid-area: 2 / 5 / 3 / 8;
  }

  .result-automaton {
    width: 100%;
    height: 40vw;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    grid-area: 3 / 3 / 4 / 6;
  }

  .result-table {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    grid-area: 3 / 6 / 4 / 8;
  }

  .tool-bar {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-content: center;
    grid-area: 3 / 1 / 4 / 3;
  }

  .header {
    margin: 0 auto;

    width: 95%;
    display: flex;
    flex-wrap: wrap;
  }

  .tab-box {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>