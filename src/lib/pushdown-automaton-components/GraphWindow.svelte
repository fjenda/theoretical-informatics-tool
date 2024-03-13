<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";
    import {configuration_store, graph_store, resetInputVar, stack_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import {PushdownAutomaton} from "./PushdownAutomaton";

    let graphObject = new PushdownAutomaton();

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

    $: if ($graph_store.type) {
        updateConfiguration("type");
    }

    function getStack() {
        return graphObject.stack;
    }

    function testInput(wordCharacters : string[]) {
        resetTestInput();
        removeHighlighted();

        labels_backup = [];
        for (let element of graphObject.graph.elements()) {
            if (element.isEdge()) {
                labels_backup.push(element.data("label"));
            }
        }
        labels_backup = labels_backup.filter((label) => label !== undefined);
        console.log(labels_backup);

        graph_store.update((n) => {
            n.isAccepted = null;
            n.word = wordCharacters;
            n.status = "testing";
            return n;
        });

        graphObject.status = "testing";
        graphObject.stack = [$graph_store.stackBottom];
        graphObject.word = wordCharacters;

        stack_store.update(() => {
            return graphObject.stack;
        });

        // console.log($graph_store.traversal);

        graphObject.traversal = graphObject.process();
        graph_store.update((n) => {
            n.traversal = graphObject.traversal;
            console.log("updating store", n.traversal);
            return n;
        });

        console.log($graph_store.traversal);

        highlightElement(graphObject.startState);
        graphObject.currentStatus = {state: graphObject.startState, input: graphObject.word, stack: graphObject.stack[graphObject.stack.length - 1], step: 0};
        console.log(graphObject.currentStatus);
    }

    function nextTransition() {
        removeHighlighted();
        resetLabels()

        let ret = graphObject.nextTransition();

        if (!ret) {
            return;
        }

        let nextNode = ret.nextNode;
        let nextEdge = ret.nextEdge;

        graphObject.currentStatus.state = nextNode;
        graphObject.currentStatus.stack = graphObject.stack[graphObject.stack.length - 1];
        graphObject.currentStatus.step++;

        // currently used rule
        let rule = graphObject.traversal[graphObject.currentStatus.step - 1];
        // label
        let label = rule.input + "," + rule.stack + ";" + rule.stackAfter.join("");
        graphObject.graph.elements().forEach(graphElement => {
            if (graphElement.id() === nextEdge && graphElement.isEdge()) {
                console.log("updating label", label);
                graphElement.data("label", label);
            }
        });

        stack_store.update(() => {
            return graphObject.stack;
        });

        scrollToTop();

        setTimeout(() => {
            highlightElement(nextNode);
            highlightElement(nextEdge);
        }, 250);
    }

    function previousTransition() {
        removeHighlighted();
        resetLabels()

        let ret = graphObject.previousTransition();

        if (!ret) {
            return;
        }

        let rule = graphObject.traversal[graphObject.currentStatus.step];
        let label = rule.input + "," + rule.stack + ";" + rule.stackAfter.join("");
        graphObject.graph.elements().forEach(graphElement => {
            if (graphElement.id() === ret.previousEdge && graphElement.isEdge()) {
                graphElement.data("label", label);
            }
        });

        stack_store.update(() => {
            return graphObject.stack;
        });

        scrollToTop();

        let previousNode = ret.previousNode;
        let previousEdge = ret.previousEdge;

        graphObject.currentStatus.state = previousNode;
        graphObject.currentStatus.stack = graphObject.stack[graphObject.stack.length - 1];
        console.log(graphObject.currentStatus);

        setTimeout(() => {
            highlightElement(previousNode);
            highlightElement(previousEdge);
        }, 250);
    }

    function resetTestInput() {
        removeHighlighted();

        graph_store.update((n) => {
            n.isAccepted = null;
            n.status = "idle";
            return n;
        });

        graphObject.resetTestInput();
    }

    function highlightElement(id : string | number) {
        graphObject.graph.elements().forEach(graphElement => {
            if (id == graphElement.id()) {
                highlightedElementsId.push(graphElement.id());
                graphElement.addClass("highlight");
            }
        });
    }

    function removeHighlighted() {
        graphObject.graph.elements().forEach(graphElement => {
            if (highlightedElementsId.includes(graphElement.id())) {
                graphElement.removeClass("highlight");
            }
        });

        highlightedElementsId = [];
    }

    function resetLabels() {
        console.log(labels_backup);

        let i = 0;
        graphObject.graph.elements().forEach(graphElement => {
            if (graphElement.isEdge()) {
                graphElement.data("label", labels_backup[i]);
                i++;
            }
        });
    }

    function generateConfiguration() {
        if (graphObject.nodes.length === 0 || graphObject.transitions.length === 0) {
            //erase configuration
            configuration_store.reset();
            return;
        }

        let configuration : AutomatonConfiguration = {};

        // states
        let states = new Set();
        graphObject.nodes.forEach((node : GraphNodeMeta) => {
            states.add(node.id);
        });
        configuration.nodes = Array.from(states);


        // input alphabet
        const alphabet = new Set();
        graphObject.transitions.forEach((transition) => {
            if (transition.input !== "ε") {
                alphabet.add(transition.input);
            }
        });
        configuration.input_alphabet = Array.from(alphabet);

        // stack alphabet
        const stackAlphabet = new Set();
        graphObject.transitions.forEach((transition) => {
            if (transition.stack !== "ε") {
                stackAlphabet.add(transition.stack);
            }
            if (transition.stackAfter !== "ε") {
                stackAlphabet.add(transition.stackAfter[0]);
            }
        });
        configuration.stack_alphabet = Array.from(stackAlphabet);

        // transitions
        graphObject.transitions.forEach((transition) => {
            configuration.transitions = configuration.transitions ?? [];
            configuration.transitions.push({
                state: transition.state,
                input: transition.input,
                stack: transition.stack,
                stateAfter: transition.stateAfter,
                stackAfter: transition.stackAfter,
            });
        });

        // start state
        configuration.start_state = graphObject.startState;

        // stack default
        configuration.stack_default = graphObject.transitions[0].stack;

        // final states
        configuration.final_states = graphObject.finishState;

        // type
        configuration.type = graphObject.type;

        Object.assign($configuration_store, configuration);
        console.log($configuration_store);
    }

    function updateConfiguration(mode : string) {
        let configuration : AutomatonConfiguration = {};

        switch (mode) {
            case "node": {
                // states
                let states = new Set();
                graphObject.nodes.forEach((node : GraphNodeMeta) => {
                    states.add(node.id);
                });
                configuration.nodes = Array.from(states);

                // start state
                configuration.start_state = graphObject.startState;

                // final states
                configuration.final_states = graphObject.finishState;

                break;
            }

            case "edge": {
                // input alphabet
                const alphabet = new Set();
                graphObject.transitions.forEach((transition) => {
                    if (transition.input !== "ε") {
                        alphabet.add(transition.input);
                    }
                });
                configuration.input_alphabet = Array.from(alphabet);

                // stack alphabet
                const stackAlphabet = new Set();
                graphObject.transitions.forEach((transition) => {
                    if (transition.stack !== "ε") {
                        stackAlphabet.add(transition.stack);
                    }
                    if (transition.stackAfter[0] !== "ε") {
                        // console.log(transition);
                        stackAlphabet.add(transition.stackAfter[0]);
                    }
                });
                configuration.stack_alphabet = Array.from(stackAlphabet);

                // transitions
                graphObject.transitions.forEach((transition) => {
                    configuration.transitions = configuration.transitions ?? [];
                    configuration.transitions.push({
                        state: transition.state,
                        input: transition.input,
                        stack: transition.stack,
                        stateAfter: transition.stateAfter,
                        stackAfter: transition.stackAfter,
                    });
                });

                break;
            }

            case "type": {
                graphObject.type = $graph_store.type;

                if (graphObject.type === "empty") {
                    //remove finish class from nodes in graph
                    graphObject.nodes.forEach((node : GraphNodeMeta) => {
                        if (node.class === "finish") {
                            node.class = "";
                        }
                    });

                    graphObject.graph?.elements().forEach(graphElement => {
                        if (graphObject.finishState.includes(graphElement.id()) && !graphElement.isEdge()) {
                            graphElement.removeClass("finish");
                        }
                    });
                } else {
                    graphObject.nodes.forEach((node : GraphNodeMeta) => {
                        if (graphObject.finishState.includes(node.id)) {
                            node.class = "finish";
                        }
                    });

                    graphObject.graph?.elements().forEach(graphElement => {
                        if (graphObject.finishState.includes(graphElement.id()) && !graphElement.isEdge()) {
                            graphElement.addClass("finish");
                        }
                    });
                }

                break;
            }
        }

        Object.assign($configuration_store, configuration);
    }

    function checkGenerationInput() {
        input_error_store.reset();

        if ($graph_store.transitions === undefined || $graph_store.transitions.length === 0) {
            input_error_store.update((n) => {
                n.transitions = false;
                return n;
            });
        }

        if ($graph_store.startState === undefined) {
            input_error_store.update((n) => {
                n.startState = false;
                return n;
            });
        }

        if ($graph_store.finishState === undefined && $graph_store.type !== "empty") {
            input_error_store.update((n) => {
                n.finishState = false;
                return n;
            });
        }

        return !($input_error_store.transitions === false ||
                $input_error_store.startState === false ||
                $input_error_store.finishState === false);
    }

    function generateGraphFromTransitions() {
        if (!checkGenerationInput()) {
            return false;
        }

        deleteGraph();
        console.log($graph_store);
        Object.assign(graphObject, $graph_store);

        graphObject.generateGraphFromTransitions();

        console.log(graphObject);

        createGraph(false);
        // graph_store.reset();
        resetInputVar.set(false);
        input_error_store.reset();

        return true;
    }

    function addNode(node : GraphNodeMeta) {
        try {
            graphObject.addNode(node);
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("node");
            resetLayout();
        }
    }

    function addEdgeFromButton(edge : GraphEdgeMeta) {
        if (graphObject.transitions.filter((transition : TransitionMeta) => {
            return transition.state === edge.source && transition.input === edge.label.split(",")[0] && transition.stack === edge.label.split(/;,/)[1] && transition.stateAfter === edge.target && transition.stackAfter === edge.label.split(/;,/)[2];
        }).length === 0) {
            graphObject.transitions.push({
                state: edge.source,
                input: edge.label.split(",")[0],
                stack: edge.label.split(/[;,]/)[1],
                stateAfter: edge.target,
                stackAfter: edge.label.split(/[;,]/)[2]
            });
        }

        addEdge(edge);
    }
    function addEdge(edge : GraphEdgeMeta) {
        try {
            graphObject.addEdge(edge);
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
            graphObject.graph.removeAllListeners();
        }
    }

    function deleteGraphElement() {
        graphObject.graph.on("click", "*", function() {
            //if clicked object is edge
            if (this.isEdge()) {
                let tmpEdge = this.id();
                let tmpEdgeSource = this.source().id();
                let tmpEdgeTarget = this.target().id();

                // remove edge from edges
                if (graphObject.edges[tmpEdge].length > 1) {
                    graphObject.edges[tmpEdge] = graphObject.edges[tmpEdge].filter((edge : GraphEdgeMeta) => edge.id !== tmpEdge);
                } else {
                    delete graphObject.edges[tmpEdge];
                }

                // remove edge from transitions
                graphObject.transitions = graphObject.transitions.filter((transition : TransitionMeta) => {
                    return !(transition.state === tmpEdgeSource && transition.stateAfter === tmpEdgeTarget);
                });

                updateConfiguration("edge");
            } else {
                // if node has class final
                if (this.hasClass("finish")) {
                    // get the number of finish nodes
                    let finishNodes = graphObject.finishState.length;
                    //let finishNodes = graphObject.nodes.slice().filter((node : GraphNodeMeta) => node.class.includes("finish")).length;
                    if (finishNodes === 1) {
                        console.log("cannot remove a finish class");
                        return;
                    } else {
                        // remove node from finishState
                        graphObject.finishState = graphObject.finishState.filter((node : string) => node !== this.id());
                    }
                }

                //if node has class start
                if (this.hasClass("start")) {
                    graphObject.startState = "";
                }

                // remove node from nodes
                graphObject.nodes = graphObject.nodes.filter((node : GraphNodeMeta) => node.id !== this.id());

                // remove edges from edges
                for (const edge in graphObject.edges) {
                    graphObject.edges[edge] = graphObject.edges[edge].filter((edge : GraphEdgeMeta) => edge.source !== this.id() && edge.target !== this.id());
                }

                // remove transitions from transitions
                graphObject.transitions = graphObject.transitions.filter((transition : TransitionMeta) => {
                    return !(transition.state === this.id() || transition.stateAfter === this.id());
                });

                updateConfiguration("node");
            }
            graphObject.graph.remove("#" + this.id());
        });
    }

    function saveGraph () {
        const simplifiedGraphObject = {
            edges: graphObject.edges,
            finishState: graphObject.finishState,
            nodes: graphObject.nodes,
            startState: graphObject.startState,
            transitions: graphObject.transitions,
            type: graphObject.type,
        };

        // save graphObject into json
        let jsonData = JSON.stringify(simplifiedGraphObject, null, 4);

        // let jsonData = graphObject.graph.json(false);
        // jsonData = JSON.stringify(jsonData, null, 4);

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
                    graph_store.update((n) => {
                        n.edges = graphData.edges;
                        n.finishState = graphData.finishState;
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
        graphObject.graph.elements().remove();
        graphObject.nodes = [];
        graphObject.edges = {};
        graphObject.transitions = [];
        graphObject.startState = "";
        graphObject.finishState = [];
        configuration_store.reset();
    }

    function resetLayout() {
        const layout = graphObject.graph.makeLayout({ name: "circle" });
        layout.options.eles = graphObject.graph.elements();
        layout.run();
    }

    function createGraph(genTransitions : boolean = false) {
        graphObject.nodes.forEach((node : GraphNodeMeta) => {
            addNode(node);
        });

        for (const edge in graphObject.edges) {
            graphObject.edges[edge].forEach((edge : GraphEdgeMeta) => {
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
        graphObject.graph = cytoscape({

            container: graphObject.div,
            wheelSensitivity: 2,
            minZoom: 0.5,
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

        if ($graph_store.type === "cfg") {
            graph_store.update((n) => {
                n.type = "empty";
                return n;
            });
        } else {
            graph_store.update((n) => {
                n.transitions = tmp_transitions;
                n.nodes = tmp_nodes;
                n.startState = "q0";
                n.finishState = ["qF"];
                n.stackBottom = "Z";
                n.type = "empty";
                return n;
            });
        }

        generateGraphFromTransitions();
    });
</script>

<!-- TODO: fix resizing to reset layout -->
<svelte:window on:resize={resetLayout} />

<div class="window">
    <slot />
    <div class="graph-wrapper">
        <div bind:this={graphObject.div} class="graph" />
        <div class="type-wrapper">
            <slot name="type" />
        </div>
        <div class="stack-wrapper" bind:this={stack_wrapper}>
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
        overflow-y: scroll;

        padding: 0 1rem;
        /*outline: 0.125rem solid #000000;*/
    }
</style>