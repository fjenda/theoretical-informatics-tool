<script lang="ts">

</script>

<div class="control-panel">
    <slot />
</div>

<style>
    .control-panel {
        position: relative;
        margin-left: 3rem;
        width: 15rem;
        height: 80rem;
        max-height: 85%;

        /*border-radius: 2vw;*/
        border-radius: 0.5rem;

        background: #ffffff;
        text-align: center;
    }

    :global(body.dark-mode) .control-panel {
        background: #c5c5c5;
    }
</style>