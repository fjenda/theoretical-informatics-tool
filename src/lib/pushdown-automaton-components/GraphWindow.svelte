<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";
    import {configuration_store, graph_store, resetInputVar} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import type {TransitionMeta} from "../../types/TransitionMeta";

    let graphObject : GraphObject = {
        graph: null,
        div: null,
        status: "idle",
        nodes: [],
        edges: {},
        transitions: [],
        stack: [],
        currentStatus: {},
        word: [],
        isAccepted: false,
        traversal: [],
        type: "empty",
        startState: "q0",
        finishState: ["qF"],
    };

    let highlightedElementsId : string[] = [];
    let deleteButtonActive : boolean = false;

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

    function initStack() {
        graphObject.stack = [];
        graphObject.stack.push("Z");
    }

    function preprocessGraphInput() : TransitionMeta[] | null {
        const queue: { state: string; stack: string[]; index: number; path: TransitionMeta[] }[] = [
            { state: graphObject.startState, stack: ["Z"], index: 0 , path: []}
        ];

        let closestDeclinedPath: TransitionMeta[] | null = null;
        while (queue.length > 0) {
            const { state, stack, index, path } = queue.shift()!;
            switch (graphObject.type) {
                case "both": {  // if PA accepts by empty stack, empty word and finish state
                    if ((index === graphObject.word.length || graphObject.word.length === 0) && stack.length === 0 && (graphObject.finishState).includes(state)) {
                        console.log("accepted");
                        graphObject.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "empty": { // if PA accepts by empty stack and empty word
                    if ((index === graphObject.word.length || graphObject.word.length === 0) && stack.length === 0) {
                        console.log("accepted");
                        graphObject.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "final": { //if PA accepts by empty word and finish state
                    if ((graphObject.finishState).includes(state) && (index === graphObject.word.length || graphObject.word.length === 0)) {
                        console.log("accepted");
                        graphObject.isAccepted = true;
                        return path; // String is accepted
                    }
                }
            }

            closestDeclinedPath = path;
            for (const transition of graphObject.transitions) {
                if (transition.state === state && (transition.input === graphObject.word[index] || transition.input === "E")) {
                    const stackTop = stack[stack.length - 1];
                    // if (stackTop === transition.stack || (transition.stack === "Z" && stack.length === 1)) {
                    if (stackTop === transition.stack) {
                        const newPath = path.concat(transition);
                        let newStack = stack.slice();
                        if (transition.stackAfter === "E") {
                            newStack.pop();
                        } else {
                            newStack.push(...transition.stackAfter.slice(0, -1));
                        }

                        queue.push({
                            state: transition.stateAfter,
                            stack: newStack,
                            index: index + (transition.input === "E" ? 0 : 1),
                            path: newPath,
                        });
                    }
                }
            }
        }

        console.log("declined");
        graphObject.isAccepted = false;
        if (closestDeclinedPath) {
            return closestDeclinedPath;
        }
        return null; // String is not accepted
    }

    function testInput(wordCharacters : string[]) {
        resetTestInput();
        removeHighlighted();

        graph_store.update((n) => {
            n.isAccepted = null;
            return n;
        });

        initStack();
        graphObject.word = wordCharacters;
        graphObject.status = "testing";

        let tmpNode : GraphNodeMeta;
        graphObject.nodes.forEach((node : GraphNodeMeta) => {
            if (node.id === graphObject.startState) {
                tmpNode = node;
            }
        });

        if (!tmpNode) {
            return;
        }
        console.log(graphObject);


        graphObject.startState = tmpNode.id;
        graphObject.traversal = preprocessGraphInput();
        console.log(graphObject.traversal);

        highlightElement(tmpNode.id);
        graphObject.currentStatus = {state: tmpNode.id, input: graphObject.word, stack: graphObject.stack[graphObject.stack.length - 1], step: 0};
        console.log(graphObject.currentStatus);
    }

    function nextTransition() {
        removeHighlighted();

        if (graphObject.status !== "testing") {
            return;
        }

        if (!graphObject.traversal[graphObject.currentStatus.step]) {
            console.log(graphObject.isAccepted);
            graph_store.update((n) => {
                n.isAccepted = graphObject.isAccepted;
                return n;
            });
            graphObject.status = "idle";
            return;
        }

        let nextEdge = graphObject.traversal[graphObject.currentStatus.step].state + "-" +
                       graphObject.traversal[graphObject.currentStatus.step].stateAfter;

        if (graphObject.traversal[graphObject.currentStatus.step].stackAfter.length > 1) {
            const nextStack = graphObject.traversal[graphObject.currentStatus.step].stackAfter?.slice(0, -1);

            if (nextStack.length > 1) {
                for (let i = 0; i < nextStack.length; i++) {
                    graphObject.stack.push(nextStack[i]);
                }
            }
            else {
                graphObject.stack.push(nextStack);
            }
        } else if (graphObject.traversal[graphObject.currentStatus.step].stackAfter === "E") {
            graphObject.stack.pop();
        }

        setTimeout(() => {
            highlightElement(graphObject.traversal[graphObject.currentStatus.step].stateAfter);
            highlightElement(nextEdge);

            graphObject.currentStatus.state = graphObject.traversal[graphObject.currentStatus.step].stateAfter;
            graphObject.currentStatus.stack = graphObject.stack[graphObject.stack.length - 1];
            graphObject.currentStatus.step++;
            console.log(graphObject.currentStatus);

        }, 250);
    }

    function previousTransition() {
        removeHighlighted();

        if (graphObject.currentStatus.step <= 0) {
            graphObject.currentStatus.step = 0;
            return;
        }
        graphObject.status = "testing";
        graphObject.currentStatus.step--;

        if (!graphObject.traversal[graphObject.currentStatus.step]) {
            return;
        }

        let previousEdge = graphObject.traversal[graphObject.currentStatus.step].state + "-" +
                           graphObject.traversal[graphObject.currentStatus.step].stateAfter;

        if (graphObject.traversal[graphObject.currentStatus.step].stackAfter === "E") {
            graphObject.stack.push(graphObject.traversal[graphObject.currentStatus.step].stack);
        } else if (graphObject.traversal[graphObject.currentStatus.step].stackAfter !== graphObject.traversal[graphObject.currentStatus.step].stack) {
            graphObject.stack.pop();
        }

        setTimeout(() => {
            highlightElement(graphObject.traversal[graphObject.currentStatus.step].stateAfter);
            highlightElement(previousEdge);

            graphObject.currentStatus.state = graphObject.traversal[graphObject.currentStatus.step].state;
            graphObject.currentStatus.stack = graphObject.stack[graphObject.stack.length - 1];
            console.log(graphObject.currentStatus);
        }, 250);
    }

    function resetTestInput() {
        removeHighlighted();

        graph_store.update((n) => {
            n.isAccepted = null;
            return n;
        });

        graphObject.stack = [];
        graphObject.traversal = [];
        graphObject.currentStatus = {};
        graphObject.word = [];
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
            if (transition.input !== "E") {
                alphabet.add(transition.input);
            }
        });
        configuration.input_alphabet = Array.from(alphabet);

        // stack alphabet
        const stackAlphabet = new Set();
        graphObject.transitions.forEach((transition) => {
            if (transition.stack !== "E") {
                stackAlphabet.add(transition.stack);
            }
            if (transition.stackAfter !== "E") {
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
                    if (transition.input !== "E") {
                        alphabet.add(transition.input);
                    }
                });
                configuration.input_alphabet = Array.from(alphabet);

                // stack alphabet
                const stackAlphabet = new Set();
                graphObject.transitions.forEach((transition) => {
                    if (transition.stack !== "E") {
                        stackAlphabet.add(transition.stack);
                    }
                    if (transition.stackAfter !== "E") {
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

        graphObject.transitions.forEach(transition => {
            let key = transition.state + "-" + transition.stateAfter;
            graphObject.edges[key] = graphObject.edges[key] ?? [];
            graphObject.edges[key].push(
            {
                id: (transition.state + "-" + transition.stateAfter),
                label: (transition.input + ";" + transition.stack + ";" + transition.stackAfter),
                source: transition.state,
                target: transition.stateAfter
            });
        });

        // add start and finish state to nodes
        let nodesArray = graphObject.nodes.slice();
        graphObject.nodes = [];
        nodesArray.forEach(node => {
            if (graphObject.finishState.includes(node.id) && node.id == graphObject.startState && graphObject.type !== "empty") {
                graphObject.nodes.push({id: node.id, label: node.label, class: "finish start"});
            } else if (graphObject.finishState.includes(node.id) && graphObject.type !== "empty") {
                graphObject.nodes.push({id: node.id, label: node.label, class: "finish"});
            } else if (node.id === graphObject.startState) {
                graphObject.nodes.push({id: node.id, label: node.label, class: "start"});
            } else {
                graphObject.nodes.push({id: node.id, label: node.label});
            }
        });
        console.log(graphObject);

        createGraph(false);
        // graph_store.reset();
        resetInputVar.set(false);
        input_error_store.reset();

        return true;
    }

    function addNode(node : GraphNodeMeta) {
        try {
            if (graphObject.graph.$id(node.id).length !== 0) {
                return;
            }

            if (graphObject.nodes.filter((graphNode : GraphNodeMeta) => graphNode.id === node.id).length === 0) {
                graphObject.nodes.push(node);
            }

            graphObject.graph.add({
                group: "nodes",
                data: {id: node.id, label: node.label},
                classes: node.class,
            });

            //if node class is finish, and it is not in graphObject.finishState
            if (node.class?.includes("finish") && graphObject.finishState.filter((finishNode : string) => finishNode === node.id).length === 0) {
                graphObject.finishState.push(node.id);
            }

            //if node class is start
            if (node.class?.includes("start")) {
                graphObject.startState = node.id;
            }
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("node");
            resetLayout();
        }
    }

    function addEdgeFromButton(edge : GraphEdgeMeta) {
        if (graphObject.transitions.filter((transition : TransitionMeta) => {
            return transition.state === edge.source && transition.input === edge.label.split(";")[0] && transition.stack === edge.label.split(";")[1] && transition.stateAfter === edge.target && transition.stackAfter === edge.label.split(";")[2];
        }).length === 0) {
            graphObject.transitions.push({
                state: edge.source,
                input: edge.label.split(";")[0],
                stack: edge.label.split(";")[1],
                stateAfter: edge.target,
                stackAfter: edge.label.split(";")[2],
            });
        }

        addEdge(edge);
    }
    function addEdge(edge : GraphEdgeMeta) {
        try {
            //if edges already has this edge
            if (graphObject.edges[edge.id]) {
                //if edges has this edge but with different label
                if (graphObject.edges[edge.id].filter((graphEdge : GraphEdgeMeta) => graphEdge.label == edge.label).length == 0) {
                    graphObject.edges[edge.id].push(edge);
                }
            } else {
                graphObject.edges[edge.id] = [edge];
            }

            if (graphObject.graph.$id(edge.id).length !== 0) {
                let tmpEdge = graphObject.graph.$id(edge.id);

                if (tmpEdge.data("label").split("\n").includes(edge.label)) {
                    return;
                }

                let combinedLabel = tmpEdge.data("label") + "\n" + edge.label;
                graphObject.graph.$id(edge.id).data("label", combinedLabel);
            } else {
                graphObject.graph.add({
                    group: "edges",
                    data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
                });
            }
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
                    let finishNodes = graphObject.nodes.slice().filter((node : GraphNodeMeta) => node.class.includes("finish")).length;
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
            wheelSensitivity: 0.2,
            minZoom: 0.5,
            maxZoom: 2,

            style: [
                {
                    selector: "node",
                    style: {
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
                        "text-background-shape": "rectangle",
                        "text-border-style": "solid",
                        "text-border-opacity": 1,
                        "text-border-width": 1,
                        "text-border-color": "darkgray",
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
                        "transition-duration": 100, // Adjust the duration as needed
                    }
                },
            ],

            layout: {
                name: "circle",
            }

        });
    }


    graphObject.nodes = [
        { id: "q0", label: "q0", class: "start" },
        { id: "q1", label: "q1" },
        { id: "qF", label: "qF", class: "finish" },
    ];

    graphObject.edges = {
        "q0-q1": [{
            id: "q0-q1",
            label: "a;Z;aZ",
            source: "q0",
            target: "q1",
        }],
        "q1-qF": [{
            id: "q1-qF",
            label: "E;Z;E",
            source: "q1",
            target: "qF"
        },
        {
            id: "q1-qF",
            label: "a;a;E",
            source: "q1",
            target: "qF"
        }],
        "q1-q0": [{
            id: "q1-q0",
            label: "b;a;E",
            source: "q1",
            target: "q0"
        }]
    };

    graphObject.transitions = [
        {
            state: "q0",
            input: "a",
            stack: "Z",
            stateAfter: "q1",
            stackAfter: "aZ",
        },
        {
            state: "q1",
            input: "E",
            stack: "Z",
            stateAfter: "qF",
            stackAfter: "E",
        },
        {
            state: "q1",
            input: "a",
            stack: "a",
            stateAfter: "qF",
            stackAfter: "E",
        },
        {
            state: "q1",
            input: "b",
            stack: "a",
            stateAfter: "q0",
            stackAfter: "E",
        },
    ];

    onMount(() => {
        graphInit();
        // generateGraphFromTransitions();
        createGraph(false);
    });
</script>

<div class="window">
    <slot />
    <div bind:this={graphObject.div} class="graph" />
</div>

<style>
    .window {
        margin: 0 3rem;

        /*border-radius: 2vw;*/
        border-radius: 0.5rem;

        width: 95rem;
        max-width: 90%;
        height: 80rem;
        max-height: 85%;
        background: #ffffff;
    }

    :global(body.dark-mode) .window {
        background: #c5c5c5;
    }

    .graph {
        overflow: hidden;

        /*border-radius: 2vw;*/
        border-radius: 0.5rem;

        height: calc(100% - 5vh);
    }
</style>