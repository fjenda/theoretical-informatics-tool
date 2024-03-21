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
</style>
