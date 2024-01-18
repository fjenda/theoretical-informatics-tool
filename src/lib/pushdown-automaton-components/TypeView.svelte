<script lang="ts">

import {graph_store} from "../../stores/graphInitStore";
</script>

<h2>Type: {$graph_store.type}</h2>

<style>
    h2 {
        color: #363636;
    }

    :global(body.dark-mode) h2 {
        color: #f4f9ff;
    }
</style>