<!--
    ResultGraphWindow.svelte
    This component is a window for the finite state automaton graph.
    It contains the graph itself and the toolbar with functions for the graph manipulation.
    Author: Marek Krúpa
-->

<script lang="ts">
    // Imports
    import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
    import {
        first_graph_store, resetInputVar,
        result_configuration_store, result_graph_store,
        second_graph_store
    } from "../../../stores/graphInitStore";
    import {SetOperations} from "./SetOperations";
    import cytoscape from "cytoscape";
    import cola from "cytoscape-cola";
    cytoscape.use(cola);
    import {onMount} from "svelte";
    import {input_error_store} from "../../../stores/inputErrorStore";

    // Variables
    let graphObject = new FiniteStateAutomaton([], [], [], [], [], "DFA");
    let highlightedNodesIS : String[] = [];

    // Functions and Toolbar functions
    export const resutlToolbarFunctions = {
        unionFunc,
        intersectionFunc,
        complementFunc,
        concatenationFunc,
        differenceFunc,
        iterationFunc,
        saveGraph,
        resetLayout,
        testInput,
        nextTransition,
        previousTransition,
        resetTestInput,
        generateConfiguration,
    } as ToolbarFunctions;

    // Check if the type of the graph has changed
    $: if ($result_graph_store.type) {
        updateConfiguration("type");
    }

    // Check if the theme of the graph has changed
    $: if ($result_graph_store.theme){
        if (graphObject != undefined){
            graphObject.changeGraphStyle();
        }
    }

    // Function to test the input
    function testInput(wordCh : string[]){
        resetTestInput();
        removeHighlighted();

        result_graph_store.update((n) => {
            n.isAccepted = null;
            n.word = wordCh;
            n.status = "testing";
            return n;
        });

        graphObject.word = wordCh;
        graphObject.status = "testing";

        if (graphObject.type === "DFA") {
            let tmpNode: GraphNodeMeta;
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
            result_graph_store.update((n) => {
                n.currentStatus = graphObject.currentStatus;
                n.currentStep = -1;
                return n;
            });
        } else {
            graphObject.startState = $result_graph_store.startState;
            graphObject.traversal = graphObject.preprocessGraphInputNFA();
            highlightElement(graphObject.correctStartState);
            graphObject.currentStatus = {state: graphObject.startState, input: graphObject.word, step: 0};
            result_graph_store.update((n) => {
                n.currentStatus = graphObject.currentStatus;
                n.currentStep = -1;
                return n;
            });
        }

        result_graph_store.update((n) => {
            n.traversal = graphObject.traversal;
            return n;
        });
    }

    // Function to move to the next transition
    function nextTransition(){
        removeHighlighted();

        let result = graphObject.nextTransition();

        if(!result){
            return;
        }

        if (result.myIsAccepted !== undefined) {
            result_graph_store.update((n) => {
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
        }, 250);

        result_graph_store.update((n) => {
            n.currentStatus = graphObject.currentStatus;
            n.currentStep++;
            return n;
        });
    }

    // Function to move to the previous transition
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
        }, 250);

        result_graph_store.update((n) => {
            n.currentStatus = graphObject.currentStatus;
            n.currentStep--;
            return n;
        });
    }

    // Function to reset the test input
    function resetTestInput(){
        removeHighlighted();

        result_graph_store.update((n) => {
            n.isAccepted = null;
            n.status = "idle";
            return n;
        });

        graphObject.resetTestInput();
    }

    // Function to remove the highlighted elements
    function removeHighlighted() {
        graphObject.graph.elements().forEach(graphElement => {
            if (highlightedNodesIS.includes(graphElement.id())) {
                graphElement.removeClass("highlight");
            }
        });

        highlightedNodesIS = [];
    }

    // Function to highlight the element
    function highlightElement(id : string | number) {
        graphObject.graph.elements().forEach(graphElement => {
            if (id == graphElement.id()) {
                highlightedNodesIS.push(graphElement.id());
                graphElement.addClass("highlight");
            }
        });
    }

    // Function to call union function of first and second graph
    function unionFunc() {
        let firstAutomaton = new FiniteStateAutomaton(
            $first_graph_store.nodes,
            $first_graph_store.transitions,
            $first_graph_store.startState,
            $first_graph_store.finishState,
            $first_graph_store.type
            )

        let secondAutomaton = new FiniteStateAutomaton(
            $second_graph_store.nodes,
            $second_graph_store.transitions,
            $second_graph_store.startState,
            $second_graph_store.finishState,
            $second_graph_store.type
        )

        deleteGraph();
        let newFa : FiniteStateAutomaton;
        if (firstAutomaton.type === "NFA" || secondAutomaton.type === "NFA") {
            newFa = SetOperations.dfaUnion(firstAutomaton, secondAutomaton);

        } else if (firstAutomaton.type === "DFA" && secondAutomaton.type === "DFA") {
            newFa  = SetOperations.dfaUnion(firstAutomaton, secondAutomaton);
        }

        let alphabet = new Set();
        newFa.transitions.forEach((transition) => {
            alphabet.add(transition.input);
        });

        let alphabetArr = Array.from(alphabet);
        let alphabetArrNoDuplicates = alphabetArr.filter((item, index) => alphabetArr.indexOf(item) === index);

        graphObject.input_alphabet = alphabetArrNoDuplicates;
        graphObject.transitions = newFa.transitions;
        graphObject.nodes = newFa.nodes;
        graphObject.startState = newFa.startState;
        graphObject.finishState = newFa.finishState;
        graphObject.type = newFa.type;

        if(!SetOperations.checkIfDfa(graphObject)){
            graphObject.type = "NFA";
            result_graph_store.update((n) => {
                n.type = "NFA";
                return n;
            });
        } else {
            graphObject.type = "DFA";
            result_graph_store.update((n) => {
                n.type = "DFA";
                return n;
            });
        }

        graphObject.generateGraphFromTransitions();

        createGraph(false);
        result_graph_store.update((n) => {
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

        resetInputVar.set(false);
        input_error_store.reset();
    }

    // Function to call intersection function of first and second graph
    function intersectionFunc() {
        let firstAutomaton = new FiniteStateAutomaton(
            $first_graph_store.nodes,
            $first_graph_store.transitions,
            $first_graph_store.startState,
            $first_graph_store.finishState,
            $first_graph_store.type
        )

        let secondAutomaton = new FiniteStateAutomaton(
            $second_graph_store.nodes,
            $second_graph_store.transitions,
            $second_graph_store.startState,
            $second_graph_store.finishState,
            $second_graph_store.type
        )

        let firstAutomatonAlphabet = [];
        firstAutomaton.transitions.forEach((transition) => {
            firstAutomatonAlphabet.push(transition.input);
        });

        //remove duplicates
        firstAutomatonAlphabet = firstAutomatonAlphabet.filter((item, index) => firstAutomatonAlphabet.indexOf(item) === index);

        //remove epsilon from alphabet
        firstAutomatonAlphabet = firstAutomatonAlphabet.filter((item) => item !== "ε");


        firstAutomaton.input_alphabet = firstAutomatonAlphabet;

        let secondAutomatonAlphabet = [];
        secondAutomaton.transitions.forEach((transition) => {
            secondAutomatonAlphabet.push(transition.input);
        });

        //remove duplicates
        secondAutomatonAlphabet = secondAutomatonAlphabet.filter((item, index) => secondAutomatonAlphabet.indexOf(item) === index);

        //remove epsilon from alphabet
        secondAutomatonAlphabet = secondAutomatonAlphabet.filter((item) => item !== "ε");

        secondAutomaton.input_alphabet = secondAutomatonAlphabet;

        deleteGraph();
        let newFa : FiniteStateAutomaton;
        if (firstAutomaton.type === "NFA" || secondAutomaton.type === "NFA") {
            newFa = SetOperations.nfaIntersection(firstAutomaton, secondAutomaton);

        } else if (firstAutomaton.type === "DFA" && secondAutomaton.type === "DFA") {
            newFa  = SetOperations.dfaIntersection(firstAutomaton, secondAutomaton);
        }

        let alphabet = new Set();
        newFa.transitions.forEach((transition) => {
            alphabet.add(transition.input);
        });

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
        result_graph_store.update((n) => {
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

        resetInputVar.set(false);
        input_error_store.reset();
    }

    // Function to call complement function of first graph
    function complementFunc() {
        let firstAutomaton = new FiniteStateAutomaton(
            $first_graph_store.nodes,
            $first_graph_store.transitions,
            $first_graph_store.startState,
            $first_graph_store.finishState,
            $first_graph_store.type
        )

        let firstAutomatonAlphabet = [];
        firstAutomaton.transitions.forEach((transition) => {
            firstAutomatonAlphabet.push(transition.input);
        });

        //remove duplicates
        firstAutomatonAlphabet = firstAutomatonAlphabet.filter((item, index) => firstAutomatonAlphabet.indexOf(item) === index);

        //remove epsilon from alphabet
        firstAutomatonAlphabet = firstAutomatonAlphabet.filter((item) => item !== "ε");


        firstAutomaton.input_alphabet = firstAutomatonAlphabet;

        deleteGraph();
        let newFa : FiniteStateAutomaton;
        if(firstAutomaton.type === "NFA") {
            newFa = SetOperations.nfaComplement(firstAutomaton);
        } else if (firstAutomaton.type === "DFA") {
            newFa = SetOperations.dfaComplement(firstAutomaton);
        }

        let alphabet = new Set();
        newFa.transitions.forEach((transition) => {
            alphabet.add(transition.input);
        });

        let alphabetArr = Array.from(alphabet);
        let alphabetArrNoDuplicates = alphabetArr.filter((item, index) => alphabetArr.indexOf(item) === index);

        graphObject.input_alphabet = alphabetArrNoDuplicates;
        graphObject.transitions = newFa.transitions;
        graphObject.nodes = newFa.nodes;
        graphObject.startState = newFa.startState;
        graphObject.finishState = newFa.finishState;
        graphObject.type = newFa.type;


        if(!SetOperations.checkIfDfa(graphObject)){
            graphObject.type = "NFA";
            result_graph_store.update((n) => {
                n.type = "NFA";
                return n;
            });
        } else {
            graphObject.type = "DFA";
            result_graph_store.update((n) => {
                n.type = "DFA";
                return n;
            });
        }

        graphObject.generateGraphFromTransitions();

        createGraph(false);
        result_graph_store.update((n) => {
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

        resetInputVar.set(false);
        input_error_store.reset();
    }

    // Function to call concatenation function of first and second graph
    function concatenationFunc() {
        let firstAutomaton = new FiniteStateAutomaton(
            $first_graph_store.nodes,
            $first_graph_store.transitions,
            $first_graph_store.startState,
            $first_graph_store.finishState,
            $first_graph_store.type
        )

        let secondAutomaton = new FiniteStateAutomaton(
            $second_graph_store.nodes,
            $second_graph_store.transitions,
            $second_graph_store.startState,
            $second_graph_store.finishState,
            $second_graph_store.type
        )

        deleteGraph();
        let newFa : FiniteStateAutomaton;
        if (firstAutomaton.type === "NFA" || secondAutomaton.type === "NFA") {
            newFa = SetOperations.nfaConcatenation(firstAutomaton, secondAutomaton);

        } else if (firstAutomaton.type === "DFA" && secondAutomaton.type === "DFA") {
            newFa  = SetOperations.dfaConcatenation(firstAutomaton, secondAutomaton);
        }

        let alphabet = new Set();
        newFa.transitions.forEach((transition) => {
            alphabet.add(transition.input);
        });

        let alphabetArr = Array.from(alphabet);
        let alphabetArrNoDuplicates = alphabetArr.filter((item, index) => alphabetArr.indexOf(item) === index);

        graphObject.input_alphabet = alphabetArrNoDuplicates;
        graphObject.transitions = newFa.transitions;
        graphObject.nodes = newFa.nodes;
        graphObject.startState = newFa.startState;
        graphObject.finishState = newFa.finishState;
        graphObject.type = newFa.type;

        if(!SetOperations.checkIfDfa(graphObject)){
            graphObject.type = "NFA";
            result_graph_store.update((n) => {
                n.type = "NFA";
                return n;
            });
        } else {
            graphObject.type = "DFA";
            result_graph_store.update((n) => {
                n.type = "DFA";
                return n;
            });
        }

        graphObject.generateGraphFromTransitions();

        createGraph(false);
        result_graph_store.update((n) => {
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

        resetInputVar.set(false);
        input_error_store.reset();
    }

    // Function to call difference function of first and second graph
    function differenceFunc(){
        let firstAutomaton = new FiniteStateAutomaton(
            $first_graph_store.nodes,
            $first_graph_store.transitions,
            $first_graph_store.startState,
            $first_graph_store.finishState,
            $first_graph_store.type
        )

        let secondAutomaton = new FiniteStateAutomaton(
            $second_graph_store.nodes,
            $second_graph_store.transitions,
            $second_graph_store.startState,
            $second_graph_store.finishState,
            $second_graph_store.type
        )

        let firstAutomatonAlphabet = [];
        firstAutomaton.transitions.forEach((transition) => {
            firstAutomatonAlphabet.push(transition.input);
        });

        //remove duplicates
        firstAutomatonAlphabet = firstAutomatonAlphabet.filter((item, index) => firstAutomatonAlphabet.indexOf(item) === index);

        //remove epsilon from alphabet
        firstAutomatonAlphabet = firstAutomatonAlphabet.filter((item) => item !== "ε");

        firstAutomaton.input_alphabet = firstAutomatonAlphabet;

        let secondAutomatonAlphabet = [];
        secondAutomaton.transitions.forEach((transition) => {
            secondAutomatonAlphabet.push(transition.input);
        });

        //remove duplicates
        secondAutomatonAlphabet = secondAutomatonAlphabet.filter((item, index) => secondAutomatonAlphabet.indexOf(item) === index);

        //remove epsilon from alphabet
        secondAutomatonAlphabet = secondAutomatonAlphabet.filter((item) => item !== "ε");

        secondAutomaton.input_alphabet = secondAutomatonAlphabet;

        deleteGraph();
        let newFa : FiniteStateAutomaton;
        if (firstAutomaton.type === "NFA" || secondAutomaton.type === "NFA") {
            newFa = SetOperations.nfaDifference(firstAutomaton, secondAutomaton);

        } else if (firstAutomaton.type === "DFA" && secondAutomaton.type === "DFA") {
            newFa  = SetOperations.dfaDifference(firstAutomaton, secondAutomaton);
        }

        let alphabet = new Set();
        newFa.transitions.forEach((transition) => {
            alphabet.add(transition.input);
        });

        let alphabetArr = Array.from(alphabet);
        let alphabetArrNoDuplicates = alphabetArr.filter((item, index) => alphabetArr.indexOf(item) === index);

        graphObject.input_alphabet = alphabetArrNoDuplicates;
        graphObject.transitions = newFa.transitions;
        graphObject.nodes = newFa.nodes;
        graphObject.startState = newFa.startState;
        graphObject.finishState = newFa.finishState;
        graphObject.type = newFa.type;

        if(!SetOperations.checkIfDfa(graphObject)){
            graphObject.type = "NFA";
            result_graph_store.update((n) => {
                n.type = "NFA";
                return n;
            });
        } else {
            graphObject.type = "DFA";
            result_graph_store.update((n) => {
                n.type = "DFA";
                return n;
            });
        }

        graphObject.generateGraphFromTransitions();

        createGraph(false);
        result_graph_store.update((n) => {
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

        resetInputVar.set(false);
        input_error_store.reset();
    }

    // Function to call iteration function of first graph
    function iterationFunc(){
        let firstAutomaton = new FiniteStateAutomaton(
            $first_graph_store.nodes,
            $first_graph_store.transitions,
            $first_graph_store.startState,
            $first_graph_store.finishState,
            $first_graph_store.type
        )

        deleteGraph();
        let newFa : FiniteStateAutomaton;
        newFa = SetOperations.dfaIteration(firstAutomaton);

        let alphabet = new Set();
        newFa.transitions.forEach((transition) => {
            alphabet.add(transition.input);
        });

        let alphabetArr = Array.from(alphabet);
        let alphabetArrNoDuplicates = alphabetArr.filter((item, index) => alphabetArr.indexOf(item) === index);

        graphObject.input_alphabet = alphabetArrNoDuplicates;
        graphObject.transitions = newFa.transitions;
        graphObject.nodes = newFa.nodes;
        graphObject.startState = newFa.startState;
        graphObject.finishState = newFa.finishState;
        graphObject.type = newFa.type;

        if(!SetOperations.checkIfDfa(graphObject)){
            graphObject.type = "NFA";
            result_graph_store.update((n) => {
                n.type = "NFA";
                return n;
            });
        } else {
            graphObject.type = "DFA";
            result_graph_store.update((n) => {
                n.type = "DFA";
                return n;
            });
        }

        graphObject.generateGraphFromTransitions();

        createGraph(false);
        result_graph_store.update((n) => {
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

        resetInputVar.set(false);
        input_error_store.reset();
    }

    // Function to delete the graph
    function deleteGraph () {
        graphObject.graph.elements().remove();
        graphObject.nodes = [];
        graphObject.edges = {};
        graphObject.transitions = [];
        graphObject.startState = [];
        graphObject.finishState = [];
        graphObject.followingID = 0;
        result_configuration_store.reset();
    }

    // Function to create the graph
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

    // Function to generate the configuration
    function generateConfiguration() {
        if (graphObject.nodes.length === 0 || graphObject.transitions.length === 0) {
            //erase configuration
            result_configuration_store.reset();
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

        Object.assign($result_configuration_store, configuration);
    }

    // Function to add node
    function addNode(node : GraphNodeMeta) {
        try {
            graphObject.addNode(node);
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("node");
            result_graph_store.update((n) => {
                n.nodes = graphObject.nodes;
                return n;
            });
            resetLayout();
        }
    }

    // Function to add edge
    function addEdge(edge : GraphEdgeMeta) {
        try {
            graphObject.addEdge(edge);
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("edge");
        }
    }

    // Function to update the configuration
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
        Object.assign($result_configuration_store, configuration);
    }

    // Function to reset the layout
    function resetLayout() {
        const layout = graphObject.graph.makeLayout({ name: "cola", edgeLength: 150, randomize: true, avoidOverlap: true, handleDisconnected: true});
        layout.run();
    }

    // Function to save the graph
    function saveGraph() {
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

        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "graph.json";
        a.click();

        URL.revokeObjectURL(url);
    }

    // Function to set graph properties
    function graphConstructor(){
        graphObject.graph = cytoscape({

            container: graphObject.div,
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
                        "width": 55,
                        "height": 55,
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
                name: "cola",
            }

        });
    }

    // Initial graph creation
    onMount(() => {
        graphConstructor();
    });


</script>

<div class="window">
    <slot />
    <div class="graph-wrapper">
        <div bind:this={graphObject.div} class="graph" />
        <div class="type-wrapper">
            <slot name="type" />
        </div>
    </div>
</div>

<style lang="scss">
  .window {
    width: 90%;
    min-width: 35rem;
    height: 90%;
    min-height: 25rem;

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

    border-radius: 0.5rem;

    height: calc(100% - 5vh);
  }

  .graph-wrapper {
    position: relative;
    height: 100%;
    width: 100%;
  }

  .type-wrapper {
    position: absolute;
    top: 0;
    left: 1rem;
    pointer-events: none;
  }
</style>
