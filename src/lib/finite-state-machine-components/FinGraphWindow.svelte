<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";
    import {configuration_store,graph_store, resetInputVar} from "../stores/graphInitStore";
    import FinTable from "./FinTable.svelte";

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

    let highlightedNodesIS : String[] = [];
    let deleteButtonActive : boolean = false;

    export const toolbarFunctions = {
        addNode,
        addEdge,
        toggleDelete,
        saveGraph,
        loadGraph,
        deleteGraph,
        resetLayout,
        testInput,
        nextTransition,
        previousTransition,
        resetTestInput,
        generateConfiguration,
        generateGraphFromTransitions,
        preprocessGraphInput,
    } as ToolbarFunctions;

    function preprocessGraphInput() {
        const visited: { [key: string]: boolean } = {};
        const queue: { state: string; index: number; path: TransitionMeta[] }[] = [
            { state: graphObject.startState, index: 0, path: [] },
        ];

        let closestDeclinedPath: TransitionMeta[] | null = null;
        while (queue.length > 0) {
            const { state, index, path } = queue.shift()!;
            visited[state] = true;
            const isAccepted =
                index === graphObject.word.length &&
                graphObject.finishState.includes(state);

            if (isAccepted) {
                console.log("Accepted");
                graphObject.isAccepted = true;
                return path; // String is accepted
            }
            closestDeclinedPath = path;
            for (const transition of graphObject.transitions) {
                if (transition.state === state && transition.input === graphObject.word[index]) {
                    const newPath = path.concat(transition);
                    queue.push({
                        state: transition.stateAfter,
                        index: index + 1,
                        path: newPath,
                    });
                }
            }

            //epsilon eges
            for (const transition of graphObject.transitions) {
                if (transition.state === state && transition.input === "E") {
                    const newPath = path.concat(transition);
                    queue.push({
                        state: transition.stateAfter,
                        index: index,
                        path: newPath,
                    });
                }
            }
        }


        console.log("declined");
        graphObject.isAccepted = false;
        if (closestDeclinedPath) {
            return closestDeclinedPath;
        }
        return [];
    }


    function testInput(wordCh : string[]){
        if (graphObject.type == 'empty'){
            graphObject.type = 'dfa';
        }

        resetTestInput();
        removeHighlighted();
        graphObject.word = wordCh;
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
        graphObject.currentStatus = {state: tmpNode.id, input: graphObject.word, step: 0};
        console.log(graphObject.currentStatus);
    }

    function nextTransition(){
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

        setTimeout(() => {
            highlightElement(graphObject.traversal[graphObject.currentStatus.step].stateAfter);
            highlightElement(nextEdge);

            graphObject.currentStatus.state = graphObject.traversal[graphObject.currentStatus.step].stateAfter;
            graphObject.currentStatus.step++;
            console.log(graphObject.currentStatus);

        }, 250);
    }


    function stopTest(){
        graphObject.status = 'idle';

        let isFinish = false;
        graphObject.nodes.forEach(node => {
            if (node.class === "finish" && node.id === graphObject.currentStatus.state){
                isFinish = true;
            }
        });

        if (graphObject.word.length === 0 && isFinish){
            console.log("Accepted");
        } else {
            console.log("Rejected");
        }

    }

    function previousTransition(){
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

    function resetTestInput(){
        removeHighlighted();
        graphObject.stack = [];
        graphObject.traversal = [];
        graphObject.currentStatus = {};
        graphObject.word = [];
    }


    function highlightElement(id : string | number) {
        graphObject.graph.elements().forEach(graphElement => {
            if (id == graphElement.id()) {
                highlightedNodesIS.push(graphElement.id());
                graphElement.addClass("highlight");
            }
        });
    }

    function removeHighlighted() {
        graphObject.graph.elements().forEach(graphElement => {
            if (highlightedNodesIS.includes(graphElement.id())) {
                graphElement.removeClass("highlight");
            }
        });

        highlightedNodesIS = [];
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

        // // stack alphabet
        // const stackAlphabet = new Set();
        // graphObject.transitions.forEach((transition) => {
        //     if (transition.stack !== "E") {
        //         stackAlphabet.add(transition.stack);
        //     }
        //     if (transition.stackAfter !== "E") {
        //         stackAlphabet.add(transition.stackAfter[0]);
        //     }
        // });
        // configuration.stack_alphabet = Array.from(stackAlphabet);

        // transitions
        graphObject.transitions.forEach((transition) => {
            configuration.transitions = configuration.transitions ?? [];
            configuration.transitions.push({
                state: transition.state,
                input: transition.input,
                stateAfter: transition.stateAfter,
            });
        });

        // start state
        configuration.start_state = graphObject.startState;

        // final states
        configuration.final_states = graphObject.finishState;

        // type
        configuration.type = graphObject.type;

        Object.assign($configuration_store, configuration);
        // console.log($configuration_store);
    }

    function addNode(node : GraphNodeMeta) {

        try {
            if (graphObject.nodes.filter((graphNode : GraphNodeMeta) => graphNode.id === node.id).length === 0) {
                graphObject.nodes.push(node);
            }

            graphObject.graph.add({
                group: "nodes",
                data: {id: node.id, label: node.label},
                classes: node.class,
            });
        } catch (e) {
            console.log(e);
        } finally {
            resetLayout();
        }
    }

    function addEdge(edge : GraphEdgeMeta) {
        try {
            //if graphEdges already has this edge
            if (graphObject.edges[edge.id]) {
                //if graphEdges has this edge but with different label
                if (graphObject.edges[edge.id].filter((graphEdge : GraphEdgeMeta) => graphEdge.label == edge.label).length == 0) {
                    graphObject.edges[edge.id].push(edge);
                }
            } else {
                graphObject.edges[edge.id] = [edge];
            }

            if (graphObject.graph.$id(edge.id).length != 0) {
                let tmpEdge = graphObject.graph.$id(edge.id);

                if (tmpEdge.data("label") === edge.label) {
                    return;
                }

                let combinedLabel = tmpEdge.data("label") + ", " + edge.label;
                graphObject.graph.$id(edge.id).data("label", combinedLabel);
            } else {
                graphObject.graph.add({
                    group: "edges",
                    data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
                });
            }

            graphObject.transitions.push({
                state: edge.source,
                input: edge.label,
                stateAfter: edge.target,
            });
        } catch (e) {
            console.log(e);
        } finally {
            // resetLayout();
        }
    }

    function deleteGraphElement() {
        graphObject.graph.on("click", "*", function() {
            graphObject.graph.remove("#" + this.id());

            //if clicked object is edge
            if (this.isEdge()) {
                let tmpEdge = this.id();
                let tmpEdgeSource = this.source().id();
                let tmpEdgeTarget = this.target().id();

                // remove edge from graphEdges
                if (graphObject.edges[tmpEdge].length > 1) {
                    graphObject.edges[tmpEdge] = graphObject.edges[tmpEdge].filter((edge : GraphEdgeMeta) => edge.id !== tmpEdge);
                } else {
                    delete graphObject.edges[tmpEdge];
                }

                // remove edge from graphTransitions
                graphObject.transitions = graphObject.transitions.filter((transition : TransitionMeta) => {
                    return !(transition.state === tmpEdgeSource && transition.stateAfter === tmpEdgeTarget);
                });
            } else {
                // remove node from graphNodes
                graphObject.nodes = graphObject.nodes.filter((node : GraphNodeMeta) => node.id !== this.id());

                // remove edges from graphEdges
                for (const edge in graphObject.edges) {
                    graphObject.edges[edge] = graphObject.edges[edge].filter((edge : GraphEdgeMeta) => edge.source !== this.id() && edge.target !== this.id());
                }

                // remove transitions from graphTransitions
                graphObject.transitions = graphObject.transitions.filter((transition : TransitionMeta) => {
                    return !(transition.state === this.id() || transition.stateAfter === this.id());
                });
            }
        });
    }

    function toggleDelete() {
        deleteButtonActive = !deleteButtonActive;

        if (deleteButtonActive) {
            deleteGraphElement();
        } else {
            graphObject.graph.removeAllListeners();
        }
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
    }

    function resetLayout() {
        const layout = graphObject.graph.makeLayout({ name: "circle" });
        layout.options.eles = graphObject.graph.elements();
        layout.run();
    }

    function graphConstructor(){
        graphObject.graph = cytoscape({

            container: graphObject.div,
            // wheelSensitivity: 0.2,
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
                    selector: ".start",
                    style: {
                        "background-color": "#6b6b6b",
                        "border-color": "#ff0000",
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
                    }
                },

                {
                    selector: ".highlight",
                    style: {
                        "background-color": "#00ff00",
                        "line-color": "#00ff00",
                        "target-arrow-color": "#00ff00",
                    }
                }
            ],

            layout:{
                name:"circle",
            }

        });

        graphObject.nodes = [
            { id: "q0", label: "q0", class: "start"},
            { id: "q1", label: "q1" },
            { id: "q2", label: "q2" },
            { id: "q3", label: "q3", class: "finish" },
        ];

        graphObject.edges = {
            "q0-q0":[{
                id: "q0-q0",
                label: "A",
                source: "q0",
                target: "q0"
            }],
            "q0-q1":[{
                id: "q0-q1",
                label: "B",
                source: "q0",
                target: "q1"
            }],
            "q1-q2":[{
                id: "q1-q2",
                label: "A",
                source: "q1",
                target: "q2"
            }],
        };

    }

    function createGraph(genTransitions : boolean = false) {
        graphObject.nodes.forEach((node : GraphNodeMeta) => {
            addNode(node);
        });

        for (const edge in graphObject.edges) {
            graphObject.edges[edge].forEach((edge : GraphEdgeMeta) => {
                if (genTransitions) {
                    // addEdgeFromButton(edge);
                } else {
                    addEdge(edge);
                }
            });
        }

        generateConfiguration();
        resetLayout();
    }



    function generateGraphFromTransitions() {
        deleteGraph();
        // console.log($graph_store);
        Object.assign(graphObject, $graph_store);

        graphObject.transitions.forEach(transition => {
            let key = transition.state + "-" + transition.stateAfter;
            graphObject.edges[key] = graphObject.edges[key] ?? [];
            graphObject.edges[key].push(
                {
                    id: (transition.state + "-" + transition.stateAfter),
                    label: (transition.input),
                    source: transition.state,
                    target: transition.stateAfter
                });
        });
        //console.log(graphObject.edges);

        // add start and finish state to nodes
        let nodesArray = graphObject.nodes.slice();
        graphObject.nodes = [];
        nodesArray.forEach(node => {
            if (graphObject.finishState.includes(node.id)) {
                graphObject.nodes.push({id: node.id, label: node.label, class: "finish"});
            } else if (node.id === graphObject.startState) {
                graphObject.nodes.push({id: node.id, label: node.label, class: "start"});
            } else {
                graphObject.nodes.push({id: node.id, label: node.label});
            }
        });
        //console.log(graphObject);

        createGraph(false);
        // graph_store.reset();
        resetInputVar.set(false);
    }


    onMount(() => {
        graphConstructor();
        createGraph();
    });

</script>

<div class="window">
    <slot />
    <div bind:this={graphObject.div} class="graph" />
</div>
<div class="svTable">
    <FinTable />
</div>

<style>
    .svTable {
        margin: 0 1rem;

        /*border-radius: 2vw;*/
        border-radius: 0.5rem;

        width: 25rem;
        max-width: 90%;
        height: 40rem;
        max-height: 85%;
        background: #ffffff;
    }

    .window {
        margin: 0 3rem;

        /*border-radius: 2vw;*/
        border-radius: 0.5rem;

        width: 90rem;
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