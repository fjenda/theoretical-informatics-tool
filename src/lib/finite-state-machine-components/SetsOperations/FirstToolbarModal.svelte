<!--
    FirstToolbarModal.svelte
    This component is used to create a modal dialog for the toolbar buttons. In the dialog,
    the user can create a new node, new edge, show the definition of the automaton, or generate
    an automaton.
    Author: Marek Krúpa
-->

<script lang="ts">
    import type {ToolbarButtonType} from "../../../types/ToolbarButtonType";
    import {
        configuration_store,
        first_configuration_store,
        first_graph_store,
        resetInputVar
    } from "../../../stores/graphInitStore.js";
    import FirstAutomatonGeneratorLayout from "./FirstAutomatonGeneratorLayout.svelte";
    import FirstToggleSwitch from "./FirstToggleSwitch.svelte";
    import FirstStateComboBox from "./FirstStateComboBox.svelte";
    import FirstStartStateMultiSelect from "./FirstStartStateMultiSelect.svelte";
    import FirstStateMultiSelect from "./FirstStateMultiSelect.svelte";
    import FirstTransitionFuncInput from "./FirstTransitionFuncInput.svelte";
    import {input_error_store} from "../../../stores/inputErrorStore";

    // Variables
    export let showModal : boolean;
    export let type : ToolbarButtonType;
    export let func : Function;
    let dialog;
    let isFinishState : boolean = false;
    let isStartState : boolean = false;
    let config : string = "";
    let label : string, source : string, target : string, rules : string;

    // Show the modal dialog
    $: if (dialog && showModal) dialog.showModal();

    // If the type is show-definition, generate the configuration
    $: if (showModal && type === "show-definition") {
        func();

        if ($first_configuration_store.nodes?.length === 0 || !$first_configuration_store.nodes) {
            config = "No configuration to show";
        } else {
            generateConfiguration();
        }
    }

    // Generate the configuration of the automaton
    function generateConfiguration() {
        config = "";
        // states from nodes
        config += `Q: {${$first_configuration_store.nodes.join(", ")}}\n`;

        const alphabet = new Set();
        $first_configuration_store.transitions.forEach((transition) => {
            if (transition.input !== "ε") {
                alphabet.add(transition.input);
            }

        });
        config += `Σ: {${Array.from(alphabet).join(", ")}}\n`;

        // transitions
        config += "δ: {\n";
        $first_configuration_store.transitions.forEach((transition) => {
            config += `    (${transition.state}, ${transition.input}) → (${transition.stateAfter})\n`;
        });
        config += "}\n";

        // start state
        config += `S: {${$first_configuration_store.initial_state.join(", ")}}\n`;

        // final states
        config += `F: {${$first_configuration_store.final_states.join(", ")}}\n`;
    }

    // Reset the input fields
    function resetInput() {
        label = "", source = "", target = "", rules = "";
        return true;
    }

    // Check the input fields
    function checkInput(type) {
        if (!["new-node", "new-edge"].includes(type)) {
            func();
            return true;
        }

        if (!label?.trim()) {
            console.log("bad input");
            return false;
        }

        if (type == "new-edge") {
            if (!source?.trim() || !target?.trim()) {
                console.log("bad input");
                return false;
            }
        }

        const modifiedLabel = label.trim();

        switch (type) {
            case "new-node": {
                console.log("new-node - " + modifiedLabel);
                let folowingID = $first_graph_store.followingID;
                console.log('new node string: ' + folowingID.toString());
                func({ id: folowingID.toString(), label: label});
                $first_graph_store.followingID++;
                return true;
            }

            case "new-edge": {
                const modifiedSource = source.trim();
                const modifiedTarget = target.trim();
                let sourceID = $first_graph_store.nodes.find(node => node.label === modifiedSource)?.id;
                let targetID = $first_graph_store.nodes.find(node => node.label === modifiedTarget)?.id;
                console.log("new-edge - " + modifiedLabel + " " + sourceID + " -> " + targetID);
                func({id: `${sourceID}-${targetID}`, label: label, source: sourceID, target: targetID});
                return true;
            }
        }
    }

    // Insert ε into the input field
    function insertEps() {
        console.log("inserting ε");
        const transitions = document.getElementById("function-input");
        transitions.value += "ε";
        transitions.focus();
    }

</script>

<dialog
        bind:this={dialog}
        on:close={() => (showModal = false)}
        on:click|self={() => dialog.close()}
>
    <div on:click|stopPropagation>
        <slot name="header" />
        <slot />

        {#if type === "show-definition"}
            <textarea id="transitions"
                      class="transitions-input"
                      cols="30" rows="20"
                      readonly = {true}
                      value={config}
                      placeholder="Transitions"></textarea>

            <hr />
            <button on:click={() => dialog.close()}>Cancel</button>

        {:else if type === "generate-automata"}
            <FirstAutomatonGeneratorLayout >
                <FirstToggleSwitch slot="type-switch" />

                <button class="epsilon" slot="eps-button" on:click={insertEps}>Insert ε</button>

                <FirstStateComboBox key={125} slot="start-state" />

                <FirstStartStateMultiSelect key={126} slot="multi-select-start" />
                <FirstStateMultiSelect key={127} slot="multi-select" />

                <FirstTransitionFuncInput slot="transitions" />

                <div class="button-wrapper" slot="buttons">
                    <button on:click={() => {
                    resetInputVar.set(true);
                    input_error_store.reset();
                    dialog.close();
                }}>Cancel</button>
                    <button on:click={() => {
                    func() &&
                    dialog.close()
                }}>Apply</button>
                </div>
            </FirstAutomatonGeneratorLayout>
        {:else}
            <div class="input-box">
                {#if ["new-node", "new-edge"].includes(type)}
                    <input bind:value={label} maxlength="8" placeholder="Label">
                {/if}

                {#if type === "new-node"}
                    {#if !$first_configuration_store.initial_state || $first_configuration_store.initial_state.length === 0}
                        <div class="checkbox-box">
                            <label>
                                <input id="start-state-checkbox" type="checkbox" bind:checked={isStartState} />
                                Start state
                            </label>
                        </div>
                    {/if}
                    <div class="checkbox-box">
                        <label>
                            <input id="finish-state-checkbox" type="checkbox" bind:checked={isFinishState} />
                            Final state
                        </label>
                    </div>
                {:else if type === "new-edge"}
                    <input id="source-input" bind:value={source} maxlength="8" placeholder="Source">
                    <input id="target-input" bind:value={target} maxlength="8" placeholder="Target">
                {/if}
            </div>
            <hr />
            <div class="button-wrapper">
                <button on:click={() => resetInput() && dialog.close()}>Cancel</button>
                <button on:click={() => checkInput(type) && resetInput() && dialog.close()}>Apply</button>
            </div>
        {/if}

    </div>
</dialog>

<style>
    dialog {
        max-width: 32em;
        border-radius: 0.2em;
        border: none;
        padding: 0;
        background: #f7f7f8;
        color: #363636;

        overflow: visible;
    }

    :global(body.dark-mode) dialog {
        background: #25252d;
        color: #f4f9ff;
    }

    dialog::backdrop {
        background: rgba(0, 0, 0, 0.3);
    }

    dialog > div {
        padding: 1em;
    }

    dialog[open] {
        animation: zoom 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes zoom {
        from {
            transform: scale(0.95);
        }
        to {
            transform: scale(1);
        }
    }

    dialog[open]::backdrop {
        animation: fade 0.2s ease-out;
    }
    @keyframes fade {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    button {
        display: block;
    }

    .input-box {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 1rem;
    }

    input {
        text-align: center;
        width: 5rem;
    }

    .checkbox-box {
        display: flex;
        gap: 0;
    }

    .transitions-input {
        resize: none;
    }

    .button-wrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 5rem;
    }

    #transitions {
        pointer-events: none;
        background: #f7f7f8;
        color: #363636;
        border: none;
        outline: 0.05rem solid #363636;
        padding: 0.2rem;
    }

    :global(body.dark-mode) #transitions {
        background: #25252d;
        color: #f4f9ff;
        outline: 0.05rem solid #f4f9ff;
    }

    button {
        border-radius: 0.25rem;
        outline: none;
        border: none;
        background-color: #9CC6FB;
        color: #363636;
        padding: 0.5rem 1rem;
        font-size: 1rem;
    }

    :global(body.dark-mode) button {
        color: #f4f9ff;
        background: #4A3F64;
    }

    :global(body.dark-mode) button:hover {
        color: #4A3F64;
        background: #f4f9ff;
    }

    button:hover {
        color: #174ea6;
        background: #f4f9ff;
    }

    button:active {
        outline: none;
    }

    button:focus {
        outline: 2px solid #4285f4;
    }

</style>