<script lang="ts">
    import type {ToolMeta} from "../types/ToolMeta";

    export let info : ToolMeta;
</script>

<div class="glass-panel">
    <div class="title-box">
        <h2>{info.title}</h2>
        <h3>{info.author}</h3>
    </div>
    <div class="script-box">
        <p>{info.description}</p>
    </div>
    <slot />
</div>

<style>
    h2 {
        padding-top: 1.5vh;
        font-size: 1.8rem;
        text-align: center;
        margin-bottom: 0;
    }

    h3 {
        font-size: 1.1rem;
        font-weight: 600;
        text-align: right;
        color: #101820;
        margin-top: 0;
        margin-bottom: 2.5rem;
    }

    :global(body.dark-mode) h3 {
        color:  #dadada;
    }

    .glass-panel {
        position: relative;
        flex: 1 1 50%;

        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;

        min-height: 35rem;
        height: 60%;

        width: 60%;
        /*min-width: 50rem;*/

        padding-bottom: 1.25vw;
        border-radius: 1rem;
        margin: 1rem auto;

        background-image: linear-gradient(to bottom right, rgba(255,255,255,80%), rgba(255,255,255,35%), rgba(255,255,255,35%), rgba(255,255,255,10%));

        /* why the f does this change the bg color by 1 r value*/
        /*backdrop-filter: blur(15px);*/
        /*-webkit-backdrop-filter: blur(15px);*/
    }

    @media screen and (max-width: 1050px) {
        .glass-panel {
            width: 30rem;
            margin: 0 auto 1rem;
        }
    }

    :global(body.dark-mode) .glass-panel {
        background-image: linear-gradient(to bottom right, rgba(0,0,0,50%), rgba(0,0,0,25%), rgba(0,0,0,25%), rgba(0,0,0,50%));
    }

    .title-box {
        width: fit-content;
    }

    .script-box {
        margin: 0 2rem;
    }

    p {
        text-align: justify;
        line-height: 1.5rem;
    }
</style>