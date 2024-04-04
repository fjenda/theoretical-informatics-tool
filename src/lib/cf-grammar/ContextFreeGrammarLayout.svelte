<!--
    ContextFreeGrammarLayout.svelte

    This is the layout for the context-free grammar page.
    It contains the header, the editor, the input and the results.

    The header contains the title of the page and the tabs.
    The tabs are used to navigate between the different pages of the website.
    Theres currently only one tab, the pushdown automaton tab.

    The editor is used to create the context-free grammar. (CFGEditor.svelte)
    The input is used to write the input string. (CFGInput.svelte)
    The results are used to display the results of the context-free grammar. (CFGResultsField.svelte)

    Author: Jan Fojtík
-->

<script lang="ts">
    import Button from "../Button.svelte";

    // title of the page
    export let title: string;

    // top tabs of the page
    const tabs = [
        ["Pushdown automaton", "pushdown-automaton"],
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
        <div class="cfg-editor">
            <slot name="cfg-editor"/>
        </div>
        <div class="input-div">
            <slot name="cfg-input"/>
        </div>
        <div class="results-div">
            <slot name="cfg-results"/>
        </div>
    </div>
</div>

<style lang="scss">

  h1 {
    //margin: 2rem 1rem;
    margin-right: 2rem;
    font-size: 2.5rem;
  }

  .layout {
    width: 100vw;
    height: calc(100vh - 7.5rem);
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 0;
    grid-row-gap: 0;
  }

  .cfg-editor {
    grid-area: 1 / 1 / 3 / 3;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .input-div {
    grid-area: 1 / 3 / 2 / 4;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .results-div {
    grid-area: 2 / 3 / 3 / 4;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  @media screen and (max-width: 1200px) and (min-width: 768px) {
    .layout {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);

      height: auto;
      width: 100%;
      //overflow: hidden auto;
    }

    .cfg-editor {
      grid-area: 1 / 1 / 3 / 3;
    }

    .input-div {
      grid-area: 3 / 1 / 4 / 2;
    }

    .results-div {
      grid-area: 3 / 2 / 4 / 3;
    }
  }

  @media screen and (max-width: 768px) {
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1.5fr repeat(2, 1fr);

      height: auto;
      width: 100%;
    }

    .cfg-editor {
      grid-area: 1 / 1 / 2 / 2;
    }

    .input-div {
      grid-area: 2 / 1 / 3 / 2;
    }

    .results-div {
      grid-area: 3 / 1 / 4 / 2;
    }
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