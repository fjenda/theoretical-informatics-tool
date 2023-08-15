<script lang="ts">
    // import cytoscape from "cytoscape";
    //
    // let cy = cytoscape({
    //     container: document.getElementById("cy"),
    // });
</script>

<div class="window">
    <div id="cy">
        Graph not loaded properly
    </div>
</div>

<style>
    .window {
        margin: 0 3rem;
        border-radius: 2vw;
        width: 80rem;
        max-width: 90%;
        height: 80rem;
        max-height: 85%;
        background: #ffffff;
    }

    :global(body.dark-mode) .window {
        background: #c5c5c5;
    }

    #cy {

    }
</style>