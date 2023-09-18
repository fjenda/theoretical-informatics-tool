<script lang="ts">
import {resetInputVar} from "../../stores/graphInitStore";
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
{#if ["new-node", "new-edge", "generate-graph", "show-configuration"].includes(type)}
    <button on:click={() => { showModal = true; resetInputVar.set(false);}}>
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
        /*border-radius: 1rem;*/
        border-radius: 0.3rem;
        border: 0.1rem solid #c5c5c5;
    }

    .active {
        outline: 0.1rem solid red;
    }
</style>


