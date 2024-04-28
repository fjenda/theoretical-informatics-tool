<!--
    FiniteStateMachineLayout.svelte
    This component is used to create a layout for the finite state machine page.
    Author: Marek Krúpa
-->

<script lang="ts">
    import Button from "../Button.svelte";

    export let title : string;

    const tabs = [
        ["Set operations", "set-operations"],
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
        <div class="control-panel"><slot name="control-panel" /></div>
        <div class="window"><slot name="window" /></div>
        <div class="table"><slot name="table" /></div>
        <div class="convert-table"><slot name="convert-table" /></div>
    </div>
</div>

<style lang="scss">
  h1 {
    margin: 2rem;
    font-size: 2.5rem;
  }

  .layout {
    width: 100vw;
    height: calc(100vh - 8rem);
    margin-top: 3rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    grid-column-gap: 0;
    grid-row-gap: 0;
  }

  .control-panel {
    grid-area: 1 / 1 / 5 / 2;
    display: flex;
    justify-content: center;
  }

  .table {
    grid-area: 1 / 4 / 3 / 5;
  }

  .convert-table {
    grid-area: 3 / 4 / 5 / 5;
  }

  .window {
    grid-area: 1 / 2 / 5 / 4;
    display: flex;
    justify-content: center;
  }

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