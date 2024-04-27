<!--
    SecondTypeView.svelte
    This component is responsible for displaying the type of the second graph.
    Author: Marek Krúpa
-->

<script lang="ts">
    import {second_graph_store} from "../../../stores/graphInitStore";
</script>

<h2>Type: {$second_graph_store.type}</h2>

<style>
    h2 {
        color: #363636;
    }

    :global(body.dark-mode) h2 {
        color: #f4f9ff;
    }
</style>