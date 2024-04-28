<!--
    ToolbarModal.svelte
    This component is a modal dialog that is used for several purposes.
    It can be used to show the definition of the automaton/grammar, to generate a new automaton,
    or to add a new node or edge to the automaton.
    Author: Jan Fojtík
-->

<script lang="ts">
    import TransitionFunctionInput from "./TransitionFunctionInput.svelte";
    import ThreeWaySwitch from "./ThreeWaySwitch.svelte";
    import MultiSelectState from "./MultiSelectState.svelte";

    import {
        resetInputVar,
        pda_configuration_store,
        user_grammar_store,
        pda_backup_store, pda_graph_store, graph_store
    } from "../../stores/graphInitStore";
    import AutomatonGeneratorLayout from "./AutomatonGeneratorLayout.svelte";
    import {input_error_store} from "../../stores/inputErrorStore";
    import StateComboBox from "./StateComboBox.svelte";
    import type {ToolbarButtonType} from "../../types/ToolbarButtonType";
    import {PDAController} from "./pda/PDAController";

    export let showModal : boolean;
    export let type : ToolbarButtonType;
    export let func : Function;
    let dialog;
    let label : string, source : string, target : string;
    let label_1 : string, label_2 : string, label_3 : string;
    let isFinishState : boolean = false;
    let isStartState : boolean = false;
    let config : string = "";
    let showError : boolean = false;
    let errorType: string = "";
    let sourceB, targetB, stack = false;

    // Reactive statement that shows the dialog when the showModal variable is true
    $: if (dialog && showModal) dialog.showModal();

    // Reactive statement that generates the configuration of the automaton/grammar
    $: if (showModal && (type === "show-definition" || type === "cfg-definition")) {
        func();

        if (type === "show-definition" && ($pda_configuration_store.states?.length === 0 || !$pda_configuration_store.states)) {
            config = "No definition to show";
        } else if (type === "cfg-definition" && ($user_grammar_store.rules.length === 0)) {
            config = "No definition to show";
        } else {
            generateConfiguration();
        }
    }

    // Function that generates the configuration of the automaton/grammar
    function generateConfiguration() {
        if (type === "show-definition") {
            config = $pda_graph_store.toString();
        } else if (type === "cfg-definition") {
            config = $user_grammar_store.toString();
        }
    }

    // Function that resets the input fields
    function resetInput() {
        label = "", source = "", target = "";
        label_1 = "", label_2 = "", label_3 = "";
        isFinishState = false;
        isStartState = false;
        showError = false;
        stack = false;
        sourceB = false;
        targetB = false;
        errorType = "";
        return true;
    }

    // Function that checks the input fields and adds a new node or edge to the automaton
    // params: type - type of the button that was clicked
    //
    // returns: true if the input is correct, false otherwise
    function checkInput(type: ToolbarButtonType) {
        errorType = "";
        showError = false;

        // if type is not new-node or new-edge, return true
        if (!["new-node", "new-edge"].includes(type)) {
            return true;
        }

        // checking input for new-node type
        if (type == "new-node") {
            if (!label?.trim()) {
                showError = true;
                errorType = "Label is empty";
                return false;
            }

            // check if node exists
            if ($pda_graph_store.nodes.find((node) => node.id === label)) {
                showError = true;
                errorType = "Node already exists";
                return false;
            }
        }

        // checking input for new-edge type
        if (type == "new-edge") {
            sourceB = false;
            targetB = false;
            stack = false;
            let wrongID = false;
            if (!source?.trim()) {
                showError = true;
                sourceB = true;
            }

            if (!target?.trim()) {
                showError = true;
                targetB = true;
            }

            if (!label_2?.trim()) {
                showError = true;
                stack = true;
            }

            // check if nodes exists
            const nodes = $pda_graph_store.nodes.filter((node) => node.id === target || node.id === source);
            if (nodes.length !== 2) {
                if (source !== target) {
                    showError = true;
                    wrongID = true;
                } else if (nodes.length !== 1)
                    showError = true;
                wrongID = true;
            }

            if (showError) {
                if (wrongID) {
                    errorType = "Source or target node does not exist";
                    return false;
                }

                errorType = "Fields are empty";
                return false;
            }
        }

        // if everything is correct, add a new node or edge
        switch (type) {
            // add a new node
            case "new-node": {
                if (isStartState && isFinishState) {
                    func({id: label, label: label, class: "finish start"});
                } else if (isStartState)
                    func({id: label, label: label, class: "start"});
                else if (isFinishState) {
                    func({id: label, label: label, class: "finish"});
                } else {
                    func({id: label, label: label});
                }

                if (isFinishState && $pda_graph_store.type === "empty") {
                    $pda_graph_store.type = "final";
                }
                return true;
            }

            // add a new edge
            case "new-edge": {
                if (!label_1) label_1 = "ε";
                if (!label_3) label_3 = "ε";
                const label_comb = `${label_1},${label_2};${label_3.split(" ").join("")}`;
                const label_arr = [label_1, label_2, label_3];
                func({id: `${source}-${target}`, label: label_comb, source: source, target: target}, label_arr);
                return true;
            }
        }
    }

    // Function that inserts ε into the transition function input
    function insertEps() {
        const transitions = document.getElementById("function-input");
        transitions.value += "ε";
        transitions.focus();
    }
</script>

<dialog
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
    on:keydown|self={(e) => e.key === "Escape" && dialog.close()}
>
    <div on:click|stopPropagation role="dialog">
        <slot name="header" />
        <slot />

        {#if type === "show-definition" || type === "cfg-definition"}
            <textarea id="transitions"
                      class="transitions-input"
                      cols="40" rows="15"
                      readonly = {true}
                      value={config}
                      placeholder="Transitions"></textarea>

            <button class="single-button" on:click={() => dialog.close()}>Close</button>

        {:else if type === "generate-graph"}
            <AutomatonGeneratorLayout>
                <ThreeWaySwitch slot="type-switch" />

                <button class="epsilon" slot="eps-button" on:click={insertEps}>Insert ε</button>

                <StateComboBox slot="start-state" options={$pda_backup_store.nodes}/>

                {#if $pda_backup_store.type !== "empty"}
                    <MultiSelectState />
                {/if}
                <TransitionFunctionInput slot="transitions" />

                <div class="button-wrapper" slot="buttons">
                    <button on:click={() => {
                    resetInputVar.set(true);
                    input_error_store.reset();
                    dialog.close();
                }}>Cancel</button>
                    <button on:click={() => {
                    if (!PDAController.checkGenerationInput())
                        return;
                    pda_backup_store.update((n) => { n.stackBottom = "Z"; return n; });
                    func();
                    dialog.close();
                }}>Apply</button>
                </div>
            </AutomatonGeneratorLayout>
        {:else}
            <div class="input-box">
                {#if type === "new-node"}
                    {#if showError}
                        <p class="error-text" style="color: #ff6969;">{errorType}</p>
                    {/if}
                    <input class={showError ? "errHigh" : ""} bind:value={label} maxlength="8" placeholder="Label">
                    {#if !$pda_configuration_store.initial_state || $pda_configuration_store.initial_state.length === 0}
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
                    <div class="edge-box">
                        <div class="label-box">
                            <input id="label-1" bind:value={label_1} maxlength="8" placeholder="ε">
                            <input class={stack ? "errHigh" : ""} id="label-2" bind:value={label_2} maxlength="8" placeholder="Stack">
                            <input id="label-3" bind:value={label_3} maxlength="8" placeholder="ε">
                        </div>
                        <div class="nodes">
                            <input class={sourceB ? "errHigh" : ""} id="source-input" bind:value={source} maxlength="8" placeholder="Source">
                            <input class={targetB ? "errHigh" : ""} id="target-input" bind:value={target} maxlength="8" placeholder="Target">
                        </div>
                        {#if showError}
                            <p class="error-text" style="color: #ff6969;">{errorType}</p>
                        {/if}
                    </div>
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
        border-radius: 0.5em;
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
        /*pointer-events: auto;*/
        background: #f7f7f8;
        color: #363636;
        border: none;
        outline: 0.05rem solid #363636;
        padding: 0.75rem;
        overflow: auto;
        font: 1rem / 1.5rem 'Open Sans', sans-serif;
        border-radius: 0.5rem;
        margin-bottom: 0.75rem;
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
        /*box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;*/
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
        background: #eee;
    }

    button:active {
        outline: none;
    }

    button:focus {
        outline: 2px solid #4285f4;
    }

    .single-button {
        display: block;
        margin: auto;
    }

    input {
        border: 1px solid #363636;
        border-radius: 0.25rem;
        padding: 0.5rem;
        font-size: 1rem;
        transition: 200ms ease-in-out;
    }

    input[type="checkbox"] {
        margin: 0;
    }

    .errHigh {
        background-color: #ff6969;
    }

    .error-text {
        margin: 0;
    }

    .label-box {
        display: flex;
        gap: 1rem;
    }

    .nodes {
        display: flex;
        gap: 1rem;
    }

    .edge-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2rem;

    }
</style>