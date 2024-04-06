// stores
import {
    pda_backup_store,
    pda_configuration_store,
    pda_graph_store,
    resetInputVar,
    stack_store
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
import spread from "cytoscape-spread";
spread(cytoscape);

export class PDAController {
    private static highlightedElementsId: string[] = [];
    private static deleteButtonActive: boolean = false;
    public static labelsBackup: string[] = [];
    private static debouncerTransition = createDebounce(250);

    public static testInput(input: string) {
        PDAController.resetTestInput();
        PDAController.removeHighlighted();

        PDAController.labelsBackup = [];
        for (let element of get(pda_graph_store).graph.elements()) {
            if (element.isEdge()) {
                PDAController.labelsBackup.push(element.data("label"));
            }
        }

        stack_store.update(() => {
            return [get(pda_graph_store).stackBottom];
        });

        pda_graph_store.update((n) => {
           n.word = input;
           n.status = "testing";
           n.traversal = n.process();
           n.currentStatus.input = n.word;
           return n;
        });

        PDAController.highlightElement(get(pda_graph_store).startState);
    }

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

    public static resetTestInput() {
        PDAController.removeHighlighted();

        pda_graph_store.update((n) => {
            n.resetTestInput();
            return n;
        });
    }

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

    public static nextTransition() {
        PDAController.removeHighlighted();
        PDAController.resetLabels();

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

            for (let element of n.graph.elements()) {
                if (element.isEdge() && element.id() === nextEdge) {
                    element.data("label", label);
                }
            }


            let dataStack = get(pda_configuration_store).data[n.currentStatus.step][2].reverse();
            if (dataStack.length === 1 && dataStack[0] === "Ø") dataStack.pop();
            stack_store.update(() => {
                return dataStack;
            });

            return n;
        });

        PDAController.debouncerTransition(() => {
            PDAController.highlightElement(nextNode);
            PDAController.highlightElement(nextEdge);
        });
    }

    public static previousTransition() {
        PDAController.removeHighlighted();
        PDAController.resetLabels();

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

            for (let element of n.graph.elements()) {
                if (element.isEdge() && element.id() === previousEdge) {
                    element.data("label", label);
                }
            }

            let dataStack = get(pda_configuration_store).data[n.currentStatus.step][2].reverse();
            if (dataStack.length === 1 && dataStack[0] === "Ø") dataStack.pop();
            stack_store.update(() => {
                return dataStack;
            });

            return n;
        });

        PDAController.debouncerTransition(() => {
            PDAController.highlightElement(previousNode);
            PDAController.highlightElement(previousEdge);
        });
    }

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


                pda_configuration_store.update((n) => {
                    n.input_alphabet = Array.from(alphabet);
                    n.stack_alphabet = Array.from(stackAlphabet);
                    n.transitions = get(pda_graph_store).transitions ?? [];
                    return n;
                });

                break;
            }

            case "type": {
                if (get(pda_graph_store).type === "empty") {
                    // remove finish class from nodes in graph
                    for (let node of get(pda_graph_store).nodes) {
                        if (node.class === "finish") {
                            node.class = "";
                        }
                    }

                    for (let element of get(pda_graph_store).graph.elements()) {
                        if (get(pda_graph_store).finalStates?.includes(element.id()) && !element.isEdge()) {
                            // @ts-ignore
                            element.removeClass("finish");
                        }
                    }
                } else {
                    for (let node of get(pda_graph_store).nodes) {
                        if (get(pda_graph_store).finalStates?.includes(node.id)) {
                            node.class = "finish";
                        }
                    }

                    for (let element of get(pda_graph_store).graph.elements()) {
                        if (get(pda_graph_store).finalStates?.includes(element.id()) && !element.isEdge()) {
                            // @ts-ignore
                            element.addClass("finish");
                        }
                    }
                }

                break;
            }
        }
    }

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

    public static resetLayout() {
        // @ts-ignore
        const layout = get(pda_graph_store).graph.makeLayout({ name: "spread", padding: 50 });
        layout.run();
    }

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
        a.href = url;
        a.download = "graph.json";
        a.click();

        URL.revokeObjectURL(url);
    }

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
                    pda_graph_store.update((n) => {
                        n.edges = graphData.edges;
                        n.finalStates = graphData.finishState;
                        n.nodes = graphData.nodes;
                        n.startState = graphData.startState;
                        n.transitions = graphData.transitions;
                        n.type = graphData.type;
                        return n;
                    });

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

    public static generateGraphFromTransitions(deleteBefore: boolean = true) {

        if (!PDAController.checkGenerationInput()) {
            return false;
        }

        if (deleteBefore) {
            PDAController.deleteGraph();
            PDAController.resetTestInput();
        }

        pda_graph_store.update(n => {
            n.type = get(pda_backup_store).type;
            n.startState = get(pda_backup_store).startState;
            n.finalStates = get(pda_backup_store).finalStates;
            n.transitions = get(pda_backup_store).transitions;
            n.nodes = get(pda_backup_store).nodes;
            pda_backup_store.reset();
            n.generateGraphFromTransitions();
            return n;
        });

        PDAController.createGraph(false);
        resetInputVar.set(false);
        input_error_store.reset();

        return true;
    }

    public static checkGenerationInput() {
        input_error_store.reset();

        if (get(pda_backup_store).transitions === undefined || get(pda_backup_store).transitions.length === 0) {
            input_error_store.update((n) => {
                n.transitions = false;
                return n;
            });
        }

        if (get(pda_backup_store).startState === undefined) {
            input_error_store.update((n) => {
                n.startState = false;
                return n;
            });
        }

        if (get(pda_backup_store).finalStates === undefined && get(pda_backup_store).type !== "empty") {
            input_error_store.update((n) => {
                n.finishState = false;
                return n;
            });
        }

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

    public static createGraph(genTransitions: boolean = false) {
        get(pda_graph_store).nodes.forEach((node : GraphNodeMeta) => {
            PDAController.addNode(node);
        });

        for (const edge in get(pda_graph_store).edges) {
            get(pda_graph_store).edges[edge].forEach((edge : GraphEdgeMeta) => {
                if (genTransitions) {
                    PDAController.addEdgeFromButton(edge);
                } else {
                    PDAController.addEdge(edge);
                }
            });
        }

        PDAController.generateConfiguration();
        const circle = get(pda_graph_store).graph.makeLayout({ name: "circle" });
        circle.run();
        PDAController.resetLayout();
    }

    public static addNode(node: GraphNodeMeta) {
        try {
            pda_graph_store.update(n => {
                n.addNode(node);
                return n;
            });
        } catch (e) {
            console.log(e);
        } finally {
            PDAController.updateConfiguration("node");
            PDAController.resetLayout();
        }
    }

    public static addEdge(edge: GraphEdgeMeta) {
        try {
            pda_graph_store.update(n => {
                n.addEdge(edge);
                return n;
            });
        } catch (e) {
            console.log(e);
        } finally {
            PDAController.updateConfiguration("edge");
        }
    }

    public static addEdgeFromButton(edge: GraphEdgeMeta, labelArr: string[] = []) {
        let first: string, second: string, third: string[];

        if (labelArr.length > 0) {
            first = labelArr[0];
            second = labelArr[1];
            third = labelArr[2].split(" ");
        } else {
            first = edge.label.split(",")[0];
            second = edge.label.split(",")[1].split(";")[0];
            third = edge.label.split(",")[1].split(";")[1].split(" ");
        }

        let transition = {
            state: edge.source,
            input: first,
            stack: second,
            stateAfter: edge.target,
            stackAfter: third
        };

        if (get(pda_graph_store).transitions.filter(t => PDAController.areTransitionsEqual(t, transition)).length === 0) {
            pda_graph_store.update(n => {
                n.transitions.push(transition);
                return n;
            });
        }

        PDAController.addEdge(edge);
    }

    private static areTransitionsEqual(t1 : TransitionType, t2 : TransitionType) {
        return t1.state === t2.state &&
            t1.input === t2.input &&
            t1.stack === t2.stack &&
            t1.stateAfter === t2.stateAfter &&
            Array.isArray(t1.stackAfter) && Array.isArray(t2.stackAfter) &&
            t1.stackAfter.length === t2.stackAfter.length &&
            t1.stackAfter.every((val, index) => val === t2.stackAfter[index]);
    }

    public static toggleDelete() {
        PDAController.deleteButtonActive = !PDAController.deleteButtonActive;

        if (PDAController.deleteButtonActive) {
            PDAController.deleteGraphElement();
        } else {
            get(pda_graph_store).graph.removeAllListeners();
        }
    }

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
}