<script lang="ts">
    import type {ToolbarButtonType} from "../../types/ToolbarButtonType";
    import FinAutomatonGeneratorLayout from "./FinAutomatonGeneratorLayout.svelte";
    import ToggleSwitch from "./ToggleSwitch.svelte";
    import FinStateComboBox from "./FinStateComboBox.svelte";
    import StateMultiSelect from "../StateMultiSelect.svelte";

    import FinTransitionFuncInput from "./FinTransitionFuncInput.svelte";
    import {
        configuration_store,
        graph_store,
        resetInputVar
    } from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import StartStateMultiSelect from "../StartStateMultiSelect.svelte";


    export let showModal : boolean;
    export let type : ToolbarButtonType;
    export let func : Function;
    let dialog;
    let isFinishState : boolean = false;
    let isStartState : boolean = false;
    let showError : boolean = false;
    let errorType : string = "";
    let sourceB : boolean = false;
    let targetB : boolean = false;
    let config : string = "";
    let label : string, source : string, target : string, rules : string;

    $: if (dialog && showModal) dialog.showModal();

    $: if (showModal && type === "show-definition") {
        func();

        if ($configuration_store.nodes?.length === 0 || !$configuration_store.nodes) {
            config = "No configuration to show";
        } else {
            generateConfiguration();
        }
    }

    function generateConfiguration() {
        config = "";
        // states from nodes
        config += `Q: {${$configuration_store.nodes.join(", ")}}\n`;


        const alphabet = new Set();
        $configuration_store.transitions.forEach((transition) => {
            if (transition.input !== "ε") {
                alphabet.add(transition.input);
            }

        });
        config += `Σ: {${Array.from(alphabet).join(", ")}}\n`;

        // transitions
        config += "δ: {\n";
        $configuration_store.transitions.forEach((transition) => {
            config += `    (${transition.state}, ${transition.input}) → (${transition.stateAfter})\n`;
        });
        config += "}\n";

        // start state
        config += `I: {${$configuration_store.initial_state.join(", ")}}\n`;

        // final states
        config += `F: {${$configuration_store.final_states.join(", ")}}\n`;
    }

    function resetInput() {
        label = "", source = "", target = "", rules = "";
        isFinishState = false;
        isStartState = false;
        showError = false;
        errorType = "";
        sourceB = false;
        targetB = false;
        return true;
    }

    function checkInput(type) {
        errorType = "";
        showError = false;

        if (!["new-node", "new-edge"].includes(type)) {
            func();
            return true;
        }

        if (type == "new-node") {
            if (!label?.trim()) {
                showError = true;
                errorType = "Label is empty";
                return false;
            }

            // check if node exists
            if ($graph_store.nodes.find((node) => node.label === label)) {
                showError = true;
                errorType = "Node already exists";
                return false;
            }
        }

        if (type == "new-edge") {
            sourceB = false;
            targetB = false;
            let wrongID = false;
            if (!source?.trim()) {
                showError = true;
                sourceB = true;
            }

            if (!target?.trim()) {
                showError = true;
                targetB = true;
            }

            const nodes = $graph_store.nodes.filter((node) => node.label === target || node.label === source);
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


        switch (type) {
            case "new-node": {
                let folowingID = $graph_store.followingID;
                if (isStartState && isFinishState) {
                    func({id: folowingID.toString(), label: label, class: "finish start"});
                } else if (isStartState)
                    func({id: folowingID.toString(), label: label, class: "start"});
                else if (isFinishState) {
                    func({id: folowingID.toString(), label: label, class: "finish"});
                } else {
                    func({id: folowingID.toString(), label: label});
                }
                func({ id: folowingID.toString(), label: label});
                $graph_store.followingID++;
                return true;
            }

            case "new-edge": {
                if(!label) label = "ε";
                const modifiedSource = source.trim();
                const modifiedTarget = target.trim();
                let sourceID = $graph_store.nodes.find(node => node.label === modifiedSource)?.id;
                let targetID = $graph_store.nodes.find(node => node.label === modifiedTarget)?.id;
                console.log("new-edge - " + label.trim() + " " + sourceID + " -> " + targetID);
                func({id: `${sourceID}-${targetID}`, label: label, source: sourceID, target: targetID});
                return true;
            }
        }
    }

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
            <button class="single-button" on:click={() => dialog.close()}>Cancel</button>

        {:else if type === "generate-automata"}
            <FinAutomatonGeneratorLayout >
                <ToggleSwitch slot="type-switch" />

                <button class="epsilon" slot="eps-button" on:click={insertEps}>Insert ε</button>

                <FinStateComboBox key={125} slot="start-state" />

                <StartStateMultiSelect key={126} slot="multi-select-start" />
                <StateMultiSelect key={127} slot="multi-select" options={$graph_store.nodes}/>

                <FinTransitionFuncInput slot="transitions" />

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
            </FinAutomatonGeneratorLayout>
        {:else}
            <div class="input-box">
                {#if type === "new-node"}
                    {#if showError}
                        <p class="error-text" style="color: #ff6969;">{errorType}</p>
                    {/if}
                    <input class={showError ? "errHigh" : ""} bind:value={label} maxlength="8" placeholder="Label">
                    {#if !$configuration_store.initial_state || $configuration_store.initial_state.length === 0}
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
                        <div class="nodes">
                            <input class={sourceB ? "errHigh" : ""} id="source-input" bind:value={source} maxlength="8" placeholder="Source">
                            <input id="label" bind:value={label} maxlength="8" placeholder="ε">
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
        background: #f7f7f8;
        color: #363636;
        border: none;
        outline: 0.05rem solid #363636;
        padding: 0.2rem;
        overflow: auto;
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
        background: #f4f9ff;
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
</style>