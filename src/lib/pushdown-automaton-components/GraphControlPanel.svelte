<script lang="ts">

</script>

<div class="control-panel">
    <slot />
</div>

<style>
    .control-panel {
        position: relative;
        margin: 0 2rem;
        height: 90%;
        width: 90%;
        min-width: 9.5rem;
        min-height: 15.5rem;

        border-radius: 0.5rem;

        background: #f7f7f8;
        color: black;
        text-align: center;

        box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
        box-sizing: border-box;
    }

    :global(body.dark-mode) .control-panel {
        background: #25252d;
    }
</style>