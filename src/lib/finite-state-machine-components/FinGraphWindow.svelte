<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";

    let graphObject : GraphObject = {
        graph: null,
        graphDiv: null,
        graphState: 'idle',
        graphNodes: [],
        graphEdges: {},
        stack: [],
        graphTransitions: [],
        currentStatus: {},
        word: [],
        graphTraversal: [],
    };

    let highlightedNodesIS : String[] = [];
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
        testInput,
        nextTransition,
        previousTransition,
        resetTestInput,
        generateAutomata,
    } as ToolbarFunctions;

    function testInput(wordCh : string[]){
        console.log(graphObject.graphTransitions);

        resetTestInput();
        graphObject.word = wordCh;
        graphObject.graphState = 'testing';

        let initNode : GraphNodeMeta;
        graphObject.graphNodes.forEach(node => {
            if (node.class === "start") {
                initNode = node;
            }
        });

        if (!initNode){
            console.log("No start node");
            return;
        }

        highlightElement(initNode.id);
        graphObject.currentStatus = {state: initNode.id};
        console.log(graphObject.currentStatus);

    }

    function nextTransition(){
        if (graphObject.graphState !== 'testing'){
            return;
        }

        if (graphObject.word.length === 0){
            stopTest();
            return;
        }
        removeHighlighted();
        let tmpTran : TransitionMeta;
        let nextNode : GraphNodeMeta;
        for (const tran of graphObject.graphTransitions) {
            if (tran.state === graphObject.currentStatus.state && graphObject.word[0] === tran.input) {
                tmpTran = tran;
                nextNode = graphObject.graphNodes.filter(node => node.id === tran.stateAfter)[0];

                graphObject.currentStatus = {state: tmpTran.stateAfter};
                graphObject.word.shift();

                break;
            }
        }

        if (tmpTran){
            highlightElement(nextNode.id);
            let tmpEdge = graphObject.graph.$id(tmpTran.state + "-" + tmpTran.stateAfter);
            highlightElement(tmpEdge.id());
            graphObject.graphTraversal.push(tmpTran);
        } else {
            stopTest();
            return;
        }


    }


    function stopTest(){
        graphObject.graphState = 'idle';

        let isFinish = false;
        graphObject.graphNodes.forEach(node => {
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

    }

    function resetTestInput(){
        removeHighlighted();
        graphObject.graphTraversal = [];
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

    function addNode(node : GraphNodeMeta) {
        if (node.id === "q0") {
            node.class = "start";
        }

        try {
            if (graphObject.graphNodes.filter((graphNode : GraphNodeMeta) => graphNode.id === node.id).length === 0) {
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
                if (graphObject.graphEdges[edge.id].filter((graphEdge : GraphEdgeMeta) => graphEdge.label == edge.label).length == 0) {
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
                input: edge.label,
                stateAfter: edge.target,
            });
        } catch (e) {
            console.log(e);
        } finally {
            // resetLayout();
        }
    }

    function zoomIn() {
        // console.log(graph.zoom.level);
        // graph.zoom({level: graph.zoom.level.toString()});
    }

    function zoomOut() {

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
                if (graphObject.graphEdges[tmpEdge].length > 1) {
                    graphObject.graphEdges[tmpEdge] = graphObject.graphEdges[tmpEdge].filter((edge : GraphEdgeMeta) => edge.id !== tmpEdge);
                } else {
                    delete graphObject.graphEdges[tmpEdge];
                }

                // remove edge from graphTransitions
                graphObject.graphTransitions = graphObject.graphTransitions.filter((transition : TransitionMeta) => {
                    return !(transition.state === tmpEdgeSource && transition.stateAfter === tmpEdgeTarget);
                });
            } else {
                // remove node from graphNodes
                graphObject.graphNodes = graphObject.graphNodes.filter((node : GraphNodeMeta) => node.id !== this.id());

                // remove edges from graphEdges
                for (const edge in graphObject.graphEdges) {
                    graphObject.graphEdges[edge] = graphObject.graphEdges[edge].filter((edge : GraphEdgeMeta) => edge.source !== this.id() && edge.target !== this.id());
                }

                // remove transitions from graphTransitions
                graphObject.graphTransitions = graphObject.graphTransitions.filter((transition : TransitionMeta) => {
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

    }

    function loadGraph() {

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

    function graphConstructor(){
        graphObject.graph = cytoscape({

            container: graphObject.graphDiv,
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

        graphObject.graphNodes = [
            { id: "q0", label: "q0", class: "start"},
            { id: "q1", label: "q1" },
            { id: "q2", label: "q2" },
            { id: "q3", label: "q3", class: "finish" },
        ];

        graphObject.graphEdges = {
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

    function createGraph() {
        graphObject.graphNodes.forEach(node => {
            addNode(node);
        });

        Object.keys(graphObject.graphEdges).forEach(key => {
            graphObject.graphEdges[key].forEach(edge => {
                addEdge(edge);
            });
        });

        resetLayout();
    }

    function generateAutomata(AutomatInput : AutomataMeta) {
        deleteGraph();

        const rules = AutomatInput.input.split("\n");


        rules.forEach((rule, index) => {
            if (rule === "") {
                rules.splice(index, 1);
            }
        });

        let graphDict = {};

        rules.forEach(rule => {
            const ruleSplit = rule.split("=");
            graphDict[ruleSplit[0].trim()] = ruleSplit[1].trim();
        });

        const regex = /[^a-zA-Z0-9\s]/g;
        let graphNodes : GraphNodeMeta[] = Object.keys(graphDict).map(key => {
            return {id: key.split(",")[0], label: key.split(",")[0].replace(regex, ""), class: ""};
        });


        graphNodes.forEach(node => {
            if (node.id.includes(">")) {
                node.class = "start";
                node.id = node.id.replace(">", "");
            } else if (node.id.includes("<")) {
                node.class = "finish";
                node.id = node.id.replace("<", "");
            }
        });


        //remove duplicates from grapNodes array but keep duplicate with non-empty class
        const filteredNodes = [];
        const seenIds = new Set();

        for (const node of graphNodes) {
            if (!seenIds.has(node.id)) {
                filteredNodes.push(node);
                seenIds.add(node.id);
            } else if (node.class !== "") {
                const index = filteredNodes.findIndex((existingNode) =>
                    existingNode.id === node.id && existingNode.class === ""
                );

                if (index !== -1) {
                    filteredNodes.splice(index, 1);
                    filteredNodes.push(node);
                }
            }
        }

        graphNodes = filteredNodes;
        graphNodes.forEach(node => {
            node.id = node.id.replace(regex, "");
        });

        let graphEdges : GraphEdgeMeta[] = [];
        Object.keys(graphDict).forEach(key => {
            const keySplit = key.split(",");
            const valueSplit = graphDict[key].split(",");

            if (valueSplit.length > 1) {
                valueSplit.forEach(value => {
                    graphEdges.push({id: `${keySplit[0].replace(regex, "")}-${value.replace(regex, "")}`,
                        label: keySplit[1].replace(regex, ""),
                        source: keySplit[0].replace(regex, ""),
                        target: value.replace(regex, "")});
                })
            } else{
                graphEdges.push({id: `${keySplit[0].replace(regex, "")}-${valueSplit[0].replace(regex, "")}`,
                    label: keySplit[1].replace(regex, ""),
                    source: keySplit[0].replace(regex, ""),
                    target: valueSplit[0].replace(regex, "")});
            }
        });

        const labelDictionary = {};
        graphEdges.forEach((node) => {
            if (labelDictionary[node.id]) {
                labelDictionary[node.id].push(node.label);
            } else {
                labelDictionary[node.id] = [node.label];
            }
        });

        const combinedArray = Object.entries(labelDictionary).map(([id, labels]) => ({
            id,
            label: labels.join(", ")
        }));

        graphEdges.forEach((edge) => {
            combinedArray.forEach((node) => {
                if (edge.id === node.id) {
                    edge.label = node.label;
                }
            })
        });

        graphEdges = graphEdges.filter((node, index, self) =>
            index === self.findIndex((t) => (
                t.id === node.id
            ))
        );

        graphNodes.forEach(node => {
            addNode(node);
        });

        graphEdges.forEach(edge => {
            addEdge(edge);
        });

        resetLayout();

    }


    onMount(() => {
        graphConstructor();
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