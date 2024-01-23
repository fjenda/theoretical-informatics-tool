import type {GraphNodeMeta} from "../../types/GraphNodeMeta";
import type {GraphEdgeDictionary} from "../../types/GraphObject";
import type {TransitionMeta} from "../../types/TransitionMeta";
import type {AutomatonState} from "../../types/AutomatonState";
import type {GraphEdgeMeta} from "../../types/GraphEdgeMeta";
import {graph_store} from "../../stores/graphInitStore";

export  class FiniteStateAutomaton{
    graph: null;
    div: HTMLDivElement = null;
    status: string = "idle";
    nodes: GraphNodeMeta[] =  [];
    edges: GraphEdgeDictionary = {};
    transitions: TransitionMeta[] = [];
    stack: string[] [];
    currentStatus: AutomatonState;
    word: string[] = [];
    isAccepted: boolean = false;
    traversal: TransitionMeta[] = [];
    type: string = "empty";
    startState: string = "q0";
    finishState?: string[] = ["qF"];

    constructor() { };

    preprocessGraphInput() : TransitionMeta[] | null {
        const queue: { state: string; index: number; path: TransitionMeta[] }[] = [
            { state: this.startState, index: 0, path: [] },
        ];

        let closestDeclinedPath: TransitionMeta[] | null = null;
        while (queue.length > 0) {
            const { state, index, path } = queue.shift()!;

            const isAccepted =
                index === this.word.length &&
                this.finishState.includes(state);

            if (isAccepted) {
                console.log("Accepted");
                this.isAccepted = true;
                return path; // String is accepted
            }
            closestDeclinedPath = path;
            for (const transition of this.transitions) {
                if (transition.state === state && transition.input === this.word[index]) {
                    const newPath = path.concat(transition);
                    queue.push({
                        state: transition.stateAfter,
                        index: index + 1,
                        path: newPath,
                    });
                }
            }

            //epsilon eges
            for (const transition of this.transitions) {
                if (transition.state === state && transition.input === "E") {
                    const newPath = path.concat(transition);
                    queue.push({
                        state: transition.stateAfter,
                        index: index,
                        path: newPath,
                    });
                }
            }
        }


        console.log("declined");
        this.isAccepted = false;
        if (closestDeclinedPath) {
            return closestDeclinedPath;
        }

        return null;
    }

    addNode(node : GraphNodeMeta) {
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

    addEdge(edge : GraphEdgeMeta){
        //if graphEdges already has this edge
        if (this.edges[edge.id]) {
            //if graphEdges has this edge but with different label
            if (this.edges[edge.id].filter((graphEdge : GraphEdgeMeta) => graphEdge.label == edge.label).length == 0) {
                this.edges[edge.id].push(edge);
            }
        } else {
            this.edges[edge.id] = [edge];
        }

        if (this.graph.$id(edge.id).length != 0) {
            let tmpEdge = this.graph.$id(edge.id);

            if (tmpEdge.data("label") === edge.label) {
                return;
            }

            let combinedLabel = tmpEdge.data("label") + ", " + edge.label;
            this.graph.$id(edge.id).data("label", combinedLabel);
        } else {
            this.graph.add({
                group: "edges",
                data: { id: edge.id, label: edge.label, source: edge.source, target: edge.target }
            });
        }

        // this.transitions.push({
        //     state: edge.source,
        //     input: edge.label,
        //     stateAfter: edge.target,
        // });
    }

    generateGraphFromTransitions(){
        this.transitions.forEach(transition => {
            let key = transition.state + "-" + transition.stateAfter;
            this.edges[key] = this.edges[key] ?? [];
            this.edges[key].push(
                {
                    id: (transition.state + "-" + transition.stateAfter),
                    label: (transition.input),
                    source: transition.state,
                    target: transition.stateAfter
                });
        });
        //console.log(graphObject.edges);

        // add start and finish state to nodes
        let nodesArray = this.nodes.slice();
        this.nodes = [];
        nodesArray.forEach(node => {
            if (this.finishState.includes(node.id)) {
                this.nodes.push({id: node.id, label: node.label, class: "finish"});
            } else if (node.id === this.startState) {
                this.nodes.push({id: node.id, label: node.label, class: "start"});
            } else {
                this.nodes.push({id: node.id, label: node.label});
            }
        });
    }

    nextTransition(){
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

        return {nextNode, nextEdge};
    }

    previousTransition(){
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

    resetTestInput(){
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