<script lang="ts">
import FinToolbarModal from "./FinToolbarModal.svelte";
import {onMount} from "svelte";
import {graph_store, resetInputVar} from "../stores/graphInitStore";



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

{#if ["new-node", "new-edge", "generate-automata", "show-configuration"].includes(type)}
    {#if type === "generate-graph"}
        <button on:click={() => { showModal = true; resetInputVar.set(true); graph_store.reset(); }}>
            {text}
        </button>
    {:else}
        <button on:click={() => { showModal = true; resetInputVar.set(true); }}>
            {text}
        </button>
    {/if}

    <FinToolbarModal bind:showModal type={type} func={func}>
        <h2 slot="header">
            {type}
        </h2>
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
        /*border-radius: 1rem;*/
        border-radius: 0.3rem;
        border: 0.1rem solid #c5c5c5;
    }

    button:hover {
        outline: 0.1rem solid blue; /* Change the outline when the mouse is over the button */
    }


    .active {
        outline: 0.1rem solid red;
    }
</style>


