<!--
    ResultTypeView.svelte
    This component is responsible for displaying the type of the result graph.
    Author: Marek Krúpa
-->

<script lang="ts">
    import {result_graph_store} from "../../../stores/graphInitStore";
</script>

<h2>Type: {$result_graph_store.type}</h2>

<style>
    h2 {
        color: #363636;
    }

    :global(body.dark-mode) h2 {
        color: #f4f9ff;
    }
</style>