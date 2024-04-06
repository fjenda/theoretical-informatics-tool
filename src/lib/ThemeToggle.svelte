<script lang="ts">
    import {pda_graph_store} from "../stores/graphInitStore";

    function toggleTheme() {
        window.document.body.classList.toggle("dark-mode");
        pda_graph_store.update(n => {
            n.changeGraphStyle();
            return n;
        });
    }

</script>

<button on:click={toggleTheme}>
    Toggle
</button>

<style>
    button {
        position: absolute;
        top: 1rem;
        right: 1rem;

        background-color: #9CC6FB;
        color: #393939;
        border: none;
        border-radius: 4px;
        padding: 0.5rem;
        text-transform: uppercase;
    }
    :global(body.dark-mode) button {
        background-color: #4A3F64;
        color: white;
    }
</style>