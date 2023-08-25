<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";

    let graphObject : GraphObject = {
        graph: null,
        graphDiv: null,
        graphState: "idle",
        graphNodes: [],
        graphEdges: {},
        graphTransitions: [],
        stack: [],
        currentStatus: {},
        word: [],
        graphTraversal: [],
    };

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
        graphObject.graphTransitions.forEach(transition => {
            graphTransitionsString += `(${transition.state}, ${transition.input}, ${transition.stack}) = (${transition.stateAfter}, ${transition.stackAfter})\n`;
        });

        return graphTransitionsString
    }

    function initStack() {
        graphObject.stack = [];
        graphObject.stack.push("Z");
    }

    function testInput(wordCharacters : string[]) {
        resetTestInput();
        removeHighlighted();
        graphObject.word = wordCharacters;
        initStack();
        graphObject.graphState = "testing";

        let tmpNode;
        graphObject.graphNodes.forEach(node => {
            if (node.class === "start") {
                tmpNode = node;
            }
        });

        if (!tmpNode) {
            return;
        }

        highlightElement(tmpNode.id);
        graphObject.currentStatus = {state: tmpNode.id, stack: graphObject.stack[graphObject.stack.length - 1]};
        console.log(graphObject.currentStatus);
    }

    function nextTransition() {
        removeHighlighted();

        if (graphObject.graphState !== "testing") {
            return;
        }

        if (graphObject.word.length === 0) {
            checkLastTransition();
            stopTestInput();
            return;
        }

        let tmpTransition : TransitionMeta;
        let nextNode : GraphNodeMeta;

        for (const transition of graphObject.graphTransitions) {
            if (transition.state === graphObject.currentStatus.state && transition.input === graphObject.word[0] && transition.stack === graphObject.currentStatus.stack) {
                tmpTransition = transition;
                nextNode = tmpTransition.stateAfter;

                if (tmpTransition.stackAfter.length > 1) {
                    graphObject.stack.push(...tmpTransition.stackAfter.slice(0, tmpTransition.stackAfter.length - 1));
                } else if (tmpTransition.stackAfter === "E") {
                    graphObject.stack.pop();
                }

                graphObject.currentStatus = { state: tmpTransition.stateAfter, stack: graphObject.stack[graphObject.stack.length - 1] };
                graphObject.word.splice(0, 1);
                break;
            }
        }

        console.log(graphObject.currentStatus);
        console.log(graphObject.stack);

        if (tmpTransition) {
            highlightElement(nextNode);

            let tmpEdge = tmpTransition.state + "-" + tmpTransition.stateAfter;
            highlightElement(tmpEdge);

            graphObject.graphTraversal.push(tmpTransition);
        }

        if (!tmpTransition) {
            stopTestInput();
        }
    }

    function previousTransition() {
        graphObject.graphState = "testing";

        if (graphObject.graphTraversal.length === 0) {
            stopTestInput();
            return;
        }

        let tmpTransition : TransitionMeta;
        let previousNode : GraphNodeMeta;

        removeHighlighted();

        tmpTransition = graphObject.graphTraversal.pop();


        console.log(tmpTransition);
        if (tmpTransition.stack !== "Z") {
            if (tmpTransition.stackAfter === "E") {
                graphObject.stack.push(tmpTransition.stack);
            } else if (tmpTransition.stackAfter !== tmpTransition.stack) {
                graphObject.stack.pop();
            }
        }

        graphObject.currentStatus = { state: tmpTransition.state, stack: graphObject.stack[graphObject.stack.length - 1] };
        previousNode = tmpTransition.state;
        if (tmpTransition.input !== "E") {
            graphObject.word.unshift(tmpTransition.input);
        }
        console.log(graphObject.currentStatus);
        console.log(graphObject.stack);

        highlightElement(previousNode);

        let tmpEdge = tmpTransition.state + "-" + tmpTransition.stateAfter;
        highlightElement(tmpEdge);
    }

    function checkLastTransition() {
        let tmpTransition : TransitionMeta;
        for (const transition of graphObject.graphTransitions) {
            if (transition.input === "E" && transition.stack === "Z" && transition.stackAfter === "E" && transition.state === graphObject.currentStatus.state) {
                tmpTransition = transition;
                graphObject.currentStatus = { state: tmpTransition.stateAfter, stack: graphObject.stack[graphObject.stack.length - 1] };
                break;
            }
        }

        if (tmpTransition) {
            highlightElement(tmpTransition.stateAfter);

            let tmpEdge = tmpTransition.state + "-" + tmpTransition.stateAfter;
            highlightElement(tmpEdge);

            graphObject.graphTraversal.push(tmpTransition);
            graphObject.graphState = "idle";
        }
    }

    function resetTestInput() {
        removeHighlighted();
        graphObject.stack = [];
        graphObject.graphTraversal = [];
        graphObject.currentStatus = {};
        graphObject.word = [];
    }

    function stopTestInput() {
        if (graphObject.stack.length === 0) {
            return;
        }

        graphObject.graphState = "idle";

        console.log(graphObject.graphTraversal);
        if (graphObject.word.length === 0 && graphObject.graph.$id(graphObject.currentStatus.state).classes().includes("finish")) {
            console.log("Accepted");
            return;
        }

        console.log("Declined");
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

    function generateGraphFromTransitions(transitions : TransitionMeta[]) {
        graphObject.graphTransitions = transitions;
        let nodesArray = [];
        let finishedNodes = [];

        deleteGraph();

        transitions.forEach(transition => {
           nodesArray.push(transition.state);
           nodesArray.push(transition.stateAfter);

            let key = transition.state + "-" + transition.stateAfter;
            graphObject.graphEdges[key] = graphObject.graphEdges[key] ?? [];
            graphObject.graphEdges[key].push(
            {
                id: (transition.state + "-" + transition.stateAfter),
                label: (transition.input + ";" + transition.stack + ";" + transition.stackAfter),
                source: transition.state,
                target: transition.stateAfter
            });

            if (transition.stack === "Z" && transition.stackAfter === "E" && transition.input === "E") {
                finishedNodes.push(transition.stateAfter);
            }
        });
        nodesArray = nodesArray.filter((value, index) => nodesArray.indexOf(value) === index);

        nodesArray.forEach(node => {
            if (node === "q0") {
                graphObject.graphNodes.push({id: node, label: node, class: "start"});
            } else if (finishedNodes.includes(node)) {
                graphObject.graphNodes.push({id: node, label: node, class: "finish"});
            } else {
                graphObject.graphNodes.push({id: node, label: node});
            }
        });

        createGraph();
    }

    function addNode(node : GraphNodeMeta) {
        if (node.id === "q0") {
            node.class = "start";
        }

        try {
            if (graphObject.graphNodes.filter(graphNode => graphNode.id === node.id).length === 0) {
                graphObject.graphNodes.push(node);
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
            if (graphObject.graphEdges[edge.id]) {
                //if graphEdges has this edge but with different label
                if (graphObject.graphEdges[edge.id].filter(graphEdge => graphEdge.label == edge.label).length == 0) {
                    graphObject.graphEdges[edge.id].push(edge);
                }
            } else {
                graphObject.graphEdges[edge.id] = [edge];
            }

            if (graphObject.graph.$id(edge.id).length != 0) {
                let tmpEdge = graphObject.graph.$id(edge.id);

                if (tmpEdge.data("label") === edge.label) {
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

            graphObject.graphTransitions.push({
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
            graphObject.graph.removeAllListeners();
        }
    }

    function deleteGraphElement() {
        graphObject.graph.on("click", "*", function(evt) {
            graphObject.graph.remove("#" + this.id());

            //if clicked object is edge
            if (this.isEdge()) {
                let tmpEdge = this.id();
                let tmpEdgeSource = this.source().id();
                let tmpEdgeTarget = this.target().id();

                // remove edge from graphEdges
                if (graphObject.graphEdges[tmpEdge].length > 1) {
                    graphObject.graphEdges[tmpEdge] = graphObject.graphEdges[tmpEdge].filter(edge => edge.id !== tmpEdge);
                } else {
                    delete graphObject.graphEdges[tmpEdge];
                }

                // remove edge from graphTransitions
                graphObject.graphTransitions = graphObject.graphTransitions.filter(transition => {
                    return !(transition.state === tmpEdgeSource && transition.stateAfter === tmpEdgeTarget);
                });
            } else {
                // remove node from graphNodes
                graphObject.graphNodes = graphObject.graphNodes.filter(node => node.id !== this.id());

                // remove edges from graphEdges
                for (const edge in graphObject.graphEdges) {
                    graphObject.graphEdges[edge] = graphObject.graphEdges[edge].filter(edge => edge.source !== this.id() && edge.target !== this.id());
                }

                // remove transitions from graphTransitions
                graphObject.graphTransitions = graphObject.graphTransitions.filter(transition => {
                    return !(transition.state === this.id() || transition.stateAfter === this.id());
                });
            }
        });
    }

    function saveGraph () {
        let jsonData = graphObject.graph.json(false);
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
                        graphObject.graphNodes.push({ id: node.data.id, label: node.data.label, class: node.classes });
                    });

                    edges.forEach(edge => {
                        graphObject.graphEdges[edge.data.id] = [{ id: edge.data.id, label: edge.data.label, source: edge.data.source, target: edge.data.target }];
                    });

                    createGraph();
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
        graphObject.graphNodes = [];
        graphObject.graphEdges = {};
        graphObject.graphTransitions = [];
    }

    function resetLayout() {
        const layout = graphObject.graph.makeLayout({ name: "circle" });
        layout.options.eles = graphObject.graph.elements();
        layout.run();
    }

    function createGraph() {
        graphObject.graphNodes.forEach(node => {
            addNode(node);
        });

        for (const edge in graphObject.graphEdges) {
            graphObject.graphEdges[edge].forEach(edge => {
                addEdge(edge);
            });
        }

        resetLayout();
    }

    function graphInit() {
        graphObject.graph = cytoscape({

            container: graphObject.graphDiv,
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


    graphObject.graphNodes = [
        { id: "q0", label: "q0", class: "start" },
        { id: "q1", label: "q1" },
        { id: "qF", label: "qF", class: "finish" },
    ];

    graphObject.graphEdges = {
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
        }],
        "q1-q0": [{
            id: "q1-q0",
            label: "b;a;E",
            source: "q1",
            target: "q0"
        }]
    };

    onMount(() => {
        graphInit();
        createGraph();
    });
</script>

<div class="window">
    <slot />
    <div bind:this={graphObject.graphDiv} class="graph" />
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