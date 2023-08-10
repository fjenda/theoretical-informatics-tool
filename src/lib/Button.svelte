<script lang="ts">

    import  { navigate } from "svelte-routing";

    export let type : ButtonType;
    export let url : string = "";
</script>

{#if type === "readme"}
    <div class="readme-box">
        <button on:click={() => navigate(url)}>
            Read me
        </button>
    </div>
{:else if type === "tool"}
    <div class="tool-box">
        <button on:click={() => navigate(url)}>
            Tool
        </button>
    </div>
{:else if type === "back"}
    <div class="back-box">
        <button on:click={() => navigate(url)}>
            Back
        </button>
    </div>
{/if}



<style>
    .readme-box {
        display: flex;
        justify-content: center;
        margin: auto;

        height: 3vh;
        width: 6vw;
    }

    .tool-box {
        position: absolute;
        left: 50%;
        bottom: 2vh;

        -ms-transform: translateX(-50%);
        -webkit-transform: translateX(-50%);
        -moz-transform: translateX(-50%);
        -o-transform: translateX(-50%);
        transform: translateX(-50%);

        font-size: 1.8rem;

        display: flex;
        justify-content: center;

        height: 5vh;
        width: 15vw;
    }

    button {
        width: 100%;

        border-radius: 25px;
        border: 1px solid transparent;
        font-size: 1em;
        font-weight: 600;
        font-family: inherit;
        background-image: linear-gradient(to bottom right, #6a1e94, #902250);
        cursor: pointer;
        transition: border-color 0.25s;
        filter: drop-shadow(4px 4px 4px #000000);
        text-shadow: 2px 2px 6px #000000;
    }

    button:hover {
        border-color: #646cff;
    }

    button:focus,
    button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }
</style>