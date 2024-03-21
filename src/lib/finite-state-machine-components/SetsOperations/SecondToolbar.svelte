<script lang="ts">

</script>

<div class="toolbar">
    <slot />
</div>

<style>
    .toolbar {
        width: calc(100% - 1rem);
        height: 2rem;

        /*border-radius: 2vw 2vw 0 0;*/
        border-radius: 0.5rem 0.5rem 0 0;

        background: #dedede;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-left: 1rem;
    }

    :global(body.dark-mode) .toolbar {
        background: #19191e;
    }
</style>