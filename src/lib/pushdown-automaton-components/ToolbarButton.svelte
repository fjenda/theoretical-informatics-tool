<script lang="ts">
import {resetInputVar, pda_graph_store} from "../../stores/graphInitStore";
import ToolbarModal from "./ToolbarModal.svelte";
import {onMount} from "svelte";
import {tooltip} from "../tooltipUtils";

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
{#if ["new-node", "new-edge", "generate-graph", "show-definition", "cfg-definition"].includes(type)}
    {#if type === "generate-graph"}
        <button on:click={() => { showModal = true; resetInputVar.set(true); }}>
            {text}
        </button>
    {:else}
        <button on:click={() => { showModal = true; resetInputVar.set(true); }}>
            {text}
        </button>
    {/if}

    <ToolbarModal bind:showModal type={type} func={func}>
        <h2 class="header" slot="header">
            {text}

            {#if type === "generate-graph"}
                <span class="ttip" use:tooltip={"Write the rules in the form\n\n" +
                                                "d(q0,a,Z)=(q1,A Z);\n" +
                                                "d(q1,b,A)=(q2,B A);\n" +
                                                "d(q2,c,B)=(q3,ε);\n" +
                                                "\nIf you don't put a space\n" +
                                                "between the characters\nto be put on the stack,\n" +
                                                "the rules will not load properly.\n\n" +
                                                "The initial stack symbol\nwill always be Z."}>
                ?</span>
            {/if}
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
        background-color: #f7f7f8;
        border: 0.05rem solid #393939;
        position: relative;
    }

    :global(body.dark-mode) button {
        background-color: #2f3941;
        border: 0.05rem solid #4A3F64;
        color: #f4f9ff;
    }

    .active {
        outline: 0.1rem solid red;
    }

    button:hover {
        /*outline: 0.1rem solid #007bff;*/
        transition: 0.3s;
        background-color: #e4e8ee;
    }

    :global(body.dark-mode) button:hover {
        background-color: #242c2f;
    }

    .ttip {
        font-size: 1rem;
        cursor: pointer;
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        white-space: break-spaces;
    }

    .header {
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>


