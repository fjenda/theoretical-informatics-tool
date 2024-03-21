<script lang="ts">

    import {first_graph_store, graph_store} from "../../stores/graphInitStore";
</script>

<slot name="type-switch"/>
<p class="epsilon">ε - copy if needed</p>
<div class="layout">
    {#if $graph_store.type === "DFA"}
        <div class="start-state-box">
            <slot name="start-state" />
        </div>
        <div class="final-states-box">
            <slot name="multi-select"  />
        </div>
    {:else if $graph_store.type === "NFA"}
        <div class="start-state-box">
            <slot  name="multi-select-start"/>
        </div>
        <div class="final-states-box">
            <slot  name="multi-select"/>
        </div>
    {:else}
        <div class="start-state-box">
            <slot name="start-state" />
        </div>
    {/if}
    <div class="transitions-box">
        <slot name="transitions" />
    </div>
</div>

<slot name="buttons"/>

<style>
    .layout {
        margin: 1rem 0;
        display: grid;
        gap: 1em 1em;
        grid-auto-flow: row;
        grid-template-areas: "combo transitions transitions"
                             "combo transitions transitions"
                             "multi transitions transitions"
                             "multi transitions transitions";
    }

    .epsilon {
        font-size: 0.8rem;
        color: #a4a4a4;
        text-align: center;
    }

    .transitions-box {
        grid-area: transitions;
        /*grid-area: 1 / 2 / 3 / 3;*/
        display: flex;
        justify-content: center;
    }

    .start-state-box {
        /*grid-area: 1 / 1 / 2 / 2;*/
        grid-area: combo;
        display: flex;
        justify-content: center;
    }

    .final-states-box {
        grid-area: multi;
        /*grid-area: 2 / 1 / 3 / 2;*/
        display: flex;
        align-items: center;
        justify-content: center;
    }

</style>