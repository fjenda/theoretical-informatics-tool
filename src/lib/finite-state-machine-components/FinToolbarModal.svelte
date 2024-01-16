<script lang="ts">
    import type {ToolbarButtonType} from "../../types/ToolbarButtonType";
    import FinAutomatonGeneratorLayout from "./FinAutomatonGeneratorLayout.svelte";
    import ToggleSwitch from "./ToggleSwitch.svelte";
    import StateComboBox from "../StateComboBox.svelte";
    import StateMultiSelect from "../StateMultiSelect.svelte";

    import FinTransitionFuncInput from "./FinTransitionFuncInput.svelte";
    import FinTestInput from "./FinTestInput.svelte";
    import FinAlphabetInput from "./FinAlphabetInput.svelte";
    import {configuration_store, resetInputVar} from "../../stores/graphInitStore";

    let currentState = false;
    let startNode  : string;
    let endNode : string;
    let alphabet : string;

    export let showModal : boolean;
    export let type : ToolbarButtonType;
    export let func : Function;
    let dialog;
    let config : string = "";
    let label : string, source : string, target : string, rules : string;

    $: if (dialog && showModal) dialog.showModal();

    $: if (showModal && type === "show-configuration") {
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
        const stackAlphabet = new Set();
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
                func({ id: label, label: label});
                return true;
            }

            case "new-edge": {
                const modifiedSource = source.trim();
                const modifiedTarget = target.trim();
                console.log("new-edge - " + modifiedLabel + " " + modifiedSource + " -> " + modifiedTarget);
                func({id: `${source}-${target}`, label: label, source: source, target: target});
                return true;
            }
        }
    }

    function checkRules(){
        let automata : AutomataMeta = {
            type : 'DFA',
            input : rules,
        }
        func(automata);
        return true;
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

            {#if ["new-node", "new-edge"].includes(type)}
                <div class="input-box">
                    <input bind:value={label} maxlength="8" placeholder="Label">
                </div>
            {/if}


            {#if type === "new-edge"}
                <div class="input-box">
                    <input bind:value={source} maxlength="8" placeholder="Source">
                    <input bind:value={target} maxlength="8" placeholder="Target">
                </div>
            {/if}

            {#if type === "show-configuration"}
                 <textarea id="transitions"
                           class="transitions-input"
                           cols="30" rows="20"
                           readonly = {true}
                           value={config}
                           placeholder="Transitions"></textarea>

                <hr />
                <button on:click={() => dialog.close()}>Cancel</button>
            {/if}

            {#if type === "generate-automata"}
                <FinAutomatonGeneratorLayout >
                    <ToggleSwitch slot="type-switch" />
                    <FinAlphabetInput phText="Alphabet" slot="alphabet"/>
                    <StateComboBox slot="start-state" />
                    <StateMultiSelect />
                    <FinTransitionFuncInput slot="transitions" />

                    <div class="button-wrapper" slot="buttons">
                        <button on:click={() => {
                    resetInputVar.set(true);
                    dialog.close();
                }}>Cancel</button>
                        <button on:click={() => {
                    func();
                    resetInputVar.set(true);
                    dialog.close();
                }}>Apply</button>
                    </div>
                </FinAutomatonGeneratorLayout>
            {/if}



        <hr />

        {#if type === "generate-automata"}
<!--            <button on:click={() => dialog.close()}>Cancel</button>-->
<!--            <button on:click={() => checkRules() && resetInput() && dialog.close()}>Apply</button>-->
        {:else}
            <button on:click={() => dialog.close()}>Cancel</button>
            <button on:click={() => checkInput(type) && resetInput() && dialog.close()}>Apply</button>
        {/if}


    </div>
</dialog>

<style>
    dialog {
        max-width: 32em;
        border-radius: 0.2em;
        border: none;
        padding: 0;
        background: #ffffff;
    }

    :global(body.dark-mode) dialog {
        background: #d0d0d0;
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
</style>