<!--
    OperationButton.svelte
    Svelte component for displaying a buttons in Set operation page.
    Author: Marek Krúpa
-->

<script lang="ts">
    export let func : Function = () => {};
    export let text : string = "";
</script>

<div class="op_box">
    <button class="op_button" on:click={() => {func();}}>
        {text}
    </button>
</div>

<style>

    .op_button {
        align-items: center;
        background-color: #9CC6FB;
        border-radius: 0.5rem;
        border-style: none;
        box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
        box-sizing: border-box;
        color: #363636;
        cursor: pointer;
        display: inline-flex;
        font-size: 1.25rem;
        font-weight: 500;
        height: 2.75rem;
        justify-content: center;
        letter-spacing: .016rem;
        max-width: 100%;
        min-width: 12rem;
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

    :global(body.dark-mode) .op_button {
        color: #f4f9ff;
        background: #4A3F64;
    }

    :global(body.dark-mode) .op_button:hover {
        color: #4A3F64;
        background: #f4f9ff;
    }

    .op_button:hover {
        color: #174ea6;
        background: #f4f9ff;
    }

    .op_button:active {
        box-shadow: 0 4px 4px 0 rgb(60 64 67 / 30%), 0 8px 12px 6px rgb(60 64 67 / 15%);
        outline: none;
    }

    .op_button:focus {
        outline: 2px solid #4285f4;
    }

    .op_button:not(:disabled) {
        box-shadow: rgba(60, 64, 67, .3) 0 1px 3px 0, rgba(60, 64, 67, .15) 0 4px 8px 3px;
    }

    .op_button:not(:disabled):hover {
        box-shadow: rgba(60, 64, 67, .3) 0 2px 3px 0, rgba(60, 64, 67, .15) 0 6px 10px 4px;
    }

    .op_button:not(:disabled):focus {
        box-shadow: rgba(60, 64, 67, .3) 0 1px 3px 0, rgba(60, 64, 67, .15) 0 4px 8px 3px;
    }

    .op_button:not(:disabled):active {
        box-shadow: rgba(60, 64, 67, .3) 0 4px 4px 0, rgba(60, 64, 67, .15) 0 8px 12px 6px;
    }

    .op_button:disabled {
        box-shadow: rgba(60, 64, 67, .3) 0 1px 3px 0, rgba(60, 64, 67, .15) 0 4px 8px 3px;
    }
</style>
