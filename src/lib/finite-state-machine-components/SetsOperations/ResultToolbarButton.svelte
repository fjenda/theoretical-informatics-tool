<!--
    ResultToolbarButton.svelte
    This component is used to create buttons in the toolbar in the result section.
    Author: Marek Krúpa
-->

<script lang="ts">
    import {onMount} from "svelte";
    import {tooltip} from "../../tooltipUtils";
    import {resetInputVar, result_graph_store} from "../../../stores/graphInitStore";
    import ResultToolbarModal from "./ResultToolbarModal.svelte";

    // Variables
    export let type : ToolbarButtonType;
    export let text : string = "";
    export let func : Function = () => {};
    let btn : HTMLButtonElement;
    let btnState : string = "normal";
    let showModal = false;

    // Function for toggling the button
    function toggleButton() {
        if (btnState === "normal") {
            btnState = "active";
        } else {
            btnState = "normal";
        }
    }

    // Initialize the button for deleting elements
    onMount(() => {
        if (type === "delete-element") {
            btn.addEventListener("click", toggleButton);
        }
    })

</script>

{#if ["new-node", "new-edge", "generate-automata", "show-definition"].includes(type)}
    {#if type === "generate-automata"}
        <button on:click={() => {showModal = true; resetInputVar.set(true); result_graph_store.reset(); }}>
            {text}
        </button>
    {:else}
        <button on:click={() => { showModal = true; resetInputVar.set(true); }}>
            {text}
        </button>
    {/if}

    <ResultToolbarModal bind:showModal type={type} func={func}>
        <h2 class="header" slot="header">
            {type.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}

            {#if type === "generate-automata"}
                <span class="ttip" use:tooltip={"Write the rules in the form\n\n" +
                                                "d(q0,a)=q0;\n" +
                                                "d(q0,b)=q1;\n" +
                                                "d(q1,b)=q0;\n" +
                                                "d(q0,ε)=q1;\n" +
                                                "\nFor NFA you can choose \n" +
                                                "more then one Start state"}>
                ?</span>
            {/if}

        </h2>
    </ResultToolbarModal>

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
        position: relative;
    }

    :global(body.dark-mode) button {
        background: #2f3941;
        border: 0.05rem solid #4A3F64;
        color: #f4f9ff;
    }


    .active {
        outline: 0.1rem solid red;
    }


    button:hover {
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


