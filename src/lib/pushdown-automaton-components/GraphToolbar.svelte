<script lang="ts">

</script>

<div class="toolbar">
    <slot />
</div>

<style>
    .toolbar {
        /*width: calc(100% - 1rem);*/
        height: 3rem;

        border-radius: 0.5rem 0.5rem 0 0;

        background: #dedede;
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        gap: 0.25rem;
        /*margin-left: 1rem;*/
    }

    :global(body.dark-mode) .toolbar {
        background: #19191e;
    }
</style>