<script lang="ts">
import FinToolbarModal from "./FinToolbarModal.svelte";
import {onMount} from "svelte";
import {graph_store, resetInputVar} from "../../stores/graphInitStore";



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
        border-radius: 0.3rem;
        background: #f7f7f8;
        border: 0.05rem solid #393939;
    }

    :global(body.dark-mode) button {
        background: #2f3941;
        border: 0.05rem solid #4A3F64;
        color: #f4f9ff;
    }


    button:hover {
        outline: 0.1rem solid #007bff;
    }


    .active {
        outline: 0.1rem solid red;
    }
</style>


