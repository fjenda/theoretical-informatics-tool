<script lang="ts">

    import  { navigate } from "svelte-routing";

    export let type : ButtonType;
    export let url : string = "";
    export let text : string = "";
</script>

{#if type !== ""}
    <div class="{type}-box">
        <button class="{type}-button" on:click={() => navigate(url)}>
            {text}
        </button>
    </div>
{:else}
    <!-- todo -->
{/if}

<!--{#if type === "read-more"}-->
<!--    <div class="read-more-box">-->
<!--        <button on:click={() => navigate(url)}>-->
<!--            Read more-->
<!--        </button>-->
<!--    </div>-->
<!--{:else if type === "tool"}-->
<!--    <div class="tool-box">-->
<!--        <button on:click={() => navigate(url)}>-->
<!--            Tool-->
<!--        </button>-->
<!--    </div>-->
<!--{:else if type === "back"}-->
<!--    <div class="back-box">-->
<!--        <button on:click={() => navigate(url)}>-->
<!--            Back-->
<!--        </button>-->
<!--    </div>-->
<!--{:else if type === "test"}-->
<!--    <div class="test-box">-->
<!--        <button class="test-button">-->
<!--            Test-->
<!--        </button>-->
<!--    </div>-->
<!--{:else if type === "tab"}-->
<!--    <div class="tab-box">-->
<!--        <button>-->
<!--            {text}-->
<!--        </button>-->
<!--    </div>-->
<!--{/if}-->



<style>
    .test-box {
        display: flex;
        justify-content: center;
        margin: auto;

        font-size: 1.8rem;
        height: 6vh;
        width: 12vw;
    }

    .test-button {
        background-image: linear-gradient(to right, #0fde3c, #18f1e4);
    }

    :global(body.dark-mode) .test-button {
        background-image: linear-gradient(to right, rgba(28,24,241,100%), rgba(45,142,233,50%), rgba(21,240,135,50%), rgba(15,222,73,100%));
    }

    .read-more-box {
        display: flex;
        justify-content: center;
        margin: auto;

        height: 3vh;
        width: 10vw;
    }

    .back-box {
        display: flex;
        justify-content: center;
        margin: auto;

        font-size: 1.8rem;
        height: 6vh;
        width: 12vw;
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

        border-radius: 25px;
        border: 1px solid transparent;
        font-size: 1em;
        font-weight: 600;
        font-family: inherit;
        background-image: linear-gradient(to right, #a024e4, #e5367e);

        cursor: pointer;
        transition: border-color 0.25s;
        filter: drop-shadow(4px 4px 4px #000000);
        /*text-shadow: 2px 2px 6px #000000;*/
    }

    :global(body.dark-mode) button {
        background-image: linear-gradient(to right, #6a1e94, #902250);
    }

    button:hover {
        border-color: #646cff;
    }

    button:focus,
    button:focus-visible {
        outline: 4px auto -webkit-focus-ring-color;
    }
</style>