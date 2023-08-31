<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";

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
        finishState: [],
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
        getStack,
    } as ToolbarFunctions;

    function getStack() {
        return graphObject.stack;
    }

    function showTransitions() {
        // console.log("---------NODES---------");
        // console.log(nodes);
        // console.log("---------EDGES---------");
        // console.log(edges);
        // console.log("---------TRANSITIONS---------");
        // console.log(transitions);

        //parse transitions to string
        let transitionsString = "";
        graphObject.transitions.forEach((transition : TransitionMeta) => {
            transitionsString += `(${transition.state}, ${transition.input}, ${transition.stack}) = (${transition.stateAfter}, ${transition.stackAfter})\n`;
        });

        return transitionsString
    }

    function initStack() {
        graphObject.stack = [];
        graphObject.stack.push("Z");
    }

    function preprocessGraphInput() {
        const queue: { state: string; stack: string[]; index: number; path: TransitionMeta[] }[] = [
            { state: graphObject.startState.id, stack: ["Z"], index: 0 , path: []}
        ];

        let closestDeclinedPath: TransitionMeta[] | null = null;
        while (queue.length > 0) {
            const { state, stack, index, path } = queue.shift()!;

            switch (graphObject.type) {
                case "empty/finish": {  // if PA accepts by empty stack, empty word and finish state
                    if (index === graphObject.word.length && stack.length === 1 && (graphObject.finishState.id).includes(state)) {
                        console.log("accepted");
                        graphObject.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "empty": { // if PA accepts by empty stack and empty word
                    if (index === graphObject.word.length && stack.length === 1) {
                        console.log("accepted");
                        graphObject.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "finish": { //if PA accepts by empty word and finish state
                    if ((graphObject.finishState.id).includes(state) && index === graphObject.word.length) {
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
                    if (stackTop === transition.stack || (transition.stack === "Z" && stack.length === 1)) {
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
        if (closestDeclinedPath) {
            return closestDeclinedPath;
        }
        return null; // String is not accepted
    }

    function testInput(wordCharacters : string[]) {
        resetTestInput();
        removeHighlighted();
        initStack();
        graphObject.word = wordCharacters;
        graphObject.wordBackup = wordCharacters;
        graphObject.status = "testing";

        let tmpNode : GraphNodeMeta;
        graphObject.nodes.forEach((node : GraphNodeMeta) => {
            if (node.class === "start") {
                tmpNode = node;
            }
        });

        if (!tmpNode) {
            return;
        }
        graphObject.startState = tmpNode;
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
            return;
        }

        let nextEdge = graphObject.traversal[graphObject.currentStatus.step].state + "-" +
                       graphObject.traversal[graphObject.currentStatus.step].stateAfter;

        if (graphObject.traversal[graphObject.currentStatus.step].stackAfter.length > 1) {
            const nextStack = graphObject.traversal[graphObject.currentStatus.step].stackAfter?.slice(0, -1);
            graphObject.stack.push(nextStack);
        } else if (graphObject.traversal[graphObject.currentStatus.step].stackAfter !== "E") {
            graphObject.stack.push(graphObject.traversal[graphObject.currentStatus.step].stackAfter);
        } else {
            graphObject.stack.pop();
        }

        highlightElement(graphObject.traversal[graphObject.currentStatus.step].stateAfter);
        highlightElement(nextEdge);
        // getStack();

        graphObject.currentStatus.step++;

        console.log(graphObject.currentStatus);
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

        if (graphObject.traversal[graphObject.currentStatus.step].stack !== "Z") {
            if (graphObject.traversal[graphObject.currentStatus.step].stackAfter === "E") {
                graphObject.stack.push(graphObject.traversal[graphObject.currentStatus.step].stack);
            }
        } else {
            graphObject.stack.pop();
        }

        highlightElement(graphObject.traversal[graphObject.currentStatus.step].stateAfter);
        highlightElement(previousEdge);
        // getStack();

        console.log(graphObject.currentStatus);
    }

    function checkLastTransition() {
        if (graphObject.type === "empty") {
            
        }
        
        if (graphObject.stack.length !== 1) {
            return;
        }

        let tmpTransition : TransitionMeta;
        for (const transition of graphObject.transitions) {
            if (transition.input === "E" && transition.stack === "Z" && transition.stackAfter === "E" && transition.state === graphObject.currentStatus.state) {
                tmpTransition = transition;
                graphObject.currentStatus = { state: tmpTransition.stateAfter, word: graphObject.word, stack: graphObject.stack[graphObject.stack.length - 1] };
                break;
            }
        }

        if (tmpTransition) {
            highlightElement(tmpTransition.stateAfter);

            let tmpEdge = tmpTransition.state + "-" + tmpTransition.stateAfter;
            highlightElement(tmpEdge);

            graphObject.traversal.push(tmpTransition);
            graphObject.status = "idle";
        }
    }

    function resetTestInput() {
        removeHighlighted();
        graphObject.stack = [];
        graphObject.traversal = [];
        graphObject.currentStatus = {};
        graphObject.word = [];
    }

    function stopTestInput() {
        if (graphObject.stack.length === 0) {
            return;
        }

        graphObject.status = "idle";

        console.log(graphObject.traversal);
        if (graphObject.word.length === 0 && graphObject.stack.length === 1 && graphObject.graph.$id(graphObject.currentStatus.state).classes().includes("finish")) {
            console.log("Accepted");
            graphObject.stack = [];
            return;
        }

        console.log("Declined");
        graphObject.stack = [];
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

    function generateGraphFromTransitions(transitions : TransitionMeta[], type : string) {
        graphObject.transitions = transitions;
        graphObject.type = type;
        let nodesArray = [];
        let finishedNodes = [];

        deleteGraph();

        transitions.forEach(transition => {
           nodesArray.push(transition.state);
           nodesArray.push(transition.stateAfter);

            let key = transition.state + "-" + transition.stateAfter;
            graphObject.edges[key] = graphObject.edges[key] ?? [];
            graphObject.edges[key].push(
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
                graphObject.nodes.push({id: node, label: node, class: "start"});
            } else if (finishedNodes.includes(node)) {
                graphObject.nodes.push({id: node, label: node, class: "finish"});
            } else {
                graphObject.nodes.push({id: node, label: node});
            }
        });

        createGraph();
    }

    function addNode(node : GraphNodeMeta) {
        if (node.id === "q0") {
            node.class = "start";
        }

        if (node.class === "finish") {
            graphObject.finishState.push(node);
        }

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
            //if edges already has this edge
            if (graphObject.edges[edge.id]) {
                //if edges has this edge but with different label
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

                let combinedLabel = tmpEdge.data("label") + "\n" + edge.label;
                graphObject.graph.$id(edge.id).data("label", combinedLabel);
            } else {
                graphObject.graph.add({
                    group: "edges",
                    data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
                });
            }

            graphObject.transitions.push({
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
        graphObject.graph.on("click", "*", function() {
            graphObject.graph.remove("#" + this.id());

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
            } else {
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

                    //load nodes
                    nodes.forEach((node : GraphNodeMeta) => {
                        graphObject.nodes.push({ id: node.data.id, label: node.data.label, class: node.classes });
                    });

                    //split edges by label and load them
                    edges.forEach((edge : GraphEdgeMeta) => {
                        // graphObject.edges[edge.data.id] = [{ id: edge.data.id, label: edge.data.label, source: edge.data.source, target: edge.data.target }];
                        let edgeLabel = edge.data.label.split("\n");
                        edgeLabel.forEach((label : string) => {
                            graphObject.edges[edge.data.id] = graphObject.edges[edge.data.id] ?? [];
                            graphObject.edges[edge.data.id].push(
                                {
                                    id: edge.data.id,
                                    label: label,
                                    source: edge.data.source,
                                    target: edge.data.target
                                });
                        });
                    });

                    createGraph();
                    console.log(graphObject);
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

    function createGraph() {
        graphObject.nodes.forEach((node : GraphNodeMeta) => {
            addNode(node);
        });

        for (const edge in graphObject.edges) {
            graphObject.edges[edge].forEach((edge : GraphEdgeMeta) => {
                addEdge(edge);
            });
        }

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

    onMount(() => {
        graphInit();
        createGraph();
    });
</script>

<div class="window">
    <slot />
    <div bind:this={graphObject.div} class="graph" />
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