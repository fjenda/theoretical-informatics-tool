<script lang="ts">
import ToolbarModal from "./ToolbarModal.svelte";
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

{#if ["new-node", "new-edge", "show-transitions"].includes(type)}
    <button on:click={() => (showModal = true)}>
        {text}
    </button>

    <ToolbarModal bind:showModal type={type} func={func}>
        <h2 slot="header">
            {type}
        </h2>
    </ToolbarModal>
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


