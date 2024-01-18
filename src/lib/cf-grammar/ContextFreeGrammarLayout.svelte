<script lang="ts">
    import Button from "../Button.svelte";

    export let title: string;

    const tabs = [
        ["Pushdown automaton", "pushdown-automaton"],
    ];
</script>

<div class="header">
    <h1>{title}</h1>
    <div class="tab-box">
        {#each tabs as tab}
            <Button type="tab" text={tab[0]} url={tab[1]} />
        {/each}
    </div>
</div>
<div class="wrap">
    <div class="layout">
        <div class="cfg-editor"><slot name="cfg-editor"/>TODO</div>
        <div class="input-div"><slot name="input-div"/>TODO</div>
        <div class="results-div"><slot name="results-div"/>TODO</div>
    </div>
</div>

<style lang="scss">
    h1 {
      margin: 2rem;
      font-size: 2.5rem;
    }

    .layout {
      width: calc(100vw - 6rem);
      height: calc(100vh - 13rem);
      margin: 3rem;

      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, 1fr);
      //grid-column-gap: 0px;
      //grid-row-gap: 0px;
    }

    .cfg-editor { grid-area: 1 / 1 / 3 / 2; outline: 1px solid red; }
    .input-div { grid-area: 1 / 2 / 2 / 3; outline: 1px solid green; }
    .results-div { grid-area: 2 / 2 / 3 / 3; outline: 1px solid blue; }

    .header {
      display: flex;
    }

    .tab-box {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1.5rem;
    }
</style>