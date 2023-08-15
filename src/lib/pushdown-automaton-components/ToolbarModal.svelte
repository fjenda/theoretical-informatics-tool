<script lang="ts">
    import type {ToolbarButtonType} from "../../types/ToolbarButtonType";

    export let showModal : boolean;
    export let type : ToolbarButtonType;
    let dialog;
    let label : string, source : string, target : string;

    $: if (dialog && showModal) dialog.showModal();

    function checkInput(type) {
        if (type != "new-node" && type != "new-edge") {
            console.log("no input");
            return true;
        }

        if (label == undefined || label.trim() == "") {
            console.log("bad input");
            return false;
        }

        if (type === "new-edge") {
            if (source == undefined || target == undefined || source.trim() == "" || target.trim() == "") {
                console.log("bad input");
                return false;
            }
        }

        const modifiedLabel = label.trim();

        switch (type) {
            case "new-node": {
                console.log("new-node - " + modifiedLabel);
                return true;
            }

            case "new-edge": {
                const modifiedSource = source.trim();
                const modifiedTarget = target.trim();
                console.log("new-edge - " + modifiedLabel + " " + modifiedSource + " -> " + modifiedTarget);
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

        <div class="input-box">
            {#if type === "new-node" || type === "new-edge"}
                <input bind:value={label} maxlength="8" placeholder="Label">
            {/if}

            {#if type === "new-edge"}
                <input bind:value={source} maxlength="8" placeholder="Source">
                <input bind:value={target} maxlength="8" placeholder="Target">
            {/if}
        </div>

        <hr />
        <button on:click={() => dialog.close()}>Cancel</button>
        <button on:click={() => checkInput(type) && dialog.close()}>Apply</button>
    </div>
</dialog>

<style>
    dialog {
        max-width: 32em;
        border-radius: 0.2em;
        border: none;
        padding: 0;
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