<script lang="ts">

import {graph_store} from "../../stores/graphInitStore";
</script>

<h2>Type: {$graph_store.type}</h2>

<style>
    h2 {
        color: #5e5e5e;
    }

    :global(body.dark-mode) h2 {
        color: white;
    }
</style>