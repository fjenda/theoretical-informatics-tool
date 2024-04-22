<!--
    AutomatonGeneratorLayout.svelte
    Layout for the automaton generator
    Author: Jan Fojtík
-->

<slot name="type-switch"/>
<div class="eps-box">
    <slot name="eps-button"/>
</div>

<div class="layout">
    <div class="start-state-box">
        <slot name="start-state"/>
    </div>

    <div class="final-states-box">
        <slot />
    </div>

    <div class="transitions-box">
        <slot name="transitions"/>
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