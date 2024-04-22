/*
    PDAController.ts
    Class for controlling the PDA:
        - visualization
        - traversal
        - configuration
        - graph generation
        - word testing
        - etc.

    Author: Jan Fojtík
*/

// stores
import {
    pda_backup_store,
    pda_configuration_store,
    pda_graph_store,
    resetInputVar,
    stack_store, table_index_store
} from "../../../stores/graphInitStore";
import {input_error_store} from "../../../stores/inputErrorStore";

// utils
import {get} from "svelte/store";
import {createDebounce} from "../../utils/debounce";

// types
import type {TransitionType} from "../../../types/pda-cfg/TransitionType";
import type {GraphNodeMeta} from "../../../types/GraphNodeMeta";
import type {GraphEdgeMeta} from "../../../types/GraphEdgeMeta";

// cytoscape
import cytoscape from "cytoscape";
import cola from "cytoscape-cola";
cytoscape.use(cola);

export class PDAController {
    // static variables

    // List of highlighted elements
    private static highlightedElementsId: string[] = [];

    // Flag for delete button
    private static deleteButtonActive: boolean = false;

    // Backup of labels
    private static labelsBackup: string[] = [];

    // Debouncer for transitions
    private static debouncerTransition = createDebounce(250);

    // Function that tests a given input
    // params: input - string to be tested
    public static testInput(input: string) {
        // reset test input
        PDAController.resetTestInput();

        // remove all highlighted elements
        PDAController.removeHighlighted();

        // backup labels
        PDAController.labelsBackup = [];
        for (let element of get(pda_graph_store).graph.elements()) {
            if (element.isEdge()) {
                PDAController.labelsBackup.push(element.data("label"));
            }
        }

        // update stack
        stack_store.update(() => {
            return [get(pda_graph_store).stackBottom];
        });

        // process the input
        pda_graph_store.update((n) => {
           n.word = input;
           n.status = "testing";
           n.traversal = n.process();
           n.currentStatus.input = n.word;
           return n;
        });

        // highlight the start state
        PDAController.highlightElement(get(pda_graph_store).startState);
    }

    // Function that highlights an element
    // params: id - id of the element to be highlighted
    public static highlightElement(id: string | number) {
        pda_graph_store.subscribe((n) => {
            for (let element of n.graph.elements()) {
                if (id === element.id()) {
                    PDAController.highlightedElementsId.push(element.id());
                    element.addClass("highlight");
                }
            }
        })
    }

    // Function that removes all highlighted elements
    public static removeHighlighted() {
        pda_graph_store.subscribe((n) => {
            for (let element of n.graph.elements()) {
                if (PDAController.highlightedElementsId.includes(element.id())) {
                    element.removeClass("highlight");
                }
            }
        });

        PDAController.highlightedElementsId = [];
    }

    // Function that resets the test input
    public static resetTestInput() {
        PDAController.removeHighlighted();

        pda_graph_store.update((n) => {
            n.resetTestInput();
            return n;
        });
    }

    // Function that resets the labels of the edges to the original ones
    public static resetLabels() {
        let i = 0;
        pda_graph_store.subscribe((n) => {
            for (let element of n.graph.elements()) {
                if (element.isEdge()) {
                    element.data("label", PDAController.labelsBackup[i]);
                    i++;
                }
            }
        });
    }

    // Function that highlights the next transition and updates the stack
    public static nextTransition() {
        PDAController.removeHighlighted();
        PDAController.resetLabels();

        // get the next transition
        let ret = get(pda_graph_store).nextTransition();

        if (!ret) return;

        let nextNode = ret.nextNode;
        let nextEdge = ret.nextEdge;

        // currently used rule
        let rule: TransitionType;
        let label: string;
        pda_graph_store.update((n) => {
            rule = n.traversal[n.currentStatus.step];
            label = rule.input + "," + rule.stack + ";" + rule.stackAfter.join("");

            n.currentStatus.state = nextNode;
            n.currentStatus.stack = n.stack[n.stack.length - 1];
            n.currentStatus.step++;

            // update label
            for (let element of n.graph.elements()) {
                if (element.isEdge() && element.id() === nextEdge) {
                    element.data("label", label);
                }
            }

            // update stack
            let dataStack = get(pda_configuration_store).data[n.currentStatus.step][2].reverse();
            if (dataStack.length === 1 && dataStack[0] === "ε") dataStack.pop();
            stack_store.update(() => {
                return dataStack;
            });

            return n;
        });

        // highlight the next transition
        PDAController.debouncerTransition(() => {
            PDAController.highlightElement(nextNode);
            PDAController.highlightElement(nextEdge);
        });
    }

    // Function that highlights the previous transition and updates the stack
    public static previousTransition() {
        PDAController.removeHighlighted();
        PDAController.resetLabels();

        // get the previous transition
        let ret = get(pda_graph_store).previousTransition();

        if (!ret) return;

        let previousNode = ret.previousNode;
        let previousEdge = ret.previousEdge;

        // currently used rule
        let rule: TransitionType;
        let label: string;
        pda_graph_store.update((n) => {
            rule = n.traversal[n.currentStatus.step];
            label = rule.input + "," + rule.stack + ";" + rule.stackAfter.join("");

            n.currentStatus.state = previousNode;
            n.currentStatus.stack = n.stack[n.stack.length - 1];

            // update label
            for (let element of n.graph.elements()) {
                if (element.isEdge() && element.id() === previousEdge) {
                    element.data("label", label);
                }
            }

            // update stack
            let dataStack = get(pda_configuration_store).data[n.currentStatus.step][2].reverse();
            if (dataStack.length === 1 && dataStack[0] === "Ø") dataStack.pop();
            stack_store.update(() => {
                return dataStack;
            });

            return n;
        });

        // highlight the previous transition
        PDAController.debouncerTransition(() => {
            PDAController.highlightElement(previousNode);
            PDAController.highlightElement(previousEdge);
        });
    }

    // Function that generates the configuration of the PDA
    public static generateConfiguration() {
        if (get(pda_graph_store).nodes.length === 0 || get(pda_graph_store).transitions.length === 0) {
            // erase configuration
            pda_configuration_store.reset();
            return;
        }

        // states
        const states = new Set<string>();
        for (let node of get(pda_graph_store).nodes) {
            states.add(node.id);
        }

        // input alphabet
        const alphabet = new Set<string>();
        for (let transition of get(pda_graph_store).transitions) {
            alphabet.add(transition.input);
        }

        // stack alphabet
        const stackAlphabet = new Set<string>();
        for (let transition of get(pda_graph_store).transitions) {
            if (transition.stack !== "ε") {
                stackAlphabet.add(transition.stack);
            }

            for (let c of transition.stackAfter) {
                if (c !== "ε") {
                    stackAlphabet.add(c);
                }
            }
        }

        // update the configuration store
        pda_configuration_store.update(n => {
            n.states = Array.from(states);
            n.input_alphabet = Array.from(alphabet);
            n.stack_alphabet = Array.from(stackAlphabet);
            n.transitions = get(pda_graph_store).transitions ?? [];
            n.initial_state = get(pda_graph_store).startState;
            n.initial_stack_symbol = get(pda_graph_store).stackBottom;
            n.final_states = get(pda_graph_store).finalStates;
            n.type = get(pda_graph_store).type;
            return n;
        });
    }

    // Function that updates part of the configuration of the PDA
    // params: mode - part of the configuration to be updated
    public static updateConfiguration(mode : string) {
        switch (mode) {
            case "node": {
                // states
                let states = new Set<string>();
                for (let node of get(pda_graph_store).nodes) {
                    states.add(node.id);
                }

                pda_configuration_store.update((n) => {
                    n.states = Array.from(states);
                    n.initial_state = get(pda_graph_store).startState;
                    n.final_states = get(pda_graph_store).finalStates;
                    return n;
                });

                break;
            }

            case "edge": {
                // input alphabet
                const alphabet = new Set<string>();
                for (let transition of get(pda_graph_store).transitions) {
                    if (transition.input !== "ε") {
                        alphabet.add(transition.input);
                    }
                }
                // stack alphabet
                const stackAlphabet = new Set<string>();
                for (let transition of get(pda_graph_store).transitions) {
                    if (transition.stack !== "ε") {
                        stackAlphabet.add(transition.stack);
                    }

                    for (let c of transition.stackAfter) {
                        if (c !== "ε") {
                            stackAlphabet.add(c);
                        }
                    }
                }

                // update the configuration store
                pda_configuration_store.update((n) => {
                    n.input_alphabet = Array.from(alphabet);
                    n.stack_alphabet = Array.from(stackAlphabet);
                    n.transitions = get(pda_graph_store).transitions ?? [];
                    return n;
                });

                break;
            }
        }
    }

    // Function that deletes the graph
    public static deleteGraph() {
        pda_graph_store.update(n => {
            n.graph.elements().remove();
            n.nodes = [];
            n.edges = {};
            n.transitions = [];
            n.startState = "";
            n.finalStates = [];
            pda_configuration_store.reset();
            return n;
        });
    }

    // Function that resets the layout of the graph
    // it's called after the graph is loaded, on reset and on resize
    public static resetLayout() {
        // @ts-ignore
        const layout = get(pda_graph_store).graph.makeLayout({ name: "cola", randomize: true, edgeLength: 150});
        layout.run();
    }

    // Function that saves the graph into JSON
    public static saveGraph() {
        const simplifiedGraph = {
            edges: get(pda_graph_store).edges,
            nodes: get(pda_graph_store).nodes,
            transitions: get(pda_graph_store).transitions,
            startState: get(pda_graph_store).startState,
            finishState: get(pda_graph_store).finalStates,
            type: get(pda_graph_store).type,
        }

        // save object into json
        let jsonData = JSON.stringify(simplifiedGraph, null, 4);
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        // download the file
        a.href = url;
        a.download = "graph.json";
        a.click();

        URL.revokeObjectURL(url);
    }

    // Function that loads the graph from JSON
    public static loadGraph() {
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

                    PDAController.deleteGraph();

                    if (!graphData.nodes || !graphData.edges || graphData.transitions.length === 0 || !graphData.startState || !graphData.finishState || !graphData.type) {
                        return;
                    }

                    // update the graph store
                    pda_graph_store.update((n) => {
                        n.edges = graphData.edges;
                        n.finalStates = graphData.finishState;
                        n.nodes = graphData.nodes;
                        n.startState = graphData.startState;
                        n.transitions = graphData.transitions;
                        n.type = graphData.type;
                        return n;
                    });

                    // generate the graph
                    PDAController.generateGraphFromTransitions();
                    PDAController.generateConfiguration();
                    PDAController.resetLayout();
                };
            } catch (e) {
                console.log(e);
            }
        };

        input.click();
    }

    // Function that generates the graph from transitions
    // params: deleteBefore - flag if the graph should be deleted before generating
    //
    // returns: boolean - flag if the graph was generated successfully
    public static generateGraphFromTransitions(deleteBefore: boolean = true) {
        table_index_store.set(-1);

        // check if the input is correct
        if (!PDAController.checkGenerationInput()) {
            return false;
        }

        // delete the graph before generating
        if (deleteBefore) {
            PDAController.deleteGraph();
            PDAController.resetTestInput();
        }

        // create the graph
        pda_graph_store.update(n => {
            n.type = get(pda_backup_store).type;
            n.startState = get(pda_backup_store).startState;
            n.finalStates = get(pda_backup_store).finalStates;
            n.transitions = get(pda_backup_store).transitions;
            n.nodes = get(pda_backup_store).nodes;
            n.stackBottom = get(pda_backup_store).stackBottom;
            pda_backup_store.reset();
            n.generateGraphFromTransitions();
            return n;
        });

        PDAController.createGraph(false);
        resetInputVar.set(false);
        input_error_store.reset();

        return true;
    }

    // Function that checks the input before generating the graph
    // returns: boolean - flag if the input is correct
    public static checkGenerationInput() {
        input_error_store.reset();

        // transitions
        if (get(pda_backup_store).transitions === undefined || get(pda_backup_store).transitions.length === 0) {
            input_error_store.update((n) => {
                n.transitions = false;
                return n;
            });
        }

        // start state
        if (get(pda_backup_store).startState === undefined) {
            input_error_store.update((n) => {
                n.startState = false;
                return n;
            });
        }

        // final states
        if (get(pda_backup_store).finalStates === undefined && get(pda_backup_store).type !== "empty") {
            input_error_store.update((n) => {
                n.finishState = false;
                return n;
            });
        }

        // type
        if (get(pda_backup_store).type === undefined) {
            input_error_store.update((n) => {
                n.type = false;
                return n;
            });
        }

        return !(get(input_error_store).transitions === false ||
                 get(input_error_store).startState  === false ||
                 get(input_error_store).finishState === false);
    }

    // Function that creates the graph from the transitions
    // params: genTransitions - flag if the transitions should be generated
    public static createGraph(genTransitions: boolean = false) {
        // create nodes
        get(pda_graph_store).nodes.forEach((node : GraphNodeMeta) => {
            PDAController.addNode(node);
        });

        // create edges
        for (const edge in get(pda_graph_store).edges) {
            get(pda_graph_store).edges[edge].forEach((edge : GraphEdgeMeta) => {
                if (genTransitions) {
                    PDAController.addEdgeFromButton(edge);
                } else {
                    PDAController.addEdge(edge);
                }
            });
        }

        // generate the configuration
        PDAController.generateConfiguration();
        PDAController.resetLayout();
    }

    // Function that adds a node to the graph
    public static addNode(node: GraphNodeMeta) {
        try {
            // add node to the graph
            pda_graph_store.update(n => {
                n.addNode(node);
                return n;
            });
        } catch (e) {
            console.log(e);
        } finally {
            // update the configuration and reset layout
            PDAController.updateConfiguration("node");
            PDAController.resetLayout();
        }
    }

    // Function that adds an edge to the graph
    public static addEdge(edge: GraphEdgeMeta) {
        try {
            // add edge to the graph
            pda_graph_store.update(n => {
                n.addEdge(edge);
                return n;
            });
        } catch (e) {
            console.log(e);
        } finally {
            // update the configuration
            PDAController.updateConfiguration("edge");
        }
    }

    // Function that adds an edge to the graph from a button
    // params: edge - edge to be added
    //         labelArr - array of label segments
    public static addEdgeFromButton(edge: GraphEdgeMeta, labelArr: string[] = []) {
        let first: string, second: string, third: string[];

        // get the parts of the label
        if (labelArr.length > 0) {
            first = labelArr[0];
            second = labelArr[1];
            third = labelArr[2].split(" ");
        } else {
            first = edge.label.split(",")[0];
            second = edge.label.split(",")[1].split(";")[0];
            third = edge.label.split(",")[1].split(";")[1].split(" ");
        }

        // create the transition
        let transition = {
            state: edge.source,
            input: first,
            stack: second,
            stateAfter: edge.target,
            stackAfter: third
        };

        // add the edge to the transitions if it doesn't exist
        if (get(pda_graph_store).transitions.filter(t => PDAController.areTransitionsEqual(t, transition)).length === 0) {
            pda_graph_store.update(n => {
                n.transitions.push(transition);
                return n;
            });
        }

        PDAController.addEdge(edge);
    }

    // Function that checks if two transitions are equal
    private static areTransitionsEqual(t1 : TransitionType, t2 : TransitionType) {
        return t1.state === t2.state &&
            t1.input === t2.input &&
            t1.stack === t2.stack &&
            t1.stateAfter === t2.stateAfter &&
            Array.isArray(t1.stackAfter) && Array.isArray(t2.stackAfter) &&
            t1.stackAfter.length === t2.stackAfter.length &&
            t1.stackAfter.every((val, index) => val === t2.stackAfter[index]);
    }

    // Function that toggles the delete button
    public static toggleDelete() {
        PDAController.deleteButtonActive = !PDAController.deleteButtonActive;

        if (PDAController.deleteButtonActive) {
            PDAController.deleteGraphElement();
        } else {
            get(pda_graph_store).graph.removeAllListeners();
        }
    }

    // Function that deletes an element from the graph
    public static deleteGraphElement() {
        get(pda_graph_store).graph.on("click", "*", function() {
            //if clicked object is edge
            if (this.isEdge()) {
                let tmpEdge = this.id();
                let tmpEdgeSource = this.source().id();
                let tmpEdgeTarget = this.target().id();

                // remove edge from edges
                if (get(pda_graph_store).edges[tmpEdge].length > 1) {
                    get(pda_graph_store).edges[tmpEdge] = get(pda_graph_store).edges[tmpEdge].filter((edge : GraphEdgeMeta) => edge.id !== tmpEdge);
                } else {
                    delete get(pda_graph_store).edges[tmpEdge];
                }

                // remove edge from transitions
                get(pda_graph_store).transitions = get(pda_graph_store).transitions.filter((transition : TransitionType) => {
                    return !(transition.state === tmpEdgeSource && transition.stateAfter === tmpEdgeTarget);
                });

                PDAController.updateConfiguration("edge");
            } else {
                // if node has class final
                if (this.hasClass("finish")) {
                    // get the number of finish nodes
                    let finishNodes = get(pda_graph_store).finalStates.length;
                    if (finishNodes === 1) {
                        return;
                    } else {
                        // remove node from finishState
                        get(pda_graph_store).finalStates = get(pda_graph_store).finalStates.filter((node : string) => node !== this.id());
                    }
                }

                // if node has class start
                if (this.hasClass("start")) {
                    get(pda_graph_store).startState = "";
                }

                // remove node from nodes
                get(pda_graph_store).nodes = get(pda_graph_store).nodes.filter((node : GraphNodeMeta) => node.id !== this.id());

                // remove edges from edges
                for (const edge in get(pda_graph_store).edges) {
                    get(pda_graph_store).edges[edge] = get(pda_graph_store).edges[edge].filter((edge : GraphEdgeMeta) => edge.source !== this.id() && edge.target !== this.id());
                }

                // remove transitions from transitions
                get(pda_graph_store).transitions = get(pda_graph_store).transitions.filter((transition : TransitionType) => {
                    return !(transition.state === this.id() || transition.stateAfter === this.id());
                });

                PDAController.updateConfiguration("node");
            }
            get(pda_graph_store).graph.remove("#" + this.id());
        });
    }

    // Function that changes the graph style based on the theme
    public static changeGraphStyle() {
        // check if dark mode is enabled
        const isDarkMode = window.document.body.classList.contains("dark-mode");

        // check if graph is initialized
        if (get(pda_graph_store).graph.style() === undefined)
            return;

        get(pda_graph_store).graph.style()
                .selector("node").style({
                "background-color": isDarkMode ?  "#f4f9ff" : "#808080",
                "border-color": isDarkMode ? "#000" : "#101820",
                "color": isDarkMode ? "#101820" : "#f4f9ff",
            })
                .selector("edge").style({
                "line-color": isDarkMode ? "#f4f9ff" : "#101820",
                "target-arrow-color": isDarkMode ? "#f4f9ff" : "#101820",
                "source-arrow-color": isDarkMode ? "#f4f9ff" : "#101820",
            })
                .selector(".highlight").style({
                "background-color": "#0080ff",
                "line-color": "#0080ff",
                "target-arrow-color": "#0080ff",
                "transition-property": "line-color, target-arrow-color, background-color",
                "transition-duration": 100,
            })
                .selector(".start").style({
                "border-color": "#00ff00",
            })
                .selector(".finish").style({
                "border-color": "#ff0000",
            })
        .update();
    }
}