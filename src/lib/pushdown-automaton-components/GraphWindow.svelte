<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";
    import {
        pda_configuration_store,
        resetInputVar,
        stack_store,
        pda_graph_store, pda_backup_store,
    } from "../../stores/graphInitStore";
    import type {PDAConfigurationType} from "../../types/pda-cfg/PDAConfigurationType";
    import {input_error_store} from "../../stores/inputErrorStore";
    import {watchResize} from "svelte-watch-resize";

    // SimpleBar
    import 'simplebar'
    import 'simplebar/dist/simplebar.css'
    import ResizeObserver from "resize-observer-polyfill";
    import {createDebounce} from "../utils/debounce";
    import type {TransitionType} from "../../types/pda-cfg/TransitionType";
    window.ResizeObserver = ResizeObserver;

    let highlightedElementsId : string[] = [];
    let deleteButtonActive : boolean = false;

    let stack_wrapper: HTMLDivElement;
    let labels_backup : string[] = [];

    export const toolbarFunctions = {
        addNode,
        addEdge,
        addEdgeFromButton,
        toggleDelete,
        saveGraph,
        loadGraph,
        deleteGraph,
        resetLayout,
        generateConfiguration,
        generateGraphFromTransitions,
        testInput,
        nextTransition,
        previousTransition,
        resetTestInput,
        getStack,
    } as ToolbarFunctions;

    $: if ($pda_graph_store.type) {
        updateConfiguration("type");
    }

    function getStack() {
        return $pda_graph_store.stack;
    }

    function testInput(wordCharacters : string[]) {
        resetTestInput();
        removeHighlighted();

        labels_backup = [];
        for (let element of $pda_graph_store.graph.elements()) {
            if (element.isEdge()) {
                labels_backup.push(element.data("label"));
            }
        }
        labels_backup = labels_backup.filter((label) => label !== undefined);

        pda_graph_store.update((n) => {
            n.isAccepted = null;
            n.word = wordCharacters;
            n.status = "testing";
            return n;
        });

        stack_store.update(() => {
            return [$pda_graph_store.stackBottom];
        });

        pda_graph_store.update((n) => {
            n.traversal = $pda_graph_store.process();
            return n;
        });

        highlightElement($pda_graph_store.startState);
        $pda_graph_store.currentStatus = {state: $pda_graph_store.startState, input: $pda_graph_store.word, stack: $pda_graph_store.stack[$pda_graph_store.stack.length - 1], step: 0};
    }

    const debouncerTransition = createDebounce(250);
    function nextTransition() {
        removeHighlighted();
        resetLabels()

        let ret = $pda_graph_store.nextTransition();

        if (!ret) {
            return;
        }

        let nextNode = ret.nextNode;
        let nextEdge = ret.nextEdge;

        $pda_graph_store.currentStatus.state = nextNode;
        $pda_graph_store.currentStatus.stack = $pda_graph_store.stack[$pda_graph_store.stack.length - 1];
        $pda_graph_store.currentStatus.step++;

        // currently used rule
        let rule = $pda_graph_store.traversal[$pda_graph_store.currentStatus.step - 1];
        // label
        let label = rule.input + "," + rule.stack + ";" + rule.stackAfter.join("");
        $pda_graph_store.graph.elements().forEach(graphElement => {
            if (graphElement.id() === nextEdge && graphElement.isEdge()) {
                graphElement.data("label", label);
            }
        });

        stack_store.update(() => {
            return $pda_graph_store.stack;
        });

        scrollToTop();

        debouncerTransition(() => {
            highlightElement(nextNode);
            highlightElement(nextEdge);
        });
    }

    function previousTransition() {
        removeHighlighted();
        resetLabels()

        let ret = $pda_graph_store.previousTransition();

        if (!ret) {
            return;
        }

        let rule = $pda_graph_store.traversal[$pda_graph_store.currentStatus.step];
        let label = rule.input + "," + rule.stack + ";" + rule.stackAfter.join("");
        $pda_graph_store.graph.elements().forEach(graphElement => {
            if (graphElement.id() === ret.previousEdge && graphElement.isEdge()) {
                graphElement.data("label", label);
            }
        });

        stack_store.update(() => {
            return $pda_graph_store.stack;
        });

        scrollToTop();

        let previousNode = ret.previousNode;
        let previousEdge = ret.previousEdge;

        $pda_graph_store.currentStatus.state = previousNode;
        $pda_graph_store.currentStatus.stack = $pda_graph_store.stack[$pda_graph_store.stack.length - 1];

        debouncerTransition(() => {
            highlightElement(previousNode);
            highlightElement(previousEdge);
        });
    }

    function resetTestInput() {
        removeHighlighted();

        pda_graph_store.update((n) => {
            n.isAccepted = null;
            n.status = "idle";
            return n;
        });

        $pda_graph_store.resetTestInput();
    }

    function highlightElement(id : string | number) {
        $pda_graph_store.graph.elements().forEach(graphElement => {
            if (id == graphElement.id()) {
                highlightedElementsId.push(graphElement.id());
                graphElement.addClass("highlight");
            }
        });
    }

    function removeHighlighted() {
        $pda_graph_store.graph.elements().forEach(graphElement => {
            if (highlightedElementsId.includes(graphElement.id())) {
                graphElement.removeClass("highlight");
            }
        });

        highlightedElementsId = [];
    }

    function resetLabels() {
        // console.log(labels_backup);

        let i = 0;
        $pda_graph_store.graph.elements().forEach(graphElement => {
            if (graphElement.isEdge()) {
                graphElement.data("label", labels_backup[i]);
                i++;
            }
        });
    }

    function generateConfiguration() {
        if ($pda_graph_store.nodes.length === 0 || $pda_graph_store.transitions.length === 0) {
            //erase configuration
            pda_configuration_store.reset();
            return;
        }

        // states
        let states = new Set<string>();
        $pda_graph_store.nodes.forEach((node : GraphNodeMeta) => {
            states.add(node.id);
        });

        // input alphabet
        const alphabet = new Set<string>();
        $pda_graph_store.transitions.forEach((transition) => {
            if (transition.input !== "ε") {
                alphabet.add(transition.input);
            }
        });

        // stack alphabet
        const stackAlphabet = new Set<string>();
        $pda_graph_store.transitions.forEach((transition) => {
            if (transition.stack !== "ε") {
                stackAlphabet.add(transition.stack);
            }

            for (let c of transition.stackAfter) {
                if (c !== "ε") {
                    stackAlphabet.add(c);
                }
            }
        });

        pda_configuration_store.update(n => {
            n.states = Array.from(states);
            n.input_alphabet = Array.from(alphabet);
            n.stack_alphabet = Array.from(stackAlphabet);
            n.transitions = $pda_graph_store.transitions ?? [];
            n.initial_state = $pda_graph_store.startState;
            n.initial_stack_symbol = $pda_graph_store.stackBottom;
            n.final_states = $pda_graph_store.finalStates;
            n.type = $pda_graph_store.type;
            return n;
        });
    }

    function updateConfiguration(mode : string) {
        switch (mode) {
            case "node": {
                // states
                let states = new Set<string>();
                $pda_graph_store.nodes.forEach((node : GraphNodeMeta) => {
                    states.add(node.id);
                });

                pda_configuration_store.update((n) => {
                    n.states = Array.from(states);
                    n.initial_state = $pda_graph_store.startState;
                    n.final_states = $pda_graph_store.finalStates;
                    return n;
                });

                break;
            }

            case "edge": {
                // input alphabet
                const alphabet = new Set<string>();
                $pda_graph_store.transitions.forEach((transition) => {
                    if (transition.input !== "ε") {
                        alphabet.add(transition.input);
                    }
                });

                // stack alphabet
                const stackAlphabet = new Set<string>();
                $pda_graph_store.transitions.forEach((transition) => {
                    if (transition.stack !== "ε") {
                        stackAlphabet.add(transition.stack);
                    }

                    for (let c of transition.stackAfter) {
                        if (c !== "ε") {
                            stackAlphabet.add(c);
                        }
                    }
                });


                pda_configuration_store.update((n) => {
                    n.input_alphabet = Array.from(alphabet);
                    n.stack_alphabet = Array.from(stackAlphabet);
                    n.transitions = $pda_graph_store.transitions ?? [];
                    return n;
                });

                break;
            }

            case "type": {
                if ($pda_graph_store.type === "empty") {
                    // remove finish class from nodes in graph
                    $pda_graph_store.nodes.forEach((node : GraphNodeMeta) => {
                        if (node.class === "finish") {
                            node.class = "";
                        }
                    });

                    $pda_graph_store.graph?.elements().forEach(graphElement => {
                        if ($pda_graph_store.finalStates.includes(graphElement.id()) && !graphElement.isEdge()) {
                            graphElement.removeClass("finish");
                        }
                    });
                } else {
                    $pda_graph_store.nodes.forEach((node : GraphNodeMeta) => {
                        if ($pda_graph_store.finalStates.includes(node.id)) {
                            node.class = "finish";
                        }
                    });

                    $pda_graph_store.graph?.elements().forEach(graphElement => {
                        if ($pda_graph_store.finalStates.includes(graphElement.id()) && !graphElement.isEdge()) {
                            graphElement.addClass("finish");
                        }
                    });
                }

                break;
            }
        }
    }

    function checkGenerationInput() {
        input_error_store.reset();

        if ($pda_backup_store.transitions === undefined || $pda_backup_store.transitions.length === 0) {
            input_error_store.update((n) => {
                n.transitions = false;
                return n;
            });
        }

        if ($pda_backup_store.startState === undefined) {
            input_error_store.update((n) => {
                n.startState = false;
                return n;
            });
        }

        if ($pda_backup_store.finalStates === undefined && $pda_backup_store.type !== "empty") {
            input_error_store.update((n) => {
                n.finishState = false;
                return n;
            });
        }

        if ($pda_backup_store.type === undefined) {
            input_error_store.update((n) => {
                n.type = false;
                return n;
            });
        }

        return !($input_error_store.transitions === false ||
                $input_error_store.startState === false ||
                $input_error_store.finishState === false);
    }

    function generateGraphFromTransitions(deleteBefore : boolean = true) {
        if (!checkGenerationInput()) {
            return false;
        }

        if (deleteBefore) deleteGraph();

        pda_graph_store.update(n => {
            n.type = $pda_backup_store.type;
            n.startState = $pda_backup_store.startState;
            n.finalStates = $pda_backup_store.finalStates;
            n.transitions = $pda_backup_store.transitions;
            n.nodes = $pda_backup_store.nodes;
            pda_backup_store.reset();
            n.generateGraphFromTransitions();
            return n;
        });

        createGraph(false);
        resetInputVar.set(false);
        input_error_store.reset();

        return true;
    }

    function addNode(node : GraphNodeMeta) {
        try {
            pda_graph_store.update(n => {
              n.addNode(node);
                return n;
            });
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("node");
            resetLayout();
        }
    }

    function addEdgeFromButton(edge : GraphEdgeMeta, labelArr : string[] = []) {
        let first : string, second : string, third : string[];

        if (labelArr.length > 0) {
            first = labelArr[0];
            second = labelArr[1];
            third = labelArr[2].split(" ");
        } else {
            first = edge.label.split(",")[0];
            second = edge.label.split(",")[1].split(";")[0];
            third = edge.label.split(",")[1].split(";")[1].split(" ");
        }
        if ($pda_graph_store.transitions.filter((transition : TransitionType) => {
            return transition.state === edge.source &&
                   transition.input === first &&
                   transition.stack === second &&
                   transition.stateAfter === edge.target &&
                   transition.stackAfter === third;
        }).length === 0) {
            $pda_graph_store.transitions.push({
                state: edge.source,
                input: first,
                stack: second,
                stateAfter: edge.target,
                stackAfter: third
            });
        }

        addEdge(edge);
    }
    function addEdge(edge : GraphEdgeMeta) {
        try {
            pda_graph_store.update(n => {
                n.addEdge(edge);
                return n;
            });
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("edge");
            // resetLayout();
        }
    }

    function toggleDelete() {
        deleteButtonActive = !deleteButtonActive;

        if (deleteButtonActive) {
            deleteGraphElement();
        } else {
            $pda_graph_store.graph.removeAllListeners();
        }
    }

    function deleteGraphElement() {
        $pda_graph_store.graph.on("click", "*", function() {
            //if clicked object is edge
            if (this.isEdge()) {
                let tmpEdge = this.id();
                let tmpEdgeSource = this.source().id();
                let tmpEdgeTarget = this.target().id();

                // remove edge from edges
                if ($pda_graph_store.edges[tmpEdge].length > 1) {
                    $pda_graph_store.edges[tmpEdge] = $pda_graph_store.edges[tmpEdge].filter((edge : GraphEdgeMeta) => edge.id !== tmpEdge);
                } else {
                    delete $pda_graph_store.edges[tmpEdge];
                }

                // remove edge from transitions
                $pda_graph_store.transitions = $pda_graph_store.transitions.filter((transition : TransitionType) => {
                    return !(transition.state === tmpEdgeSource && transition.stateAfter === tmpEdgeTarget);
                });

                updateConfiguration("edge");
            } else {
                // if node has class final
                if (this.hasClass("finish")) {
                    // get the number of finish nodes
                    let finishNodes = $pda_graph_store.finalStates.length;
                    if (finishNodes === 1) {
                        // console.log("cannot remove a finish class");
                        return;
                    } else {
                        // remove node from finishState
                        $pda_graph_store.finalStates = $pda_graph_store.finalStates.filter((node : string) => node !== this.id());
                    }
                }

                // if node has class start
                if (this.hasClass("start")) {
                    $pda_graph_store.startState = "";
                }

                // remove node from nodes
                $pda_graph_store.nodes = $pda_graph_store.nodes.filter((node : GraphNodeMeta) => node.id !== this.id());

                // remove edges from edges
                for (const edge in $pda_graph_store.edges) {
                    $pda_graph_store.edges[edge] = $pda_graph_store.edges[edge].filter((edge : GraphEdgeMeta) => edge.source !== this.id() && edge.target !== this.id());
                }

                // remove transitions from transitions
                $pda_graph_store.transitions = $pda_graph_store.transitions.filter((transition : TransitionType) => {
                    return !(transition.state === this.id() || transition.stateAfter === this.id());
                });

                updateConfiguration("node");
            }
            $pda_graph_store.graph.remove("#" + this.id());
        });
    }

    function saveGraph () {
        const simplifiedGraphObject = {
            edges: $pda_graph_store.edges,
            finishState: $pda_graph_store.finalStates,
            nodes: $pda_graph_store.nodes,
            startState: $pda_graph_store.startState,
            transitions: $pda_graph_store.transitions,
            type: $pda_graph_store.type,
        };

        // save graphObject into json
        let jsonData = JSON.stringify(simplifiedGraphObject, null, 4);

        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "graph.json";
        a.click();

        URL.revokeObjectURL(url);
    }

    function loadGraph() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files[0];
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");

            try {
                reader.onload = (readerEvent) => {
                    const content = readerEvent.target.result;
                    const graphData = JSON.parse(content.toString());

                    deleteGraph();

                    if (!graphData.nodes || !graphData.edges || graphData.transitions.length === 0 || !graphData.startState || !graphData.finishState || !graphData.type) {
                        return;
                    }
                    pda_graph_store.update((n) => {
                        n.edges = graphData.edges;
                        n.finalStates = graphData.finishState;
                        n.nodes = graphData.nodes;
                        n.startState = graphData.startState;
                        n.transitions = graphData.transitions;
                        n.type = graphData.type;
                        return n;
                    });

                    generateGraphFromTransitions();
                    generateConfiguration();
                    resetLayout();
                };
            } catch (e) {
                console.log(e);
            }
        };

        input.click();
    }

    function deleteGraph () {
        $pda_graph_store.graph.elements().remove();
        $pda_graph_store.nodes = [];
        $pda_graph_store.edges = {};
        $pda_graph_store.transitions = [];
        $pda_graph_store.startState = "";
        $pda_graph_store.finalStates = [];
        pda_configuration_store.reset();
    }

    function resetLayout() {
        const layout = $pda_graph_store.graph.makeLayout({ name: "circle" });
        layout.options.eles = $pda_graph_store.graph.elements();
        layout.run();
    }

    function createGraph(genTransitions : boolean = false) {
        $pda_graph_store.nodes.forEach((node : GraphNodeMeta) => {
            addNode(node);
        });

        for (const edge in $pda_graph_store.edges) {
            $pda_graph_store.edges[edge].forEach((edge : GraphEdgeMeta) => {
                if (genTransitions) {
                    addEdgeFromButton(edge);
                } else {
                    addEdge(edge);
                }
            });
        }

        generateConfiguration();
        resetLayout();
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
                        // "background-color": window.document.body.classList.contains("dark-mode") ? "#808080" : "#080808",
                        // "background-color": "var(--node-background-color)", // doesnt work
                        "background-color": "#808080",
                        "border-color": "#000000",
                        "border-width": 1,
                        "label": "data(label)",
                        "text-valign": "center",
                        "text-halign": "center",
                        "color": "#ffffff",
                    }
                },

                {
                    selector: ".finish",
                    style: {
                        "background-color": "#6b6b6b",
                        "border-width": 5,
                        "border-style": "double",
                    }
                },

                {
                    selector: ".start",
                    style: {
                        "background-color": "#6b6b6b",
                        "border-width": 3,
                        "border-color": "#0070ff",
                    }
                },

                {
                    selector: "edge",
                    style: {
                        "width": 3,
                        "line-color": "#000000",
                        "target-arrow-color": "#000000",
                        "target-arrow-shape": "triangle",
                        "curve-style": "bezier",
                        "label": "data(label)",
                        "color": "#000000",
                        "text-background-opacity": 1,
                        "text-background-color": "#ffffff",
                        "text-background-shape": "round-rectangle",
                        // "text-border-style": "none",
                        // "text-border-opacity": 0,
                        // "text-border-width": 1,
                        // "text-border-color": "darkgray",
                        "text-wrap": "wrap",
                        "control-point-distance": 100,
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
                name: "circle",
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
        // createGraph(false);

        if ($pda_graph_store.type === "cfg") {
            pda_graph_store.update((n) => {
                n.type = "empty";
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

        generateGraphFromTransitions(false);
    });


    function handleResize() {
        resetLayout();
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