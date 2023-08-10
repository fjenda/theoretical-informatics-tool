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
        font-size: 1.6rem;
        text-align: center;
        margin-bottom: 0;
    }

    h3 {
        font-size: 1.1rem;
        font-weight: 600;
        text-align: right;
        color: #dadada;
        margin-top: 0;
        margin-bottom: 2.5rem;
    }

    .glass-panel {
        flex: 1 1 50%;
        height: 70vh;
        padding-bottom: 1.25vw;
        border-radius: 2vw;

        background-image: linear-gradient(to bottom right, rgba(0,0,0,50%), rgba(0,0,0,25%), rgba(0,0,0,25%), rgba(0,0,0,50%));
        backdrop-filter: blur(15px);
        -webkit-backdrop-filter: blur(15px);
    }

    .title-box {
        margin: auto;
        width: fit-content;
        /*border: 2px dashed green;*/
    }

    .script-box {
        margin: 0 2rem;
    }
</style>