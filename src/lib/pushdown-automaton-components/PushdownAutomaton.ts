import type {GraphNodeMeta} from "../../types/GraphNodeMeta";
import type {GraphEdgeDictionary} from "../../types/GraphObject";
import type {AutomatonState} from "../../types/AutomatonState";
import type {GraphEdgeMeta} from "../../types/GraphEdgeMeta";
import type {TransitionType} from "../../types/pda-cfg/TransitionType";

export class PushdownAutomaton {
    graph = null;
    div: HTMLDivElement = null;
    status: string;
    nodes: GraphNodeMeta[] = [];
    edges: GraphEdgeDictionary = {};
    transitions: TransitionType[] = [];
    stack: string[] = [];
    currentStatus: AutomatonState;
    word: string[] = [];
    isAccepted: boolean = null;
    traversal: TransitionType[] = [];
    type: string = "empty";
    startState: string = "q0";
    finalStates?: string[] = ["qF"];
    stackBottom: string = "Z";

    constructor() { };

    process() : TransitionType[] | null {
        const queue: { state: string; stack: string[]; index: number; path: TransitionType[] }[] = [
            { state: this.startState, stack: [this.stackBottom], index: 0 , path: []}
        ];

        const visitedConfigurations: Set<string> = new Set();
        let closestDeclinedPath: TransitionType[] | null = null;

        while (queue.length > 0) {
            const { state, stack, index, path } = queue.shift()!;
            const configurationKey = `${state},${stack.join('')},${index}`;

            if (visitedConfigurations.has(configurationKey)) {
                continue;
            }
            visitedConfigurations.add(configurationKey);

            switch (this.type) {
                case "both": {  // if PA accepts by empty stack, empty word and finish state
                    if ((index === this.word.length || this.word.length === 0) && stack.length === 0 && (this.finalStates).includes(state)) {
                        // console.log("accepted");
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "empty": { // if PA accepts by empty stack and empty word
                    if ((index === this.word.length || this.word.length === 0) && stack.length === 0) {
                        // console.log("accepted");
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                    break;
                }

                case "final": { // if PA accepts by empty word and finish state
                    if ((this.finalStates).includes(state) && (index === this.word.length || this.word.length === 0)) {
                        // console.log("accepted");
                        this.isAccepted = true;
                        return path; // String is accepted
                    }
                }
            }

            closestDeclinedPath = path;
            for (const transition of this.transitions) {
                if (transition.state === state && (transition.input === this.word[index] || transition.input === "ε")) {
                    const stackTop = stack[0];

                    if (stackTop === transition.stack) {
                        const newPath = path.concat(transition);
                        let newStack = stack.slice();
                        if (transition.stackAfter[0] === "ε") {
                            newStack.shift();
                        } else {
                            newStack.shift();
                            newStack.splice(0, 0, ...transition.stackAfter);
                        }

                        // console.log(`pushing ${transition.stateAfter} with stack ${newStack.join('')}`)
                        queue.push({
                            state: transition.stateAfter,
                            stack: newStack,
                            index: index + (transition.input === "ε" ? 0 : 1),
                            path: newPath,
                        });
                    }
                }
            }
        }

        // console.log("declined");
        this.isAccepted = false;
        if (closestDeclinedPath) {
            return closestDeclinedPath;
        }
        return null; // string is not accepted
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
        if (node.class?.includes("finish") && this.finalStates.filter((finishNode : string) => finishNode === node.id).length === 0) {
            this.finalStates.push(node.id);
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
        this.resetGraph();

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
            if (this.finalStates.includes(node.id) && node.id == this.startState && this.type !== "empty") {
                this.nodes.push({id: node.id, label: node.label, class: "finish start"});
            } else if (this.finalStates.includes(node.id) && this.type !== "empty") {
                this.nodes.push({id: node.id, label: node.label, class: "finish"});
            } else if (node.id === this.startState) {
                this.nodes.push({id: node.id, label: node.label, class: "start"});
            } else {
                this.nodes.push({id: node.id, label: node.label});
            }
        });
    }

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

        if (this.traversal[this.currentStatus.step].stackAfter[0] === "ε") {
            this.stack.pop();
        } else {
            // const nextStack = this.traversal[this.currentStatus.step].stackAfter?.slice(0, -1);
            const nextStack = this.traversal[this.currentStatus.step].stackAfter;
            this.stack.pop();

            if (nextStack.length > 1) {
                for (let i = nextStack.length - 1; i >= 0; i--) {
                    this.stack.push(nextStack[i]);
                }
            }
            else {
                this.stack.push(...nextStack);
            }
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

        let currentTraversal = this.traversal[this.currentStatus.step];

        // TODO: For CF grammars the stack needs to be redone, theres not always E
        if (currentTraversal.stackAfter[0] === "ε") {
            this.stack.push(this.traversal[this.currentStatus.step].stack);
        } else if (currentTraversal.stackAfter[0] !== currentTraversal.stack[0]) {
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
            stack: this.stackBottom,
            step: 0,
        };
    }

    resetGraph() {
        this.graph.elements().remove();
    }

    setStackBottom(char: string) {
        this.stack = [char];
    }
}