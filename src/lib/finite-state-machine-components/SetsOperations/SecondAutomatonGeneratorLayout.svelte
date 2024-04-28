<!--
    SecondAutomatonGeneratorLayout.svelte
    This component is used to generate the layout for the second automaton generator.
    Author: Marek Krúpa
-->

<script lang="ts">
    import {second_backup_store} from "../../../stores/graphInitStore";
</script>

<slot name="type-switch"/>
<div class="eps-box">
    <slot name="eps-button"/>
</div>
<div class="layout">
    {#if $second_backup_store.type === "DFA"}
        <div class="start-state-box">
            <slot name="start-state" />
        </div>
        <div class="final-states-box">
            <slot name="multi-select"  />
        </div>
    {:else if $second_backup_store.type === "NFA"}
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

    .transitions-box {
        grid-area: transitions;
        display: flex;
        justify-content: center;
    }

    .start-state-box {
        grid-area: combo;
        display: flex;
        justify-content: center;
    }

    .final-states-box {
        grid-area: multi;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .eps-box {
        margin-top: 0.75rem;
        display: flex;
        justify-content: flex-end;
        align-items: center;
    }

</style>