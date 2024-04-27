<!--
    OperationPanel.svelte
    Svelte component for the operations panel of the set operations page.
    Author: Marek Krúpa
-->

<script lang="ts">
    import {tooltip} from "../../tooltipUtils";
</script>

<div class="control-panel">
    <div class="tooltip-wrapper">
        <h2>
        <span class="ttip" use:tooltip={"The following 2 automata are used for set operations.\n" +
                                        "A₁ on the left, A₂ on the right.\n\n" +
                                        "!!!A₁ and A₂ must have different labels!!!\n" +
                                        "Binary operation (works with two input automata A₁ and A₂)\n" +
                                        "Unification: A₁ ∪ A₂ | Intersection: A₁ ∩ A₂ \n"+
                                        "Concatenation: A₁ · A₂ | Difference: A₁ − A₂ \n"+
                                        "\n"+
                                        "Unary operation (works with one automaton A₁)\n"+
                                        "Iteration: A₁* | Complement: Ā₁ \n"+
                                        "Automaton must be total for operations Intersection and Difference \n"+
                                        "\n"+
                                        "If the specified automaton is non-deterministic, the operation\n" +
                                        " can convert it to deterministic for its needs.\n"+
                                        "\n"+
                                        "The resulting automaton can be both NFA and DFA, it depends \n" +  //!!!The machines must not have the same labels!!!
                                        " on the input automata. However, even two DFA automata can result in an NFA.\n" +
                                        "\n"+
                                        "Recommendation:\n" +
                                        "For the A₁ automaton, choose state names in p₁ to p_n\n" +
                                        "For the A₂ automaton, choose state names in q₁ to q_n\n" +
                                        "\n"+
                                        "If the automaton is not suitable for the selected operation and needs \n" +
                                        "to be converted to a DFA, the resulting DFA will have a name in this format."}>
                    ?</span>
        </h2>
    </div>
    <slot />
</div>

<style>
    .ttip {
        font-size: 1.5rem;
        font-weight: bold;
        cursor: pointer;
        position: absolute;
        top: 1.5rem;
        white-space: break-spaces;
        color: #363636;

    }

    :global(body.dark-mode) .ttip {
        color: #f4f9ff;
    }

    .control-panel {
        position: relative;
        margin: 0 auto;
        width: fit-content;
        height: fit-content;
        padding: 2rem 1rem 1rem 1rem;
        min-width: 5rem;
        min-height: 15.5rem;

        border-radius: 0.5rem;

        background: #f7f7f8;
        color: black;
        text-align: center;

        box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
        box-sizing: border-box;

        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }

    :global(body.dark-mode) .control-panel {
        background: #25252d;
    }

    .tooltip-wrapper :global(#tooltip) {
        transform: translate(-110%, 0%);
    }
</style>