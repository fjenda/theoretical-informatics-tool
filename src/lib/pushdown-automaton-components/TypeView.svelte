<script lang="ts">
    export let type: string = "";
</script>

<h2>Type: {type}</h2>

<style>
    h2 {
        color: #363636;
    }

    :global(body.dark-mode) h2 {
        color: #f4f9ff;
    }
</style>