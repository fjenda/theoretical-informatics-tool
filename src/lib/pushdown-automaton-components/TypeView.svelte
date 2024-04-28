<!--
    TypeView.svelte
    This is the view that displays the type of the visualized graph

    Author: Jan Fojtík
-->

<script lang="ts">
    import type {Writable} from "svelte/store";

    export let store: Writable<any>;
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