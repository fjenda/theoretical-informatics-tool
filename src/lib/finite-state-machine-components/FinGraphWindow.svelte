<script lang="ts">
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";
    import {configuration_store, graph_store, resetInputVar, result_graph_store} from "../../stores/graphInitStore";
    import {input_error_store} from "../../stores/inputErrorStore";
    import {FiniteStateAutomaton} from "./FiniteStateAutomaton";
    import {RegexAutomaton} from "./regex/RegexAutomaton";
    import {ConvertorToDFA} from "./ConvertorToDFA";
    import {SetOperations} from "./SetsOperations/SetOperations";

    let graphObject = new FiniteStateAutomaton([], [], [], [], [], "DFA");

    let highlightedNodesIS : String[] = [];
    let deleteButtonActive : boolean = false;

    export const toolbarFunctions = {
        addNode,
        addNodeFromButton,
        addEdge,
        addEdgeFromButton,
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
        regexInput,
        convertToDFA,
        // preprocessGraphInput,
    } as ToolbarFunctions;

    $: if ($graph_store.type) {
        updateConfiguration("type");
    }

    function convertToDFA(){
        const result = ConvertorToDFA.convertToDFA(graphObject);
        $graph_store.convertDict = ConvertorToDFA.generateConverTable(result.stateRecorder, graphObject);
        let newFa : FiniteStateAutomaton = result.newFa;

        deleteGraph();

        let alphabet = new Set();
        newFa.transitions.forEach((transition) => {
            alphabet.add(transition.input);
        });

        //delete duplicates from alphabet
        let alphabetArr = Array.from(alphabet);
        let alphabetArrNoDuplicates = alphabetArr.filter((item, index) => alphabetArr.indexOf(item) === index);

        graphObject.input_alphabet = alphabetArrNoDuplicates;
        graphObject.transitions = newFa.transitions;
        graphObject.nodes = newFa.nodes;
        graphObject.startState = newFa.startState;
        graphObject.finishState = newFa.finishState;
        graphObject.type = newFa.type;

        graphObject.generateGraphFromTransitions();

        createGraph(false);
        graph_store.update((n) => {
            n.input_alphabet = graphObject.input_alphabet;
            n.transitions = graphObject.transitions;
            n.nodes = graphObject.nodes;
            n.startState = graphObject.startState;
            n.finishState = graphObject.finishState;
            n.type = graphObject.type;
            n.generated = true;
            n.hideConvertTable = false;
            return n;
        });
        // graph_store.reset();
        resetInputVar.set(false);
        input_error_store.reset();
    }

    function regexInput(wordCh : string){

        // console.log(wordCh)
        let regex = new RegexAutomaton(wordCh);
        // console.log(regex);
        console.log("Tady je stary graph object: ", graphObject);
        deleteGraph();
        // console.log($graph_store);

        let newFa : FiniteStateAutomaton = regex.regexProcessFunc();
        console.log("resutl", newFa);

        // regex.reduceAutomaton(newFa);

        let alphabet = new Set();
        newFa.transitions.forEach((transition) => {
            alphabet.add(transition.input);
        });

        //delete duplicates from alphabet
        let alphabetArr = Array.from(alphabet);
        let alphabetArrNoDuplicates = alphabetArr.filter((item, index) => alphabetArr.indexOf(item) === index);

        // let newStartState : string[] = [];
        // if (typeof newFa.startState === "string"){
        //     newStartState.push(newFa.startState);
        // } else {
        //     newStartState = newFa.startState;
        // }



        graphObject.input_alphabet = alphabetArrNoDuplicates;
        graphObject.transitions = newFa.transitions;
        graphObject.nodes = newFa.nodes;
        graphObject.startState = newFa.startState;
        graphObject.finishState = newFa.finishState;
        graphObject.type = newFa.type;

        graphObject.generateGraphFromTransitions();
        console.log("Tady je nový graph object: ", graphObject);

        console.log("Tady je store: ", $graph_store);

        createGraph(false);
        graph_store.update((n) => {
            n.input_alphabet = graphObject.input_alphabet;
            n.transitions = graphObject.transitions;
            n.nodes = graphObject.nodes;
            n.startState = graphObject.startState;
            n.finishState = graphObject.finishState;
            n.type = graphObject.type;
            n.generated = true;
            n.hideConvertTable = true;
            return n;
        });
        // graph_store.reset();
        resetInputVar.set(false);
        input_error_store.reset();

        console.log("HERERERERERERERERE: ", graphObject.finishState);
    }

    function testInput(wordCh : string[]){
        resetTestInput();
        removeHighlighted();

        graph_store.update((n) => {
            n.isAccepted = null;
            n.word = wordCh;
            n.status = "testing";
            return n;
        });

        graphObject.word = wordCh;
        graphObject.status = "testing";

        if (graphObject.type === "DFA") {
            let tmpNode: GraphNodeMeta;

            //finin  graphObject.nodes node eith id as startstate and store it ot the tmpNode
            tmpNode = graphObject.nodes.find((node: GraphNodeMeta) => {
                if (Array.isArray(graphObject.startState))
                    return graphObject.startState.includes(node.id);
                else
                    return graphObject.startState == node.id;
            });

            if (!tmpNode) {
                return;
            }

            graphObject.startState = [tmpNode.id];
            graphObject.traversal = graphObject.preprocessGraphInput();

            highlightElement(tmpNode.id);
            graphObject.currentStatus = {state: tmpNode.id, input: graphObject.word, step: 0};
            graph_store.update((n) => {
                n.currentStatus = graphObject.currentStatus;
                n.currentStep = -1;
                // console.log("updating current status", n.currentStatus);
                return n;
            });
        } else {
            // console.log("Jsem v NFA větvi");
            graphObject.startState = $graph_store.startState;
            graphObject.traversal = graphObject.preprocessGraphInputNFA();
            highlightElement(graphObject.correctStartState);
            graphObject.currentStatus = {state: graphObject.startState, input: graphObject.word, step: 0};
            graph_store.update((n) => {
                n.currentStatus = graphObject.currentStatus;
                n.currentStep = -1;
                // console.log("updating current status", n.currentStatus);
                return n;
            });
        }

        // console.log(graphObject);

        graph_store.update((n) => {
            n.traversal = graphObject.traversal;
            // console.log("updating store", n.traversal);
            return n;
        });
        // console.log(graphObject.traversal);


    }

    function nextTransition(){
        removeHighlighted();

        let result = graphObject.nextTransition();

        if(!result){
            return;
        }

        if (result.myIsAccepted !== undefined) {
            graph_store.update((n) => {
                n.isAccepted = result.myIsAccepted;
                return n;
            });
        }

        if (result.nextNode == undefined || result.nextEdge == undefined){
            return;
        }
        let nextNode = result.nextNode;
        let nextEdge = result.nextEdge;

        setTimeout(() => {
            highlightElement(nextNode);
            highlightElement(nextEdge);

            graphObject.currentStatus.state = graphObject.traversal[graphObject.currentStatus.step].stateAfter;
            graphObject.currentStatus.step++;
            // console.log(graphObject.currentStatus);

        }, 250);

        graph_store.update((n) => {
            n.currentStatus = graphObject.currentStatus;
            n.currentStep++;
            // console.log("updating current status", n.currentStatus);
            return n;
        });

    }

    function previousTransition(){
        removeHighlighted();

        let result = graphObject.previousTransition();

        if (!result) {
            return;
        }

        let previousNode = result.previousNode;
        let previousEdge = result.previousEdge;

        setTimeout(() => {
            highlightElement(graphObject.traversal[graphObject.currentStatus.step].stateAfter);
            highlightElement(previousEdge);

            graphObject.currentStatus.state = graphObject.traversal[graphObject.currentStatus.step].state;
            // console.log(graphObject.currentStatus);
        }, 250);

        graph_store.update((n) => {
            n.currentStatus = graphObject.currentStatus;
            n.currentStep--;
            // console.log("updating current status", n.currentStatus);
            return n;
        });
    }

    function resetTestInput(){
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
            states.add(node.label);
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

        // transitions
        graphObject.transitions.forEach((transition) => {
            configuration.transitions = configuration.transitions ?? [];
            configuration.transitions.push({
                state: transition.stateLabel,
                input: transition.input,
                stateAfter: transition.stateAfterLabel,
            });
        });


        let startStateLabel = graphObject.startState.map((node : string) => graphObject.nodes.find((n : GraphNodeMeta) => n.id === node).label);
        let finishStatesLabel = graphObject.finishState.map((node : string) => graphObject.nodes.find((n : GraphNodeMeta) => n.id === node).label);

        // start state
        // configuration.initial_state = graphObject.startState;
        configuration.initial_state = startStateLabel;

        // final states
        // configuration.final_states = graphObject.finishState;
        configuration.final_states = finishStatesLabel;

        // type
        configuration.type = graphObject.type;

        Object.assign($configuration_store, configuration);
        // console.log($configuration_store);
    }

    function updateConfiguration(mode : string) {
        let configuration : AutomatonConfiguration = {};

        switch (mode){
            case "node": {
                // states
                let states = new Set();
                graphObject.nodes.forEach((node : GraphNodeMeta) => {
                    states.add(node.id);
                });
                configuration.nodes = Array.from(states);

                // start state
                configuration.initial_state = graphObject.startState;

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

                // transitions
                graphObject.transitions.forEach((transition) => {
                    configuration.transitions = configuration.transitions ?? [];
                    configuration.transitions.push({
                        state: transition.state,
                        input: transition.input,
                        stateAfter: transition.stateAfter,
                    });
                });

                break;
            }

            case "type": {
                break;
            }
        }
        Object.assign($configuration_store, configuration);
    }

    function checkGenerationInput(){
        if($input_error_store.transitions == false){
            return false;
        }
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

    function addNode(node : GraphNodeMeta) {
        try {
            graphObject.addNode(node);
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("node");
            graph_store.update((n) => {
                n.nodes = graphObject.nodes;
                return n;
            });
            // console.log('After add node: ', $graph_store);
            resetLayout();
        }
    }

    function addNodeFromButton(node : GraphNodeMeta) {
        try {

            if (graphObject.nodes.some((n : GraphNodeMeta) => n.label === node.label)) {
                throw new Error("Node with same label already exists");
            }

            graphObject.addNode(node);

        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("node");
            graph_store.update((n) => {
                n.nodes = graphObject.nodes;
                return n;
            });
            resetLayout();
        }
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

    function addEdgeFromButton(edge : GraphEdgeMeta) {
        try {
            graphObject.addEdge(edge);
            console.log("HERE EDGE: ", graphObject.edges)
            console.log("HERE Stare tran: ", graphObject.transitions)

            //run tgrought graphObject.eges and if there is edge wich is not in transitions add it
            for (const edge in graphObject.edges) {
                graphObject.edges[edge].forEach((edge : GraphEdgeMeta) => {
                    let tmpTransition = {
                        state: edge.source,
                        stateLabel: graphObject.nodes.find((node : GraphNodeMeta) => node.id === edge.source).label,
                        input: edge.label,
                        stateAfter: edge.target,
                        stateAfterLabel: graphObject.nodes.find((node : GraphNodeMeta) => node.id === edge.target).label
                    };
                    if (!graphObject.transitions.some((transition : TransitionMeta) => {
                        return transition.state === tmpTransition.state && transition.input === tmpTransition.input && transition.stateAfter === tmpTransition.stateAfter;
                    })) {
                        graphObject.transitions.push(tmpTransition);
                    }
                });
            }

            if(!SetOperations.checkIfDfa(graphObject)){
                graphObject.type = "NFA";
                graph_store.update((n) => {
                    n.type = "NFA";
                    return n;
                });
            }

            graph_store.update((n) => {
                n.transitions = graphObject.transitions;
                n.generated = true;
                return n;
            });


        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("edge");
            resetLayout();
        }
    }

    function deleteGraphElement() {
        graphObject.graph.on("click", "*", function() {

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

                updateConfiguration("node");
            }
            graphObject.graph.remove("#" + this.id());
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
        graphObject.startState = [];
        graphObject.finishState = [];
        graphObject.followingID = 0;
        configuration_store.reset();
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
                        "border-color": "#00ff00",
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
                        "text-background-opacity": .85,
                        "text-background-color": "#f4f9ff",
                        "text-background-shape": "roundrectangle",
                        "text-background-padding": "3px",
                        "text-border-opacity": 1,
                        "text-border-width": 1,
                        "text-border-style": "solid",
                        "text-border-color": "#101820",
                        "text-wrap": "wrap",
                        "control-point-distance": 100,
                    }
                },

                {
                    selector: ".highlight",
                    style: {
                        "background-color": "#0080ff",
                        "line-color": "#0080ff",
                        "target-arrow-color": "#0080ff",
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
        if (!checkGenerationInput()) {
            return false;
        }
        $graph_store.hideConvertTable = true;
        deleteGraph();

        Object.assign(graphObject, $graph_store);

        if(!SetOperations.checkIfDfa(graphObject)){
            graphObject.type = "NFA";
            graph_store.update((n) => {
                n.type = "NFA";
                return n;
            });
        }

        graphObject.generateGraphFromTransitions();




        createGraph(false);
        graph_store.update((n) => {
            n.input_alphabet = graphObject.input_alphabet;
            n.generated = true;
            return n;
        });
        // graph_store.reset();
        resetInputVar.set(false);
        input_error_store.reset();



        graphObject.startState = $graph_store.startState;



        return true;
    }

    let exampleNodes = [
        { id: "0", label: "q0", class: "start"},
        { id: "1", label: "q1", class: "finish" },
    ];

    let exampleTransition = [
        {
            state: "0",
            stateLabel: "q0",
            input: "a",
            stateAfter: "0",
            stateAfterLabel: "q0"
        },
        {
            state: "0",
            stateLabel: "q0",
            input: "b",
            stateAfter: "1",
            stateAfterLabel: "q1"
        },
        {
            state: "1",
            stateLabel: "q1",
            input: "b",
            stateAfter: "0",
            stateAfterLabel: "q0"
        }
    ];

    onMount(() => {
        graphConstructor();

        graph_store.update((n) => {
            n.type = "DFA";
            n.transitions = exampleTransition;
            n.nodes = exampleNodes;
            n.startState = ["0"];
            n.finishState = ["1"];
            n.input_alphabet = ["a", "b"];
            n.hideConvertTable = true;
            return n;
        });
        $graph_store.followingID = 2;

        console.log("Here", graphObject)

        generateGraphFromTransitions();
        console.log($graph_store);
    });

</script>
<svelte:window on:resize={resetLayout} />

<div class="window">
    <slot />
    <div class="graph-wrapper">
        <div bind:this={graphObject.div} class="graph" />
        <div class="type-wrapper">
            <slot name="type" />
        </div>
    </div>
</div>

<style>

    .window {
        width: 95%;
        min-width: 35rem;
        height: 90%;
        min-height: 32rem;

        border-radius: 0.5rem;
        background: #f7f7f8;

        box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px,rgba(0, 0, 0, .14) 0 6px 10px 0,rgba(0, 0, 0, .12) 0 1px 18px 0;
        box-sizing: border-box;
    }

    :global(body.dark-mode) .window {
        background: #25252d;
    }

    .graph {
        overflow: hidden;

        /*border-radius: 2vw;*/
        border-radius: 0.5rem;

        height: calc(100% - 5vh);
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

</style>