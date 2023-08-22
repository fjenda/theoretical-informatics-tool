<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";

    type GraphEdgeDictionary = {
        [key: string] : GraphEdgeMeta[]
    }

    let graph;
    let graphDiv : HTMLDivElement;

    let graphNodes : GraphNodeMeta[] = [];
    let graphEdges : GraphEdgeDictionary = {};
    let graphTransitions : TransitionMeta[] = [];

    let stack : string[] = [];
    let currentStatus : AutomatonState;
    let word : string[] = [];
    let graphTraversal : (GraphNodeMeta | GraphEdgeMeta)[] = [];

    let highlightedElementsId : string[] = [];
    let deleteButtonActive : boolean = false;

    export const toolbarFunctions = {
        addNode,
        addEdge,
        zoomIn,
        zoomOut,
        toggleDelete,
        saveGraph,
        loadGraph,
        deleteGraph,
        resetLayout,
        generateGraphFromTransitions,
        testInput,
        nextTransition,
        previousTransition,
        resetTestInput,
        showTransitions,
    } as ToolbarFunctions;

    function showTransitions() {
        // console.log("---------NODES---------");
        // console.log(graphNodes);
        // console.log("---------EDGES---------");
        // console.log(graphEdges);
        // console.log("---------TRANSITIONS---------");
        // console.log(graphTransitions);

        //parse graphTransitions to string
        let graphTransitionsString = "";
        graphTransitions.forEach(transition => {
            graphTransitionsString += `(${transition.state}, ${transition.input}, ${transition.stack}) = (${transition.stateAfter}, ${transition.stackAfter})\n`;
        });

        return graphTransitionsString
    }

    function initStack() {
        stack = [];
        stack.push("Z");
    }

    function testInput(wordCharacters : string[]) {
        resetTestInput();
        word = wordCharacters;
        initStack();

        let tmpNode;
        graphNodes.forEach(node => {
            if (node.class === "start") {
                tmpNode = node;
            }
        });

        highlightElement(tmpNode.id);
        graphTraversal.push();
        currentStatus = {state: tmpNode.id, stack: stack[stack.length - 1]};
        console.log(currentStatus);
    }

    function nextTransition() {
        if (word.length === 0) {
            stopTestInput();
            return;
        }

        let tmpTransition : TransitionMeta;
        let nextNode : GraphNodeMeta;

        removeHighlighted();

        for (const transition of graphTransitions) {
            if (transition.state === currentStatus.state && transition.input === word[0] && transition.stack === currentStatus.stack) {
                tmpTransition = transition;
                nextNode = tmpTransition.stateAfter;
                currentStatus = { state: tmpTransition.stateAfter, stack: tmpTransition.stackAfter };
                word.splice(0, 1);
                break;
            }
        }

        if (tmpTransition) {
            highlightElement(nextNode);

            let tmpEdge = tmpTransition.state + "-" + tmpTransition.stateAfter;
            highlightElement(tmpEdge);

            graphTraversal.push(tmpTransition);
        }

        if (!tmpTransition) {
            stopTestInput();
        }
    }

    function previousTransition() {
        if (graphTraversal.length === 0) {
            return;
        }

        let tmpTransition : TransitionMeta;
        let previousNode : GraphNodeMeta;

        removeHighlighted();

        tmpTransition = graphTraversal.pop();
        currentStatus = { state: tmpTransition.state, stack: tmpTransition.stack };
        previousNode = tmpTransition.state;
        word.unshift(tmpTransition.input);

        highlightElement(previousNode);

        let tmpEdge = tmpTransition.state + "-" + tmpTransition.stateAfter;
        highlightElement(tmpEdge);
    }

    function resetTestInput() {
        removeHighlighted();
        stack = [];
        graphTraversal = [];
        currentStatus = {};
    }

    function stopTestInput() {
        console.log(graphTraversal);
        removeHighlighted();

        if (word.length === 0 && graph.$id(currentStatus.state).classes().includes("finish")) {
            console.log("Accepted");
            return;
        }

        console.log("Declined");
    }

    function highlightElement(id : string | number) {
        graph.elements().forEach(graphElement => {
            if (id == graphElement.id()) {
                highlightedElementsId.push(graphElement.id());
                graphElement.addClass("highlight");
            }
        });
    }

    function removeHighlighted() {
        graph.elements().forEach(graphElement => {
            if (highlightedElementsId.includes(graphElement.id())) {
                graphElement.removeClass("highlight");
            }
        });

        highlightedElementsId = [];
    }

    function generateGraphFromTransitions(transitions : TransitionMeta[]) {
        graphTransitions = transitions;
        let nodesArray = [];

        deleteGraph();

        transitions.forEach(transition => {
           nodesArray.push(transition.state);
           nodesArray.push(transition.stateAfter);

            let key = transition.state + "-" + transition.stateAfter;
            graphEdges[key] = graphEdges[key] ?? [];
            graphEdges[key].push(
            {
                id: (transition.state + "-" + transition.stateAfter),
                label: (transition.input + ";" + transition.stack + ";" + transition.stackAfter),
                source: transition.state,
                target: transition.stateAfter
            });

        });
        nodesArray = nodesArray.filter((value, index) => nodesArray.indexOf(value) === index);

        nodesArray.forEach(node => {
            if (node === "q0") {
                graphNodes.push({id: node, label: node, class: "start"});
            } else {
                graphNodes.push({id: node, label: node});
            }
        });

        createGraph(graphNodes, graphEdges);
    }

    function addNode(node : GraphNodeMeta) {
        if (node.id === "q0") {
            node.class = "start";
        }

        try {
            if (graphNodes.filter(graphNode => graphNode.id === node.id).length === 0) {
                graphNodes.push(node);
            }

            graph.add({
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
            if (graphEdges[edge.id]) {
                //if graphEdges has this edge but with different label
                if (graphEdges[edge.id].filter(graphEdge => graphEdge.label == edge.label).length == 0) {
                    graphEdges[edge.id].push(edge);
                }
            } else {
                graphEdges[edge.id] = [edge];
            }

            if (graph.$id(edge.id).length != 0) {
                let tmpEdge = graph.$id(edge.id);

                if (tmpEdge.data("label") === edge.label) {
                    return;
                }

                let combinedLabel = tmpEdge.data("label") + "\n" + edge.label;
                graph.$id(edge.id).data("label", combinedLabel);
            } else {
                graph.add({
                    group: "edges",
                    data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
                });
            }

            graphTransitions.push({
                state: edge.source,
                input: edge.label.split(";")[0],
                stack: edge.label.split(";")[1],
                stateAfter: edge.target,
                stackAfter: edge.label.split(";")[2],
            });
        } catch (e) {
            console.log(e);
        } finally {
            // resetLayout();
        }
    }

    function zoomIn() {
    //     todo
    }

    function zoomOut() {
    //     todo
    }

    function toggleDelete() {
        deleteButtonActive = !deleteButtonActive;

        if (deleteButtonActive) {
            deleteGraphElement();
        } else {
            graph.removeAllListeners();
        }
    }

    function deleteGraphElement() {
        graph.on("click", "*", function(evt) {
            graph.remove("#" + this.id());

            //if clicked object is edge
            if (this.isEdge()) {
                let tmpEdge = this.id();
                let tmpEdgeSource = this.source().id();
                let tmpEdgeTarget = this.target().id();

                // remove edge from graphEdges
                if (graphEdges[tmpEdge].length > 1) {
                    graphEdges[tmpEdge] = graphEdges[tmpEdge].filter(edge => edge.id !== tmpEdge);
                } else {
                    delete graphEdges[tmpEdge];
                }

                // remove edge from graphTransitions
                graphTransitions = graphTransitions.filter(transition => {
                    return !(transition.state === tmpEdgeSource && transition.stateAfter === tmpEdgeTarget);
                });
            } else {
                // remove node from graphNodes
                graphNodes = graphNodes.filter(node => node.id !== this.id());

                // remove edges from graphEdges
                for (const edge in graphEdges) {
                    graphEdges[edge] = graphEdges[edge].filter(edge => edge.source !== this.id() && edge.target !== this.id());
                }

                // remove transitions from graphTransitions
                graphTransitions = graphTransitions.filter(transition => {
                    return !(transition.state === this.id() || transition.stateAfter === this.id());
                });
            }
        });
    }

    function saveGraph () {
        let jsonData = graph.json(false);
        jsonData = JSON.stringify(jsonData);
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

                    //split the graphData.elements into nodes and edges
                    let nodes = graphData.elements.nodes;
                    let edges = graphData.elements.edges;

                    if (!nodes || !edges) {
                        return;
                    }

                    nodes.forEach(node => {
                        graphNodes.push({ id: node.data.id, label: node.data.label, class: node.classes });
                    });

                    edges.forEach(edge => {
                        graphEdges[edge.data.id] = [{ id: edge.data.id, label: edge.data.label, source: edge.data.source, target: edge.data.target }];
                    });

                    createGraph(graphNodes, graphEdges);
                    resetLayout();
                };
            } catch (e) {
                console.log(e);
            }
        };

        input.click();
    }

    function deleteGraph () {
        graph.elements().remove();
        graphNodes = [];
        graphEdges = {};
        graphTransitions = [];
    }

    function resetLayout() {
        const layout = graph.makeLayout({ name: "circle" });
        layout.options.eles = graph.elements();
        layout.run();
    }

    function createGraph(nodes : GraphNodeMeta[], edges : GraphEdgeDictionary) {
        nodes.forEach(node => {
            addNode(node);
        });

        for (const edge in edges) {
            edges[edge].forEach(edge => {
                addEdge(edge);
            });
        }

        resetLayout();
    }

    function graphInit() {
        graph = cytoscape({

            container: graphDiv,
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
                },
            ],

            layout: {
                name: "circle",
            }

        });
    }


    graphNodes = [
        { id: "q0", label: "q0", class: "start"},
        { id: "q1", label: "q1" },
        { id: "qF", label: "qF", class: "finish" },
    ];

    graphEdges = {
        "q0-q1": [{
            id: "q0-q1",
            label: "a;Z;a",
            source: "q0",
            target: "q1",
        }],
        "q1-qF": [{
            id: "q1-qF",
            label: "a;a;Z",
            source: "q1",
            target: "qF"
        }],
        "q1-q0": [{
            id: "q1-q0",
            label: "b;a;Z",
            source: "q1",
            target: "q0"
        }]
    };

    onMount(() => {
        graphInit();
        createGraph(graphNodes, graphEdges);
    });
</script>

<div class="window">
    <slot />
    <div bind:this={graphDiv} class="graph" />
</div>

<style>
    .window {
        margin: 0 3rem;
        border-radius: 2vw;
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
        border-radius: 2vw;
        height: calc(100% - 5vh);
    }
</style>