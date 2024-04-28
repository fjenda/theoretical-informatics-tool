<script lang="ts">
    // cytoscape
    import cytoscape from "cytoscape";
    import cola from "cytoscape-cola";
    cytoscape.use(cola);

    // utils
    import {onMount} from "svelte";
    import {watchResize} from "svelte-watch-resize";

    // stores
    import {pda_graph_store, pda_backup_store} from "../../stores/graphInitStore";

    // SimpleBar
    import 'simplebar'
    import 'simplebar/dist/simplebar.css'
    import ResizeObserver from "resize-observer-polyfill";
    window.ResizeObserver = ResizeObserver;

    import {PDAController} from "./pda/PDAController";
    import type {ToolbarFunctions} from "../../types/ToolbarFunctions";
    import {get} from "svelte/store";

    let stack_wrapper: HTMLDivElement;

    // toolbarFunctions is used to pass some functions to the toolbar
    export const toolbarFunctions = {
        nextTransition,
        previousTransition,
    } as ToolbarFunctions;

    // Function that displays the nextTransition using the controller
    function nextTransition() {
        PDAController.nextTransition();
        scrollToTop();
    }

    // Function that displays the previousTransition using the controller
    function previousTransition() {
        PDAController.previousTransition();
        scrollToTop();
    }

    // Function that scrolls to the top of the stack
    function scrollToTop() {
        stack_wrapper.scrollTop = 0;
    }


    let tmp_nodes = [
        { id: "q0", label: "q0", class: "start" },
        { id: "q1", label: "q1" },
        { id: "q2", label: "q2" },
    ];

    let tmp_transitions = [
        {
            state: "q0",
            input: "a",
            stack: "Z",
            stateAfter: "q1",
            stackAfter: ["A", "Z"],
        },
        {
            state: "q1",
            input: "b",
            stack: "A",
            stateAfter: "q0",
            stackAfter: ["ε"],
        },
        {
            state: "q1",
            input: "a",
            stack: "A",
            stateAfter: "q2",
            stackAfter: ["ε"],
        },
        {
            state: "q1",
            input: "ε",
            stack: "Z",
            stateAfter: "q2",
            stackAfter: ["ε"],
        },
        {
            state: "q2",
            input: "ε",
            stack: "Z",
            stateAfter: "q2",
            stackAfter: ["ε"],
        }
    ];

    onMount(() => {
        PDAController.initGraph();

        if ($pda_graph_store.type === "cfg") {
            pda_graph_store.update((n) => {
                n.type = "empty";
                return n;
            });
        } else {
            pda_backup_store.update((n) => {
                n.type = "empty";
                n.startState = "q0";
                n.stackBottom = "Z";
                n.finalStates = [];
                n.transitions = tmp_transitions;
                n.nodes = tmp_nodes;
                return n;
            });
        }

        PDAController.generateGraphFromTransitions(false);
        PDAController.changeGraphStyle();
    });


    function handleResize() {
        PDAController.resetLayout();
    }
</script>

<div class="window">
    <slot />
    <div class="graph-wrapper" use:watchResize={handleResize}>
        <div bind:this={$pda_graph_store.div} class="graph" />
        <div class="type-wrapper">
            <slot name="type" />
        </div>
        <div class="stack-wrapper" bind:this={stack_wrapper} data-simplebar>
            <slot name="stack" />
        </div>
    </div>
</div>

<style>
    .window {
        width: 95%;
        height: 95%;
        min-height: 25.5rem;
        border-radius: 0.5rem;
        background: #f7f7f8;
        box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
        box-sizing: border-box;
    }

    @media screen and (max-width: 1023px) {
        .window {
            margin: 0.5rem auto;
        }
    }

    :global(body.dark-mode) .window {
        background: #25252d;
    }

    .graph {
        overflow: hidden;
        border-radius: 0.5rem;
        height: calc(100% - 3rem);
    }

    .graph-wrapper {
        position: relative;
        height: 100%;
    }

    .type-wrapper {
        position: absolute;
        top: 0;
        left: 1rem;
        pointer-events: none;
    }

    .stack-wrapper {
        position: absolute;
        top: 0;
        right: 1rem;
        max-height: 30vh;
        padding: 0 2rem;
    }
</style>