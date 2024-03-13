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
        <div class="second-automaton">
            <slot name="first-automaton"/>
        </div>
        <div class="result-automaton">
            <slot name="first-automaton"/>
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

  .layout {
    width: 100vw;
    height: calc(100vh - 7.5rem);
    margin-top: 1rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }

  @media screen and (max-width: 1000px) and (min-width: 768px) {
    .layout {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(3, 1fr);

      height: auto;
      //overflow: hidden auto;
    }
  }

  .first-automaton{
    height: 8vw;
    grid-area: 1 / 1 / 2 / 2;
  }

  .second-automaton{
    height: 8vw;
    grid-area: 2 / 1 / 3 / 2;
  }

  .result-automaton{
    height: 8vw;
    grid-area: 1 / 2 / 3 / 4;
  }

  .tool-bar{
    grid-area: 1 / 4 / 3 / 5;
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