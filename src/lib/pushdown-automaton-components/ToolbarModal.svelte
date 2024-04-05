<script lang="ts">
    import TransitionFunctionInput from "./TransitionFunctionInput.svelte";
    import ThreeWaySwitch from "./ThreeWaySwitch.svelte";
    import MultiSelectState from "./MultiSelectState.svelte";

    import {
        pda_graph_store,
        resetInputVar,
        pda_configuration_store,
        user_grammar_store,
        pda_backup_store
    } from "../../stores/graphInitStore";
    import AutomatonGeneratorLayout from "./AutomatonGeneratorLayout.svelte";
    import {input_error_store} from "../../stores/inputErrorStore";
    import StateComboBox from "./StateComboBox.svelte";
    import StateMultiSelect from "../StateMultiSelect.svelte";
    import type {ToolbarButtonType} from "../../types/ToolbarButtonType";
    import {MultiSelect} from "flowbite-svelte";

    export let showModal : boolean;
    export let type : ToolbarButtonType;
    export let func : Function;
    let dialog;
    let label : string, source : string, target : string;
    let label_1 : string, label_2 : string, label_3 : string;
    let isFinishState : boolean = false;
    let isStartState : boolean = false;
    let config : string = "";

    $: if (dialog && showModal) dialog.showModal();

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

    function generateConfiguration() {
        if (type === "show-definition") {
            config = "";
            // states from nodes
            config += `Q: {${$pda_configuration_store.states.join(", ")}}\n`;

            // input alphabet and stack alphabet from transitions
            const alphabet = new Set();
            const stackAlphabet = new Set();
            $pda_configuration_store.transitions.forEach((transition) => {
                if (transition.input !== "ε") {
                    alphabet.add(transition.input);
                }

                if (transition.stack !== "ε") {
                    stackAlphabet.add(transition.stack);
                }

                for (let c of transition.stackAfter) {
                    if (c !== "ε") {
                        stackAlphabet.add(c);
                    }
                }

            });
            config += `Σ: {${Array.from(alphabet).join(", ")}}\n`;
            config += `Γ: {${Array.from(stackAlphabet).join(", ")}}\n`;

            // transitions
            let i = 1;
            config += "δ: {\n";
            $pda_configuration_store.transitions.forEach((transition) => {
                config += `   ${i}. (${transition.state}, ${transition.input}, ${transition.stack}) → (${transition.stateAfter}, ${transition.stackAfter.join("")})\n`;
                i++;
            });
            config += "}\n";

            // start state
            config += `q0: ${$pda_configuration_store.initial_state}\n`;

            // stack default
            config += `Z0: ${$pda_configuration_store.initial_stack_symbol}\n`;

            // final states
            if ($pda_configuration_store.type !== "empty")
                config += `F: {${$pda_configuration_store.final_states.join(", ")}}\n`;
        } else if (type === "cfg-definition") {
            config = $user_grammar_store.toString();
        }
    }

    function resetInput() {
        label = "", source = "", target = "";
        label_1 = "", label_2 = "", label_3 = "";
        isFinishState = false;
        isStartState = false;
        return true;
    }

    function checkInput(type: ToolbarButtonType) {
        if (!["new-node", "new-edge"].includes(type)) {
            func();
            return true;
        }

        if (type == "new-node" && !label?.trim()) {
            // console.log("bad input");
            return false;
        }

        if (type == "new-edge") {
            if (!source?.trim() || !target?.trim() || !label_2?.trim()) {
                // console.log("bad input");
                return false;
            }
        }

        switch (type) {
            case "new-node": {
                // console.log("new-node - " + modifiedLabel);
                if (isStartState && isFinishState) {
                    func({id: label, label: label, class: "finish start"});
                } else if (isStartState)
                    func({id: label, label: label, class: "start"});
                else if (isFinishState) {
                    func({id: label, label: label, class: "finish"});
                } else {
                    func({id: label, label: label});
                }

                return true;
            }

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
</script>

<dialog
    bind:this={dialog}
    on:close={() => (showModal = false)}
    on:click|self={() => dialog.close()}
>
    <div on:click|stopPropagation>
        <slot name="header" />
<!--        <hr />-->
        <slot />

        {#if type === "show-definition" || type === "cfg-definition"}
            <textarea id="transitions"
                      class="transitions-input"
                      cols="35" rows="20"
                      readonly = {true}
                      value={config}
                      placeholder="Transitions"></textarea>

<!--            <hr />-->
            <button class="single-button" on:click={() => dialog.close()}>Close</button>

        {:else if type === "generate-graph"}
            <AutomatonGeneratorLayout>
                <ThreeWaySwitch slot="type-switch" />
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
                    func() &&
                    dialog.close()
                }}>Apply</button>
                </div>
            </AutomatonGeneratorLayout>
        {:else}
            <div class="input-box">
                {#if type === "new-node"}
                    <input bind:value={label} maxlength="8" placeholder="Label">
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
                    <input id="label-1" bind:value={label_1} maxlength="8" placeholder="ε">
                    <input id="label-2" bind:value={label_2} maxlength="8" placeholder="Stack">
                    <input id="label-3" bind:value={label_3} maxlength="8" placeholder="ε">
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
</style>