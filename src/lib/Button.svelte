<script lang="ts">

    import  { navigate } from "svelte-routing";

    export let type : ButtonType;
    export let url : string = "";
    export let func : Function = () => {};
    export let text : string = "";
</script>

{#if type !== ""}
    <div class="{type}-box">
        <button class="{type}-button" on:click={() => navigate(url)} on:click={() => func()}>
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
        width: 10.5vw;
    }

    .test-button {
        background: #DE897D;
        color: #f4f9ff;
    }

    :global(body.dark-mode) .test-button {
        background: #4A3F64;
        color: #f4f9ff;
    }

    .read-more-box {
        display: flex;
        justify-content: center;
        margin: auto;

        height: 3vh;
        width: 10vw;
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
        bottom: 1vh;
        left: 50%;

        -ms-transform: translateX(-50%);
        -webkit-transform: translateX(-50%);
        -moz-transform: translateX(-50%);
        -o-transform: translateX(-50%);
        transform: translateX(-50%);


        display: flex;
        justify-content: center;
        margin: 2rem auto;

        font-size: 1.8rem;
        height: 6vh;
        width: 10.5vw;
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

        font-size: 1.8rem;
        height: 6vh;
        width: 18vw;
    }

    button {
        width: 100%;
        border-radius: 1.5rem;
        border: 0.01rem solid transparent;
        font-size: 1em;
        font-weight: 600;
        font-family: inherit;
        /*background-image: linear-gradient(to right, #A024E4, #E5367E);*/
        background: #DE897D;

        cursor: pointer;
        transition: border-color 0.25s;
        filter: drop-shadow(4px 4px 4px #000000);
        color: #f4f9ff;
        /*text-shadow: 2px 2px 6px #000000;*/
    }

    :global(body.dark-mode) button {
        /*background-image: linear-gradient(to right, #6a1e94, #902250);*/
        background: #4A3F64;
    }

    button:hover {
        border-color: #646cff;
    }

    button:focus,
    button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }
</style>