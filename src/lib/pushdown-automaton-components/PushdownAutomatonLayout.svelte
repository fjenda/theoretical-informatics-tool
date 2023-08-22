<script lang="ts">
    import Button from "../Button.svelte";

    export let title : string;

    const tabs = [
        ["Pushdown automaton", "pushdown-automaton"],
        ["CF -> PA", "cf-to-pa"]
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
        <slot />
    </div>
</div>

<style lang="scss">
  h1 {
    margin: 2rem;
    font-size: 2.5rem;
    //text-align: center;
  }

  .layout {
    width: 100vw;
    height: calc(100vh - 7rem);
    margin-top: 3rem;
    display: flex;
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

  .wrap {

  }
</style>