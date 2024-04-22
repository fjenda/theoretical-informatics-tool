<script lang="ts">

    import {PDAController} from "./pushdown-automaton-components/pda/PDAController";
    import {graph_store, first_graph_store,second_graph_store,result_graph_store} from "../stores/graphInitStore";

    let isDark = true;
    function toggleTheme() {
        window.document.body.classList.toggle("dark-mode");
        isDark = !isDark;
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

<button class={isDark ? "down" : "up"} on:click={toggleTheme}></button>
<button class={isDark ? "left" : "right"} on:click={toggleTheme}></button>

<style>
    button {
        position: absolute;
        top: 1rem;
        right: 1rem;

        background-image: url("../assets/sun.svg");
        background-size: contain;
        background-repeat: no-repeat;
        width: 3rem;
        height: 3rem;

        background-color: transparent;

        border: none;
        padding: 0.5rem;

        transition: 0.3s ease-in-out;
    }
    :global(body.dark-mode) button {
        filter: invert(1);
        background-image: url("../assets/moon.svg");
    }

    .down {
        animation: slide_down 0.5s;
    }

    .up {
        animation: slide_up 0.5s;
    }

    .left {
        animation: slide_left 0.5s;
    }

    .right {
        animation: slide_right 0.5s;
    }

    @keyframes slide_up {
        0% {
            transform: translateY(0);
        }

        100% {
            transform: translateY(-5rem);
        }
    }

    @keyframes slide_down {
        0% {
            transform: translateY(-5rem);
        }

        100% {
            transform: translateY(0);
        }
    }

    @keyframes slide_right {
        0% {
            transform: translateX(5rem);
        }

        100% {
            transform: translateX(0);
        }
    }

    @keyframes slide_left {
        0% {
            transform: translateX(0);
        }

        100% {
            transform: translateX(5rem);
        }
    }
</style>