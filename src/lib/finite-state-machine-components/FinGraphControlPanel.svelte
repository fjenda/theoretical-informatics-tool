<script lang="ts">

</script>

<div class="control-panel">
    <slot />
</div>

<style>
    .control-panel {
        margin-left: 3rem;
        width: 15rem;
        height: 80rem;
        max-height: 85%;
        border-radius: 2vw;
        background: #ffffff;
    }

    :global(body.dark-mode) .control-panel {
        background: #c5c5c5;
    }
</style>