<script lang="ts">

    export let type : ButtonType;
    export let url : string;
</script>

{#if type === "readme"}
    <div class="readme-box">
        <button>
            Read me
        </button>
    </div>
{:else if type === "tool"}
    <div class="tool-box">
        <button>
            Tool
        </button>
    </div>
{/if}



<style>

    /*.read-more-button {*/
    /*  width: 35%;*/
    /*  height: 3vh;*/
    /*  font-size: 1vw;*/
    /*}*/

    /*.tool-box {*/
    /*  padding-top: 2vw;*/
    /*  text-align: center;*/

    /*.tool-button {*/
    /*  width: 66%;*/
    /*  height: 5.5vh;*/
    /*  min-width: fit-content;*/
    /*  font-size: 1.5em;*/
    /*}*/

    .readme-box {
        display: flex;
        justify-content: center;

    }

    .tool-box {
        display: flex;
        justify-content: center;

    }

    button {
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