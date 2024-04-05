

<slot name="type-switch"/>
<p class="epsilon">ε - copy if needed</p>

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

    .epsilon {
        font-size: 0.8rem;
        color: #a4a4a4;
        text-align: center;
    }

</style>