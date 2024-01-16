import type {GraphNodeMeta} from "../../types/GraphNodeMeta";
import type {GraphEdgeDictionary} from "../../types/GraphObject";
import type {TransitionMeta} from "../../types/TransitionMeta";
import type {AutomatonState} from "../../types/AutomatonState";
import type {GraphEdgeMeta} from "../../types/GraphEdgeMeta";
import {graph_store} from "../../stores/graphInitStore";
import {PDATransition} from "../cf-grammar/CFGToPDA";

export class PushdownAutomaton {
    graph = null;
    div: HTMLDivElement = null;
    status: string = "idle";
    nodes: GraphNodeMeta[] = [];
    edges: GraphEdgeDictionary = {};
    transitions: TransitionMeta[] = [];
    stack: string[] = [];
    currentStatus: AutomatonState;
    word: string[] = [];
    isAccepted: boolean = false;
    traversal: TransitionMeta[] = [];
    type: string = "empty";
    startState: string = "q0";
    finishState?: string[] = ["qF"];

    constructor() { };

    process() : TransitionMeta[] | null {
        const queue: { state: string; stack: string[]; index: number; path: TransitionMeta[] }[] = [
            { state: this.startState, stack: ["Z"], index: 0 , path: []}
        ];

        let closestDeclinedPath: TransitionMeta[] | null = null;
        while (queue.length > 0) {
            const { state, stack, index, path } = queue.shift()!;
            switch (this.type) {
                case "both": {  // if PA accepts by empty stack, empty word and finish state
                    if ((index === this.word.length || this.word.length === 0) && stack.length === 0 && (this.finishState).includes(state)) {
                        console.log("accepted");
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "empty": { // if PA accepts by empty stack and empty word
                    if ((index === this.word.length || this.word.length === 0) && stack.length === 0) {
                        console.log("accepted");
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "final": { //if PA accepts by empty word and finish state
                    if ((this.finishState).includes(state) && (index === this.word.length || this.word.length === 0)) {
                        console.log("accepted");
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                }
            }

            closestDeclinedPath = path;
            for (const transition of this.transitions) {
                if (transition.state === state && (transition.input === this.word[index] || transition.input === "E")) {
                    const stackTop = stack[stack.length - 1];
                    // if (stackTop === transition.stack || (transition.stack === "Z" && stack.length === 1)) {
                    if (stackTop === transition.stack) {
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
        this.isAccepted = false;
        if (closestDeclinedPath) {
            return closestDeclinedPath;
        }
        return null; // String is not accepted
    }

    addNode(node: GraphNodeMeta) {
        if (this.graph.$id(node.id).length !== 0) {
            return;
        }

        if (this.nodes.filter((graphNode : GraphNodeMeta) => graphNode.id === node.id).length === 0) {
            this.nodes.push(node);
        }

        this.graph.add({
            group: "nodes",
            data: {id: node.id, label: node.label},
            classes: node.class,
        });

        //if node class is finish, and it is not in graphObject.finishState
        if (node.class?.includes("finish") && this.finishState.filter((finishNode : string) => finishNode === node.id).length === 0) {
            this.finishState.push(node.id);
        }

        //if node class is start
        if (node.class?.includes("start")) {
            this.startState = node.id;
        }
    }

    addEdge(edge: GraphEdgeMeta) {
        //if edges already has this edge
        if (this.edges[edge.id]) {
            //if edges has this edge but with different label
            if (this.edges[edge.id].filter((graphEdge : GraphEdgeMeta) => graphEdge.label == edge.label).length == 0) {
                this.edges[edge.id].push(edge);
            }
        } else {
            this.edges[edge.id] = [edge];
        }

        if (this.graph.$id(edge.id).length !== 0) {
            let tmpEdge = this.graph.$id(edge.id);

            if (tmpEdge.data("label").split("\n").includes(edge.label)) {
                return;
            }

            let combinedLabel = tmpEdge.data("label") + "\n" + edge.label;
            this.graph.$id(edge.id).data("label", combinedLabel);
        } else {
            this.graph.add({
                group: "edges",
                data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
            });
        }
    }

    generateGraphFromTransitions() {
        this.transitions.forEach(transition => {
            let key = transition.state + "-" + transition.stateAfter;
            this.edges[key] = this.edges[key] ?? [];
            this.edges[key].push(
                {
                    id: (transition.state + "-" + transition.stateAfter),
                    label: (transition.input + ";" + transition.stack + ";" + transition.stackAfter),
                    source: transition.state,
                    target: transition.stateAfter
                });
        });

        // add start and finish state to nodes
        let nodesArray = this.nodes.slice();
        this.nodes = [];
        nodesArray.forEach(node => {
            if (this.finishState.includes(node.id) && node.id == this.startState && this.type !== "empty") {
                this.nodes.push({id: node.id, label: node.label, class: "finish start"});
            } else if (this.finishState.includes(node.id) && this.type !== "empty") {
                this.nodes.push({id: node.id, label: node.label, class: "finish"});
            } else if (node.id === this.startState) {
                this.nodes.push({id: node.id, label: node.label, class: "start"});
            } else {
                this.nodes.push({id: node.id, label: node.label});
            }
        });
    }

    // Probably useless?
    getStartNode() {
        return this.nodes.filter((node: GraphNodeMeta) => node.id === this.startState);
    }

    nextTransition() {
        if (this.status !== "testing") {
            return;
        }

        if (!this.traversal[this.currentStatus.step]) {
            console.log(this.isAccepted);
            graph_store.update((n) => {
                n.isAccepted = this.isAccepted;
                return n;
            });
            this.status = "idle";
            return;
        }

        let nextNode = this.traversal[this.currentStatus.step].stateAfter;
        let nextEdge = this.traversal[this.currentStatus.step].state + "-" + nextNode;

        if (this.traversal[this.currentStatus.step].stackAfter.length > 1) {
            const nextStack = this.traversal[this.currentStatus.step].stackAfter?.slice(0, -1);

            if (nextStack.length > 1) {
                for (let i = 0; i < nextStack.length; i++) {
                    this.stack.push(nextStack[i]);
                }
            }
            else {
                this.stack.push(nextStack);
            }
        } else if (this.traversal[this.currentStatus.step].stackAfter === "E") {
            this.stack.pop();
        }

        return {nextNode, nextEdge};
    }

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

        if (this.traversal[this.currentStatus.step].stackAfter === "E") {
            this.stack.push(this.traversal[this.currentStatus.step].stack);
        } else if (this.traversal[this.currentStatus.step].stackAfter !== this.traversal[this.currentStatus.step].stack) {
            this.stack.pop();
        }

        return {previousNode, previousEdge};
    }

    resetTestInput() {
        this.stack = [];
        this.traversal = [];
        this.word = [];
        this.currentStatus = {
            state: this.startState,
            input: "",
            stack: "Z",
            step: 0,
        };
    }
}