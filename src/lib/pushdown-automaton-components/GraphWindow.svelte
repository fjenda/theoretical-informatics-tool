<script lang="ts">
    let graphDiv;

</script>

<div class="window">
    <slot />
    <div bind:this={graphDiv} id="graph" />
</div>

<style>
    .window {
        margin: 0 3rem;
        border-radius: 2vw;
        width: 80rem;
        max-width: 90%;
        height: 80rem;
        max-height: 85%;
        background: #ffffff;
    }

    :global(body.dark-mode) .window {
        background: #c5c5c5;
    }

    #graph {
        overflow: hidden;
        border-radius: 2vw;
        height: calc(100% - 5vh);
    }
</style>