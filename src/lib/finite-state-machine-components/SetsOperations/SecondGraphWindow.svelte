<script lang="ts">
    import {FiniteStateAutomaton} from "../FiniteStateAutomaton";

    let graphObject = new FiniteStateAutomaton([], [], [], [], [], "DFA");

</script>

<div class="window">
    <slot />
    <div class="graph-wrapper">
        <div bind:this={graphObject.div} class="graph" />
        <div class="type-wrapper">
            <slot name="type" />
        </div>
    </div>
</div>

<style lang="scss">
  .window {
    width: 90%;
    min-width: 35rem;
    height: 90%;
    min-height: 28rem;
    //margin: 2.5% auto;

    border-radius: 0.5rem;
    background: #f7f7f8;

    box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
    box-sizing: border-box;
  }

  :global(body.dark-mode) .window {
    background: #25252d;
  }

  .graph {
    overflow: hidden;

    /*border-radius: 2vw;*/
    border-radius: 0.5rem;

    height: calc(100% - 5vh);
  }

  .graph-wrapper {
    position: relative;
    height: 100%;
  }

  .type-wrapper {
    position: absolute;
    top: 0;
    left: 1rem;
    pointer-events: none;
  }
</style>
