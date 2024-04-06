<script lang="ts">
    // cytoscape
    import cytoscape from "cytoscape";
    import spread from "cytoscape-spread";
    spread(cytoscape);

    // import cola from "cytoscape-cola";
    // cytoscape.use(cola);

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

    let stack_wrapper: HTMLDivElement;

    export const toolbarFunctions = {
        nextTransition,                 //
        previousTransition,             //
    } as ToolbarFunctions;

    $: if ($pda_graph_store.type) {
        PDAController.updateConfiguration("type");
    }

    function nextTransition() {
        PDAController.nextTransition();
        scrollToTop();
    }

    function previousTransition() {
        PDAController.previousTransition();
        scrollToTop();
    }

    function graphInit() {
        $pda_graph_store.graph = cytoscape({

            container: $pda_graph_store.div,
            wheelSensitivity: 0.1,
            minZoom: 0.45,
            maxZoom: 3,

            style: [
                {
                    selector: "node",
                    style: {
                        "background-color": "#f4f9ff",
                        "border-color": "#000",
                        "border-width": 1,
                        "label": "data(label)",
                        "text-valign": "center",
                        "text-halign": "center",
                        "color": "#363636",
                    }
                },
                {
                    selector: ".finish",
                    style: {
                        "border-width": 3.5,
                        "border-style": "double",
                        "border-color": "#ff0000",
                    }
                },
                {
                    selector: ".start",
                    style: {
                        "border-width": 3,
                        "border-color": "#0080ff",
                    }
                },
                {
                    selector: "edge",
                    style: {
                        "width": 3,
                        "line-color": "#f4f9ff",
                        "target-arrow-color": "#f4f9ff",
                        "target-arrow-shape": "triangle",
                        "curve-style": "bezier",
                        "label": "data(label)",
                        "color": "#101820",
                        "text-background-opacity": 1,
                        "text-background-color": "#f4f9ff",
                        "text-background-shape": "roundrectangle",
                        "text-background-padding": "3px",
                        "text-border-opacity": 1,
                        "text-border-width": 1,
                        "text-border-style": "solid",
                        "text-border-color": "#101820",
                        "text-wrap": "wrap",
                        "control-point-distance": 75,
                    }
                },

                {
                    selector: ".highlight",
                    style: {
                        "background-color": "#00ff00",
                        "line-color": "#00ff00",
                        "target-arrow-color": "#00ff00",
                        "transition-property": "line-color, target-arrow-color, background-color",
                        "transition-duration": 100,
                    }
                },
            ],

            layout: {
                name: "spread",
            }

        });
    }


    let tmp_nodes = [
        { id: "q0", label: "q0", class: "start" },
        { id: "q1", label: "q1" },
        { id: "qF", label: "qF", class: "finish" },
    ];

    let tmp_transitions = [
        {
            state: "q0",
            input: "a",
            stack: "Z",
            stateAfter: "q1",
            stackAfter: ["a", "Z"],
        },
        {
            state: "q1",
            input: "b",
            stack: "a",
            stateAfter: "q0",
            stackAfter: ["ε"],
        },
        {
            state: "q1",
            input: "a",
            stack: "a",
            stateAfter: "qF",
            stackAfter: ["ε"],
        },
        {
            state: "q1",
            input: "ε",
            stack: "Z",
            stateAfter: "qF",
            stackAfter: ["ε"],
        },
        {
            state: "qF",
            input: "ε",
            stack: "Z",
            stateAfter: "qF",
            stackAfter: ["ε"],
        }
    ];

    function scrollToTop() {
        stack_wrapper.scrollTop = 0;
    }

    onMount(() => {
        graphInit();

        if ($pda_graph_store.type === "cfg") {
            pda_graph_store.update((n) => {
                n.type = "empty";
                n.stackBottom = $pda_backup_store.stackBottom;
                return n;
            });
        } else {
            pda_backup_store.update((n) => {
                n.type = "empty";
                n.startState = "q0";
                n.finalStates = ["qF"];
                n.transitions = tmp_transitions;
                n.nodes = tmp_nodes;
                return n;
            });
        }

        PDAController.generateGraphFromTransitions(false);

        pda_graph_store.update((n) => {
            n.changeGraphStyle();
            return n;
        });
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
        /*pointer-events: ;*/

        max-height: 30vh;
        /*overflow-y: scroll;*/

        padding: 0 2rem;
        /*outline: 0.125rem solid #000000;*/
    }
</style>