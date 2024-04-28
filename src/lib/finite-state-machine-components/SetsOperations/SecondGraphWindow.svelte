<!--
    SecondGraphWindow.svelte
    This component is a window for the second graph in the application. It contains the graph itself and the type of the graph.
    It also contains the toolbar functions for the graph.
    Author: Marek Krúpa
-->

<script lang="ts">
    // Imports
    import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
    import {onMount} from "svelte";
    import {
        first_graph_store,
        resetInputVar, second_backup_store,
        second_configuration_store,
        second_graph_store
    } from "../../../stores/graphInitStore";
    import cytoscape from "cytoscape";
    import cola from "cytoscape-cola";
    cytoscape.use(cola);
    import {input_error_store} from "../../../stores/inputErrorStore";
    import {get} from "svelte/store";
    import {SetOperations} from "./SetOperations";

    // variables
    let graphObject = new FiniteStateAutomaton([], [], [], [], [], "DFA");

    // Toolbar functions
    export const secondToolbarFunctions = {
        addNode,
        addEdge,
        saveGraph,
        loadGraph,
        deleteGraph,
        resetLayout,
        generateConfiguration,
        generateGraphFromTransitions,
    } as ToolbarFunctions;

    // Check if the type of the graph has changed
    $: if ($second_graph_store.type) {
        updateConfiguration("type");
    }

    // Check if the theme of the graph has changed
    $: if ($second_graph_store.theme){
        if (graphObject != undefined){
            graphObject.changeGraphStyle();
        }
    }

    // Function for deleting a graph
    function deleteGraph() {
        graphObject.graph.elements().remove();
        graphObject.nodes = [];
        graphObject.edges = {};
        graphObject.transitions = [];
        graphObject.startState = [];
        graphObject.finishState = [];
        graphObject.followingID = 0;
        second_configuration_store.reset();
    }

    // Function for saving the graph
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

        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "graph.json";
        a.click();

        URL.revokeObjectURL(url);
    }

    // Function for loading the graph
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



                    if (!graphData.nodes || !graphData.edges || graphData.transitions.length === 0 || !graphData.startState || !graphData.finishState || !graphData.type) {
                        return;
                    }

                    //check if in graphDate are not same label as in second_graph_store.nodes
                    let sameLabel = false;
                    graphData.nodes.forEach((node : GraphNodeMeta) => {
                        if (get(first_graph_store).nodes.find((n : GraphNodeMeta) => n.label === node.label)) {
                            sameLabel = true;
                        }
                    });

                    if (sameLabel) {
                        alert("The graph cannot be loaded because it contains nodes with the same label as the first graph.");
                        return;
                    }

                    deleteGraph();

                    //find in graphDate.nodes biggest id and set it to graphObject.followingID +1
                    let maxId = 0;
                    graphData.nodes.forEach((node : GraphNodeMeta) => {
                        if (parseInt(node.id) > maxId) {
                            maxId = parseInt(node.id);
                        }
                    });

                    second_backup_store.update((n) => {
                        n.finishState = graphData.finishState;
                        n.nodes = graphData.nodes;
                        n.startState = graphData.startState;
                        n.transitions = graphData.transitions;
                        n.type = graphData.type;
                        n.followingID = maxId + 1;
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

    // Function for generating the configuration
    function generateConfiguration() {
        if (graphObject.nodes.length === 0 || graphObject.transitions.length === 0) {
            //erase configuration
            second_configuration_store.reset();
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

        Object.assign($second_configuration_store, configuration);
    }

    // Function for updating the configuration
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
        Object.assign($second_configuration_store, configuration);
    }

    // Function for checking the input for generating the graph
    function checkGenerationInput(){
        if($input_error_store.transitions == false){
            return false;
        }
        input_error_store.reset();
        if ($second_backup_store.transitions === undefined || $second_backup_store.transitions.length === 0) {
            input_error_store.update((n) => {
                n.transitions = false;
                return n;
            });
        }

        if ($second_backup_store.startState === undefined) {
            input_error_store.update((n) => {
                n.startState = false;
                return n;
            });
        }

        if ($second_backup_store.finishState === undefined && $second_backup_store.type !== "empty") {
            input_error_store.update((n) => {
                n.finishState = false;
                return n;
            });
        }

        return !($input_error_store.transitions === false ||
            $input_error_store.startState === false ||
            $input_error_store.finishState === false);
    }

    // Function for resetting the layout
    function resetLayout() {
        const layout = graphObject.graph.makeLayout({ name: "cola", edgeLength: 150, randomize: true, avoidOverlap: true, handleDisconnected: true});
        layout.run();
    }

    // Function for adding a node
    function addNode(node : GraphNodeMeta) {
        try {
            graphObject.addNode(node);
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("node");
            second_graph_store.update((n) => {
                n.nodes = graphObject.nodes;
                return n;
            });
            resetLayout();
        }
    }

    // Function for adding an edge
    function addEdge(edge : GraphEdgeMeta) {
        try {
            graphObject.addEdge(edge);
        } catch (e) {
            console.log(e);
        } finally {
            updateConfiguration("edge");
        }
    }

    // Function for creating a graph
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

    // Function for generating a graph from transitions
    function generateGraphFromTransitions() {
        if (!checkGenerationInput()) {
            return false;
        }
        $second_graph_store.hideConvertTable = true;
        deleteGraph();

        second_graph_store.update((n) => {
            n.type = get(second_backup_store).type;
            n.startState = get(second_backup_store).startState;
            n.finishState = get(second_backup_store).finishState;
            n.transitions = get(second_backup_store).transitions;
            n.nodes = get(second_backup_store).nodes;
            n.input_alphabet = get(second_backup_store).input_alphabet;
            n.followingID = get(second_backup_store).followingID;
            return n;
        });


        Object.assign(graphObject, $second_graph_store);

        if(!SetOperations.checkIfDfa(graphObject)){
            graphObject.type = "NFA";
            second_graph_store.update((n) => {
                n.type = "NFA";
                return n;
            });
        } else {
            graphObject.type = "DFA";
            second_graph_store.update((n) => {
                n.type = "DFA";
                return n;
            });
        }

        graphObject.generateGraphFromTransitions();

        createGraph(false);
        second_graph_store.update((n) => {
            n.input_alphabet = graphObject.input_alphabet;
            n.generated = true;
            return n;
        });

        resetInputVar.set(false);
        input_error_store.reset();

        graphObject.startState = $second_graph_store.startState;

        return true;
    }

    // Function for graph constructor
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

    let exampleNodes = [
        { id: "0", label: "q0", class: "start"},
        { id: "1", label: "q1", class: "finish" },
    ];

    let exampleTransition = [
        {
            state: "0",
            stateLabel: "q0",
            input: "b",
            stateAfter: "0",
            stateAfterLabel: "q0"
        },
        {
            state: "0",
            stateLabel: "q0",
            input: "a",
            stateAfter: "1",
            stateAfterLabel: "q1"
        },
        {
            state: "1",
            stateLabel: "q1",
            input: "a",
            stateAfter: "0",
            stateAfterLabel: "q0"
        },
        {
            state: "1",
            stateLabel: "q1",
            input: "b",
            stateAfter: "1",
            stateAfterLabel: "q1"
        }
    ];

    // Initialize the graph
    onMount(() => {
        graphConstructor();

        second_graph_store.update((n) => {
            n.hideConvertTable = true;
            n.theme = "dark";
            return n;
        });

        second_backup_store.update((n) => {
            n.type = "DFA";
            n.transitions = exampleTransition;
            n.nodes = exampleNodes;
            n.startState = ["0"];
            n.finishState = ["1"];
            n.input_alphabet = ["a", "b"];
            n.followingID = 2;
            return n;
        });

        generateGraphFromTransitions();
    });

</script>

<div class="window">
    <slot />
    <div class="graph-wrapper">
        <div bind:this={graphObject.div} class="graph" />
        <div class="type-wrapper">
            <slot name="type" />
        </div>
        <div class="name-wrapper">
            <h2>A₂</h2>
        </div>
    </div>
</div>

<style lang="scss">
  .window {
    width: 90%;
    height: 90%;

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
  }

  .type-wrapper {
    position: absolute;
    top: 0;
    left: 1rem;
    pointer-events: none;
  }

  .name-wrapper {
    position: absolute;
    top: 0;
    right: 1rem;
    pointer-events: none;
  }

</style>
