<script lang="ts">
    import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
    import {
        configuration_store,
        first_graph_store, resetInputVar,
        result_configuration_store, result_graph_store,
        second_graph_store
    } from "../../../stores/graphInitStore";
    import {SetOperations} from "./SetOperations";
    import cytoscape from "cytoscape";
    import {onMount} from "svelte";
    import {input_error_store} from "../../../stores/inputErrorStore";

    let graphObject = new FiniteStateAutomaton([], [], [], [], [], "DFA");

    let highlightedNodesIS : String[] = [];

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
            result_graph_store.update((n) => {
                n.currentStatus = graphObject.currentStatus;
                n.currentStep = -1;
                return n;
            });
        } else {
            // console.log("Jsem v NFA větvi");
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
            // console.log(graphObject.currentStatus);

        }, 250);

        result_graph_store.update((n) => {
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
        }, 250);

        result_graph_store.update((n) => {
            n.currentStatus = graphObject.currentStatus;
            n.currentStep--;
            return n;
        });
    }

    function resetTestInput(){
        removeHighlighted();

        result_graph_store.update((n) => {
            n.isAccepted = null;
            n.status = "idle";
            return n;
        });

        graphObject.resetTestInput();
    }

    function removeHighlighted() {
        graphObject.graph.elements().forEach(graphElement => {
            if (highlightedNodesIS.includes(graphElement.id())) {
                graphElement.removeClass("highlight");
            }
        });

        highlightedNodesIS = [];
    }

    function highlightElement(id : string | number) {
        graphObject.graph.elements().forEach(graphElement => {
            if (id == graphElement.id()) {
                highlightedNodesIS.push(graphElement.id());
                graphElement.addClass("highlight");
            }
        });
    }

    function unionFunc() {
        console.log("union");
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

        console.log("first automaton: ", firstAutomaton);
        console.log("second automaton: ",secondAutomaton);
        deleteGraph();
        let newFa : FiniteStateAutomaton;
        if (firstAutomaton.type === "NFA" || secondAutomaton.type === "NFA") {
            newFa = SetOperations.nfaUnion(firstAutomaton, secondAutomaton);

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
        }


        console.log("newFa: ", graphObject);
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

    function intersectionFunc() {
        console.log("intersection");
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

        console.log("first automaton: ", firstAutomaton);
        console.log("second automaton: ",secondAutomaton);
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

        console.log("newFa: ", graphObject);
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

    function complementFunc() {
        console.log("complement");
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


        console.log("first automaton: ", firstAutomaton);
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
        }

        console.log("newFa: ", graphObject);
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

    function concatenationFunc() {
        console.log("concatenation");

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

        console.log("first automaton: ", firstAutomaton);
        console.log("second automaton: ",secondAutomaton);

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
        }

        console.log("newFa: ", graphObject);
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

    function differenceFunc(){
        console.log("difference");
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

        console.log("first automaton: ", firstAutomaton);
        console.log("second automaton: ",secondAutomaton);
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
        }

        console.log("newFa: ", graphObject);
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
    function iterationFunc(){
        console.log("iteration");
        let firstAutomaton = new FiniteStateAutomaton(
            $first_graph_store.nodes,
            $first_graph_store.transitions,
            $first_graph_store.startState,
            $first_graph_store.finishState,
            $first_graph_store.type
        )

        console.log("first automaton: ", firstAutomaton);
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
        }

        console.log("newFa: ", graphObject);
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

    function resetLayout() {
        const layout = graphObject.graph.makeLayout({ name: "circle" });
        layout.options.eles = graphObject.graph.elements();
        layout.run();
    }

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
                        "transition-duration": 100,
                    }
                },
            ],

            layout: {
                name: "circle",
            }

        });
    }

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
    //margin: 2.5% auto;

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
    width: 100%;
  }

  .type-wrapper {
    position: absolute;
    top: 0;
    left: 1rem;
    pointer-events: none;
  }
</style>
