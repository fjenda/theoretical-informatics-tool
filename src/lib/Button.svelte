<script lang="ts">

    import  { navigate } from "svelte-routing";
    import {
        grammar_results_store,
        graph_store,
        stack_store,
        table_index_store,
        user_grammar_store
    } from "../stores/graphInitStore";

    export let type : ButtonType;
    export let url : string = "";
    export let func : Function = () => {};
    export let text : string = "";

    // types of buttons that should reset the stores when clicked
    let resettableButtons: string[] = ["read-more", "tool", "back", "tab"];

    function resetStores() {
        graph_store.update((n) => {
            n.status = undefined;
            n.isAccepted = undefined;
            n.traversal = [];
            n.word = "";
            return n;
        });
        stack_store.set([]);
        table_index_store.set(-1);
        grammar_results_store.reset();
    }
</script>

{#if type !== ""}
    <div class="{type}-box" {...$$restProps}>
        {#if resettableButtons.includes(type.toString())}
            <button class="button-17 {type}" on:click={() => {navigate(url); resetStores(); }} on:click={() => func()}>
                {text}
            </button>
        {:else}
            <button class="button-17 {type}" on:click={() => {navigate(url); }} on:click={() => func()}>
                {text}
            </button>
        {/if}
    </div>
{:else}
    <!-- todo -->
{/if}

<style>
    .process-box {
        display: flex;
        justify-content: center;
        margin: auto 2rem 1rem 2rem;

        height: 6vh;
        width: 100%;
    }

    .test {
        width: 12rem !important;
    }

    .read-more-box {
        display: flex;
        justify-content: center;
        margin: auto;

        height: 3rem;
        width: 10rem;
    }

    .dfa-box{
        /*display: inline-block;*/
        display: flex;
        justify-content: center;
        margin: 1rem auto;

        font-size: 1.8rem;
        height: 6vh;
        width: 5vw;
    }

    .back-box {
        display: flex;
        justify-content: center;
        margin: auto 2rem 1rem 2rem;

        height: 6vh;
        width: 60%;
    }

    .tool-box {
        display: flex;
        justify-content: center;
        margin: auto 2rem 1rem 2rem;

        /*font-size: 1.8rem;*/
        height: 3rem;
        width: 60%;
        min-width: 10rem;
    }

    .tab-box {
        display: flex;
        justify-content: center;

        width: fit-content;
        min-width: 15rem;
        /*height: 4vh;*/
    }

   .button-17 {
       /*appearance: none;*/
       align-items: center;
       background-color: #9CC6FB;
       border-radius: 0.5rem;
       border-style: none;
       box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
       box-sizing: border-box;
       color: #363636;
       cursor: pointer;
       display: inline-flex;
       /*fill: currentcolor;*/
       /*font-family: "Google Sans",Roboto,Arial,sans-serif;*/
       font-size: 1.25rem;
       font-weight: 500;
       height: 2.75rem;
       justify-content: center;
       letter-spacing: .016rem;
       /*line-height: normal;*/
       max-width: 100%;
       min-width: 7.5rem;
       overflow: visible;
       padding: 0.125rem 1.5rem;
       position: relative;
       text-align: center;
       text-transform: none;
       transition: box-shadow 280ms cubic-bezier(.4, 0, .2, 1),opacity 15ms linear 30ms,transform 270ms cubic-bezier(0, 0, .2, 1) 0ms;
       user-select: none;
       -webkit-user-select: none;
       touch-action: manipulation;
       width: 100%;
       will-change: transform,opacity;
       z-index: 0;
   }

   :global(body.dark-mode) .button-17 {
       color: #f4f9ff;
       background: #4A3F64;
   }

   :global(body.dark-mode) .button-17:hover {
       color: #4A3F64;
       background: #f4f9ff;
   }

    .button-17:hover {
        color: #174ea6;
        background: #f4f9ff;
    }

    .button-17:active {
        box-shadow: 0 4px 4px 0 rgb(60 64 67 / 30%), 0 8px 12px 6px rgb(60 64 67 / 15%);
        outline: none;
    }

    .button-17:focus {
        /*outline: none;*/
        outline: 2px solid #4285f4;
    }

    .button-17:not(:disabled) {
        box-shadow: rgba(60, 64, 67, .3) 0 1px 3px 0, rgba(60, 64, 67, .15) 0 4px 8px 3px;
    }

    .button-17:not(:disabled):hover {
        box-shadow: rgba(60, 64, 67, .3) 0 2px 3px 0, rgba(60, 64, 67, .15) 0 6px 10px 4px;
    }

    .button-17:not(:disabled):focus {
        box-shadow: rgba(60, 64, 67, .3) 0 1px 3px 0, rgba(60, 64, 67, .15) 0 4px 8px 3px;
    }

    .button-17:not(:disabled):active {
        box-shadow: rgba(60, 64, 67, .3) 0 4px 4px 0, rgba(60, 64, 67, .15) 0 8px 12px 6px;
    }

    .button-17:disabled {
        box-shadow: rgba(60, 64, 67, .3) 0 1px 3px 0, rgba(60, 64, 67, .15) 0 4px 8px 3px;
    }
</style>