/*
    PushdownAutomaton.ts
    Class containing the logic for the pushdown automaton
    Author: Jan Fojtík
*/

import type {GraphNodeMeta} from "../../../types/GraphNodeMeta";
import type {GraphEdgeDictionary} from "../../../types/GraphObject";
import type {AutomatonState} from "../../../types/AutomatonState";
import type {GraphEdgeMeta} from "../../../types/GraphEdgeMeta";
import type {TransitionType} from "../../../types/pda-cfg/TransitionType";
import cytoscape from "cytoscape";
import {pda_configuration_store} from "../../../stores/graphInitStore";
import {get} from "svelte/store";

export class PushdownAutomaton {
    // The graph object from the cytoscape library
    graph: cytoscape.Core = cytoscape({});

    // The div element where the graph will be rendered
    div: HTMLDivElement = null;

    // The status of the automaton
    status: string = undefined;

    // The nodes of the graph
    nodes: GraphNodeMeta[] = [];

    // The edges of the graph
    edges: GraphEdgeDictionary = {};

    // The transitions of the automaton
    transitions: TransitionType[] = [];

    // The stack of the automaton
    stack: string[] = [];

    // The current status of the automaton
    currentStatus: AutomatonState;

    // The word to be tested
    word: string = "";

    // The result of the test
    isAccepted: boolean = null;

    // The traversal of the automaton
    traversal: TransitionType[];

    // The type of the automaton
    type: string = "empty";

    // The start state of the automaton
    startState: string = "q0";

    // The final states of the automaton
    finalStates?: string[] = ["qF"];

    // The stack bottom of the automaton
    stackBottom: string = "Z";

    // Constructor for the Pushdown Automaton
    constructor() { };

    // Function to process the input
    // returns: TransitionType[] | null - the path of the input if it is accepted, null otherwise
    process() : TransitionType[] | null {
        // queue for BFS
        const queue: { state: string; stack: string[]; index: number; path: TransitionType[] }[] = [
            { state: this.startState, stack: [this.stackBottom], index: 0 , path: []}
        ];

        // in case of rejection, store the closest declined path
        let closestDeclinedPath: TransitionType[] | null = null;

        while (queue.length > 0) {
            const { state, stack, index, path } = queue.shift()!;

            // determine if the string got accepted by the type of PDA
            switch (this.type) {
                case "both": {  // if PDA accepts by empty stack, empty word and finish state
                    if ((index === this.word.length || this.word.length === 0) && stack.length === 0 && (this.finalStates).includes(state)) {
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "empty": { // if PDA accepts by empty stack and empty word
                    if ((index === this.word.length || this.word.length === 0) && stack.length === 0) {
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "final": { // if PDA accepts by empty word and finish state
                    if ((this.finalStates).includes(state) && (index === this.word.length || this.word.length === 0)) {
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                }
            }

            // store the closest path so far
            closestDeclinedPath = path;

            // find the possible transitions from the current state
            let possibleTransitions = this.transitions
                .filter(transition => transition.state === state &&
                                                   (transition.input === this.word[index] || transition.input === "ε"));

            // iterate through the possible transitions
            for (const transition of possibleTransitions) {
                if (stack[0] === transition.stack) {
                    const newPath = path.concat(transition);
                    let newStack = stack.slice();
                    newStack.shift();

                    if (transition.stackAfter[0] !== "ε") {
                        newStack.splice(0, 0, ...transition.stackAfter);
                    }

                    // add the next configuration to the queue
                    queue.push({
                        state: transition.stateAfter,
                        stack: newStack,
                        index: index + (transition.input === "ε" ? 0 : 1),
                        path: newPath,
                    });
                }
            }
        }

        // if we ever reach this point, the string is not accepted
        this.isAccepted = false;
        if (closestDeclinedPath) {
            return closestDeclinedPath;
        }
        return null; // string is not accepted
    }

    // Function to add a node to the graph
    // params: node: GraphNodeMeta - the node to be added
    addNode(node: GraphNodeMeta) {
        // if node exists return
        if (this.graph.$id(node.id).length !== 0) {
            return;
        }

        // if nodes array does not have this node
        if (this.nodes.filter((graphNode : GraphNodeMeta) => graphNode.id === node.id).length === 0) {
            this.nodes.push(node);
        }


        // add node to graph
        this.graph.add({
            group: "nodes",
            data: {id: node.id, label: node.label},
            classes: node.class,
        });

        // if node class has class finish, and it is not in graphObject.finalStates
        if (node.class?.includes("finish") && this.finalStates.filter((finishNode : string) => finishNode === node.id).length === 0) {
            this.finalStates.push(node.id);
        }

        // if node has class start
        if (node.class?.includes("start")) {
            this.startState = node.id;
        }
    }

    // Function to add an edge to the graph
    // params: edge: GraphEdgeMeta - the edge to be added
    addEdge(edge: GraphEdgeMeta) {
        // if edges already has this edge
        if (this.edges[edge.id]) {
            // if edges has this edge but with different label
            if (this.edges[edge.id].filter((graphEdge : GraphEdgeMeta) => graphEdge.label == edge.label).length == 0) {
                this.edges[edge.id].push(edge);
            }
        } else {
            this.edges[edge.id] = [edge];
        }

        // if edge with same source and target exists, add the label to the existing edge
        if (this.graph.$id(edge.id).length !== 0) {
            let tmpEdge = this.graph.$id(edge.id);
            const labels = tmpEdge.data("label").split("\n").filter(l => l !== "" && l !== undefined);

            if (labels.includes(edge.label)) {
                return;
            }

            // combine the label
            let combinedLabel = tmpEdge.data("label") + "\n" + edge.label;
            this.graph.$id(edge.id).data("label", combinedLabel);
        } else {
            this.graph.add({
                group: "edges",
                data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
            });
        }
    }

    // Function to generate the graph from transitions
    generateGraphFromTransitions() {
        // reset the graph
        this.resetGraph();

        // add edges from transitions
        this.transitions.forEach(transition => {
            let key = transition.state + "-" + transition.stateAfter;
            this.edges[key] = this.edges[key] ?? [];
            this.edges[key].push(
                {
                    id: (transition.state + "-" + transition.stateAfter),
                    label: (transition.input + "," + transition.stack + ";" + transition.stackAfter.join("")),
                    source: transition.state,
                    target: transition.stateAfter
                });
        });

        // add start and finish state to nodes
        let nodesArray = this.nodes.slice();
        this.nodes = [];
        nodesArray.forEach(node => {
            if (this.type !== "empty" && this.finalStates.includes(node.id) && node.id == this.startState) {
                this.nodes.push({id: node.id, label: node.label, class: "finish start"});
            } else if (this.type !== "empty" && this.finalStates.includes(node.id)) {
                this.nodes.push({id: node.id, label: node.label, class: "finish"});
            } else if (node.id === this.startState) {
                this.nodes.push({id: node.id, label: node.label, class: "start"});
            } else {
                this.nodes.push({id: node.id, label: node.label});
            }
        });
    }

    // Function for testing the input
    // returns: {nextNode: string, nextEdge: string} | null - the next transition if it exists, null otherwise
    nextTransition() {
        if (this.status !== "testing") {
            return;
        }

        if (!this.traversal[this.currentStatus.step]) {
            this.status = "null";
            return;
        }

        let nextNode = this.traversal[this.currentStatus.step].stateAfter;
        let nextEdge = this.traversal[this.currentStatus.step].state + "-" + nextNode;

        return {nextNode, nextEdge};
    }

    // Function for testing the input
    // returns: {previousNode: string, previousEdge: string} | null - the previous transition if it exists, null otherwise
    previousTransition() {
        if (this.currentStatus.step <= 0) {
            this.currentStatus.step = 0;
            return;
        }
        this.status = "testing";
        this.currentStatus.step--;

        if (!this.traversal[this.currentStatus.step]) {
            return;
        }

        let previousNode = this.traversal[this.currentStatus.step].state;
        let previousEdge = previousNode + "-" + this.traversal[this.currentStatus.step].stateAfter;

        return {previousNode, previousEdge};
    }

    // Function that resets the automaton to its initial state
    resetTestInput() {
        this.isAccepted = null;
        this.status = "idle";
        this.stack = [];
        this.traversal = undefined;
        this.word = "";
        this.currentStatus = {
            state: this.startState,
            input: "",
            stack: this.stackBottom,
            step: 0,
        };
    }

    // Function to reset the graph
    resetGraph() {
        this.graph.elements().remove();
    }

    toString() {
        let str = "M = (Q, Σ, Γ, δ, q0, Z0, F) where \n\n";
        // states from nodes
        str += `Q: {${get(pda_configuration_store).states.join(", ")}}\n`;

        // input alphabet and stack alphabet from transitions
        const alphabet = new Set();
        const stackAlphabet = new Set();
        for (let transition of get(pda_configuration_store).transitions) {
            if (transition.input !== "ε") {
                alphabet.add(transition.input);
            }

            if (transition.stack !== "ε") {
                stackAlphabet.add(transition.stack);
            }

            for (let c of transition.stackAfter) {
                if (c !== "ε") {
                    stackAlphabet.add(c);
                }
            }
        }

        str += `Σ: {${Array.from(alphabet).join(", ")}}\n`;
        str += `Γ: {${Array.from(stackAlphabet).join(", ")}}\n`;

        // transitions
        let i = 1;
        str += "δ: {\n";
        for (let transition of get(pda_configuration_store).transitions) {
            str += `   ${i}. (${transition.state}, ε, ${transition.stack}) = (${transition.stateAfter}, ${transition.stackAfter.join("")})\n`;
            i++;
        }

        str += "}\n";

        // start state
        str += `q0: ${get(pda_configuration_store).initial_state}\n`;

        // stack default
        str += `Z0: ${get(pda_configuration_store).initial_stack_symbol}\n`;

        // final states
        if (get(pda_configuration_store).type !== "empty")
            str += `F: {${get(pda_configuration_store).final_states.join(", ")}}`;

        return str;
    }
}