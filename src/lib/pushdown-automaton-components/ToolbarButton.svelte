<script lang="ts">
import ToolbarModal from "./ToolbarModal.svelte";



export let type : ToolbarButtonType;
export let text : string = "";
export let func : Function = () => {};
let showModal = false;

</script>

{#if ["new-node", "new-edge"].includes(type)}
    <button on:click={() => (showModal = true)}>
        {text}
    </button>

    <ToolbarModal bind:showModal type={type} func={func}>
        <h2 slot="header">
            {type}
        </h2>

        <ol class="definition-list">
            <li>Input the name of the new node that doesn't exist already.</li>
            <li>Click add to finish.</li>
        </ol>
    </ToolbarModal>
{:else}
    <button on:click={() => func()}>
        {text}
    </button>
{/if}

<style>
    button {
        border-radius: 2rem;
    }
</style>


