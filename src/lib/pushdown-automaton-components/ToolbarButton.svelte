<!--
    ToolbarButton.svelte
    This component represents a button in the toolbar.
    It can be of several types, each with different behavior.
    The button can be a simple button, a button that opens a modal, etc.
    Author: Jan Fojtík
-->

<script lang="ts">
import {resetInputVar} from "../../stores/graphInitStore";
import ToolbarModal from "./ToolbarModal.svelte";
import {onMount} from "svelte";
import {tooltip} from "../tooltipUtils";

export let type : ToolbarButtonType;
export let text : string = "";
export let func : Function = () => {};
let btn : HTMLButtonElement;
let btnState : string = "normal";
let showModal = false;

// Function to toggle the button state (used for delete-element button)
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
                                                "d(q0,a,Z)=(q1,AZ);\n" +
                                                "d(q1,b,A)=(q2,BA);\n" +
                                                "d(q2,c,B)=(q3,ε);\n\n" +
                                                "Alphabet and stack symbols will be automatically\n" +
                                                "generated from the rules. Usage of only\n" +
                                                "alphanumeric characters is expected\n\n" +
                                                "The initial stack symbol will always be Z.\n\n" +
                                                "Automaton Type:\n" +
                                                "   Empty - Accepts with empty stack\n" +
                                                "   Final    - Accepts in final state\n" +
                                                "   Both    - Accepts in final state with empty stack\n\n" +
                                                "You can choose the start and final states\nafter writing the rules."}>
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
        font-weight: 500;
        cursor: pointer;
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        white-space: break-spaces;
        text-align: left;
    }

    .header {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .header :global(#tooltip) {
        transform: translate(-100%, 0%);
    }
</style>


