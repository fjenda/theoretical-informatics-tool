<script lang="ts">
import FinToolbarModal from "./FinToolbarModal.svelte";
import {onMount} from "svelte";



export let type : ToolbarButtonType;
export let text : string = "";
export let func : Function = () => {};
let btn : HTMLButtonElement;
let btnState : string = "normal";
let showModal = false;


function toggleButton() {
    if (btnState === "normal") {
        btnState = "active";
    } else {
        btnState = "normal";
    }
}

onMount(() => {
    if (type === "delete-element") {
        btn.addEventListener("click", toggleButton);
    }
})

</script>

{#if ["new-node", "new-edge"].includes(type)}
    <button on:click={() => (showModal = true)}>
        {text}
    </button>

    <FinToolbarModal bind:showModal type={type} func={func}>
        <h2 slot="header">
            {type}
        </h2>

        <ol class="definition-list">
            <li>Input the name of the new node that doesn't exist already.</li>
            <li>Click add to finish.</li>
        </ol>
    </FinToolbarModal>
{:else if type === "generate-automata"}
    <button on:click={() => (showModal = true)}>
        {text}
    </button>

    <FinToolbarModal bind:showModal type={type} func={func}>
        <h2 slot="header">
            {type}
        </h2>

        <ol class="definition-list">
            <li>Input transition functions by to given pattern.</li>
            <li>'>' is for starting node</li>
            <li>'&lt;' is for accepting node</li>
            <li>Click apply to generate automata.</li>
        </ol>
    </FinToolbarModal>
{:else if type === "delete-element"}
    <button class={btnState} bind:this={btn} on:click={() => func()}>
        {text}
    </button>
{:else}
    <button on:click={() => func()}>
        {text}
    </button>
{/if}

<style>
    button {
        border-radius: 2rem;
    }

    .active {
        border: 2px solid red;
    }
</style>


