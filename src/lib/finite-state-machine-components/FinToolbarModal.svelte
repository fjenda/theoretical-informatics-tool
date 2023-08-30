<script lang="ts">
    import type {ToolbarButtonType} from "../../types/ToolbarButtonType";

    export let showModal : boolean;
    export let type : ToolbarButtonType;
    export let func : Function;
    let dialog;
    let label : string, source : string, target : string, rules : string;

    $: if (dialog && showModal) dialog.showModal();

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

        <div class="input-box">
            {#if ["new-node", "new-edge"].includes(type)}
                <input bind:value={label} maxlength="8" placeholder="Label">
            {/if}

            {#if type === "new-edge"}
                <input bind:value={source} maxlength="8" placeholder="Source">
                <input bind:value={target} maxlength="8" placeholder="Target">
            {/if}

            {#if type === "generate-automata"}
                <textarea bind:value={rules} id="autInp"  rows="10" cols="33" placeholder=">(q0,0) = q0"></textarea>
            {/if}

        </div>

        <hr />

        {#if type === "generate-automata"}
            <button on:click={() => dialog.close()}>Cancel</button>
            <button on:click={() => checkRules() && resetInput() && dialog.close()}>Apply</button>
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
</style>