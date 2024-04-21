<script lang="ts">

    import {PDAController} from "./pushdown-automaton-components/pda/PDAController";
    import {graph_store, first_graph_store,second_graph_store,result_graph_store} from "../stores/graphInitStore";

    function toggleTheme() {
        window.document.body.classList.toggle("dark-mode");
        PDAController.changeGraphStyle();

        graph_store.update(n => {
            if (n.theme === "light") {
                n.theme = "dark";
            } else {
                n.theme = "light";
            }
            return n;
        });

        first_graph_store.update(n => {
            if (n.theme === "light") {
                n.theme = "dark";
            } else {
                n.theme = "light";
            }
            return n;
        });

        second_graph_store.update(n => {
            if (n.theme === "light") {
                n.theme = "dark";
            } else {
                n.theme = "light";
            }
            return n;
        });

        result_graph_store.update(n => {
            if (n.theme === "light") {
                n.theme = "dark";
            } else {
                n.theme = "light";
            }
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