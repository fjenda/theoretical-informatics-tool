<script lang="ts">
    import type {ToolbarButtonType} from "../../types/ToolbarButtonType";
    import FinAutomatonGeneratorLayout from "./FinAutomatonGeneratorLayout.svelte";
    import ToggleSwitch from "./ToggleSwitch.svelte";
    import FinStateComboBox from "./FinStateComboBox.svelte";
    import StateMultiSelect from "../StateMultiSelect.svelte";

    import FinTransitionFuncInput from "./FinTransitionFuncInput.svelte";
    import {configuration_store, graph_store, resetInputVar} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import StartStateMultiSelect from "../StartStateMultiSelect.svelte";

    let currentState = false;
    let startNode  : string;
    let endNode : string;
    let alphabet : string;

    export let showModal : boolean;
    export let type : ToolbarButtonType;
    export let func : Function;
    let dialog;
    let isFinishState : boolean = false;
    let isStartState : boolean = false;
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

        // input alphabet and stack alphabet from transitions
        const alphabet = new Set();
        $configuration_store.transitions.forEach((transition) => {
            if (transition.input !== "E") {
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
        config += `q0: ${$configuration_store.start_state}\n`;

        // final states
        config += `F: {${$configuration_store.final_states.join(", ")}}\n`;
    }

    function resetInput() {
        label = "", source = "", target = "", rules = "";
        return true;
    }

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
                let folowingID = $graph_store.followingID;
                console.log('new node string: ' + folowingID.toString());
                func({ id: folowingID.toString(), label: label});
                $graph_store.followingID++;
                return true;
            }

            case "new-edge": {
                const modifiedSource = source.trim();
                const modifiedTarget = target.trim();
                let sourceID = $graph_store.nodes.find(node => node.label === modifiedSource)?.id;
                let targetID = $graph_store.nodes.find(node => node.label === modifiedTarget)?.id;
                console.log("new-edge - " + modifiedLabel + " " + sourceID + " -> " + targetID);
                func({id: `${sourceID}-${targetID}`, label: label, source: sourceID, target: targetID});
                return true;
            }
        }
    }

</script>

<dialog
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
>
    <div on:click|stopPropagation>
        <slot name="header" />
        <hr />
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
            <FinAutomatonGeneratorLayout >
                <ToggleSwitch slot="type-switch" />

                <FinStateComboBox key={125} slot="start-state" />

                <StartStateMultiSelect key={126} slot="multi-select-start" />
                <StateMultiSelect key={127} slot="multi-select" />

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
                {#if ["new-node", "new-edge"].includes(type)}
                    <input bind:value={label} maxlength="8" placeholder="Label">
                {/if}

                {#if type === "new-node"}
                    {#if !$configuration_store.start_state || $configuration_store.start_state.length === 0}
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
    }

    :global(body.dark-mode) #transitions {
        background: #25252d;
        color: #f4f9ff;
    }
</style>