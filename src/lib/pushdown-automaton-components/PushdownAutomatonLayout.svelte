<script lang="ts">
    import Button from "../Button.svelte";

    export let title: string;

    const tabs = [
        ["Context-free Grammar", "context-free-grammar"]
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
        <div class="control-panel">
            <slot name="control-panel"/>
        </div>
        <div class="window">
            <slot name="window"/>
        </div>
        <div class="table">
            <slot name="table"/>
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
    height: calc(100vh - 6rem);
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 0;
    grid-row-gap: 0;
  }

  .control-panel {
    grid-area: 1 / 1 / 2 / 2;
    display: flex;
    justify-content: center;
  }

  .table {
    grid-area: 2 / 1 / 3 / 2;
  }

  .window {
    grid-area: 1 / 2 / 3 / 4;
    display: flex;
    justify-content: center;
  }

  @media screen and (max-width: 1150px) and (min-width: 768px) {
    .layout {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);

      height: auto;
      //overflow: hidden auto;
    }

    .window {
        grid-area: 1 / 1 / 3 / 3;
    }

    .control-panel {
        grid-area: 3 / 1 / 4 / 2;
    }

    .table {
        grid-area: 3 / 2 / 4 / 3;
    }
  }

  @media screen and (max-width: 768px) {
    .layout {
      display: grid;
      grid-template-columns: 1fr;
      grid-template-rows: 1.5fr repeat(2, 1fr);

      height: auto;
      //overflow: hidden auto;
    }

    .control-panel {
      grid-area: 2 / 1 / 3 / 2;
    }

    .table {
      grid-area: 3 / 1 / 4 / 2;
    }

    .window {
      grid-area: 1 / 1 / 2 / 2;
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