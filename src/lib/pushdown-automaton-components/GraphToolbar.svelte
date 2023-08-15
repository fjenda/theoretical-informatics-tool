<script lang="ts">

</script>

<div class="toolbar">
    <slot />
</div>

<style>
    .toolbar {
        width: calc(100% - 1rem);
        height: 5vh;
        border-radius: 2vw 2vw 0 0;
        background: #dedede;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-left: 1rem;
    }

    :global(body.dark-mode) .toolbar {
        background: #868686;
    }
</style>