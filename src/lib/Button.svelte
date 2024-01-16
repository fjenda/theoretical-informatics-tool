<script lang="ts">

    import  { navigate } from "svelte-routing";

    export let type : ButtonType;
    export let url : string = "";
    export let func : Function = () => {};
    export let text : string = "";
</script>

{#if type !== ""}
    <div class="{type}-box">
        <button class="button-17" on:click={() => navigate(url)} on:click={() => func()}>
            {text}
        </button>
    </div>
{:else}
    <!-- todo -->
{/if}

<style>
    .process-box {
        display: flex;
        justify-content: center;
        margin: auto;

        width: 9.5vw;
        height: 4vh;
    }

    .test-box {
        display: flex;
        justify-content: center;
        margin: 1rem auto;

        font-size: 1.8rem;
        height: 6vh;
        width: 60%;
    }

    /*.test-button {*/
    /*    background: #DE897D;*/
    /*    color: #f4f9ff;*/
    /*}*/

    /*:global(body.dark-mode) .test-button {*/
    /*    background: #4A3F64;*/
    /*    color: #f4f9ff;*/
    /*}*/

    .read-more-box {
        display: flex;
        justify-content: center;
        margin: auto;

        height: 3rem;
        width: 10rem;
    }

    .dfa-box{
        display: inline-block;
        /*display: flex;*/
        justify-content: center;
        margin: 1rem auto;

        font-size: 1.8rem;
        height: 6vh;
        width: 5vw;
    }

    .back-box {
        position: absolute;
        bottom: 0.01rem;
        left: 50%;

        -ms-transform: translateX(-50%);
        -webkit-transform: translateX(-50%);
        -moz-transform: translateX(-50%);
        -o-transform: translateX(-50%);
        transform: translateX(-50%);

        display: flex;
        justify-content: center;
        margin: 2rem auto;

        /*font-size: 1.8rem;*/
        height: 6vh;
        width: 60%;
    }

    .tool-box {
        position: absolute;
        left: 50%;
        bottom: 2.5rem;

        -ms-transform: translateX(-50%);
        -webkit-transform: translateX(-50%);
        -moz-transform: translateX(-50%);
        -o-transform: translateX(-50%);
        transform: translateX(-50%);

        display: flex;
        justify-content: center;

        /*font-size: 1.8rem;*/
        height: 3rem;
        width: 60%;
        min-width: 10rem;
    }

    /*button {*/
    /*    width: 12.5rem;*/
    /*    min-width: 7.5rem;*/

    /*    min-height: 2.5rem;*/

    /*    border-radius: 1.5rem;*/
    /*    border: 0.01rem solid transparent;*/

    /*    font-size: 1em;*/
    /*    font-weight: 600;*/
    /*    font-family: inherit;*/

    /*    color: #f4f9ff;*/
    /*    background: #DE897D;*/

    /*    cursor: pointer;*/
    /*    transition: border-color 0.25s;*/
    /*}*/

    .tab-box {
        display: flex;
        justify-content: center;

        width: fit-content;
        min-width: 15rem;
        /*height: 4vh;*/
    }

    :global(body.dark-mode) button {
        background: #4A3F64;
    }

    button:hover {
        border-color: #646cff;
    }

    button:focus,
    button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }

   .button-17 {
       /*appearance: none;*/
       align-items: center;
       background-color: #9CC6FB;
       border-radius: 1.5rem;
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
       /*max-width: 100%;*/
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
   }

   :global(body.dark-mode) .button-17:hover {
       color: #4A3F64;
   }

    .button-17:hover {
        background: #f4f9ff;
        color: #174ea6;
    }

    .button-17:active {
        box-shadow: 0 4px 4px 0 rgb(60 64 67 / 30%), 0 8px 12px 6px rgb(60 64 67 / 15%);
        outline: none;
    }

    .button-17:focus {
        outline: none;
        border: 2px solid #4285f4;
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