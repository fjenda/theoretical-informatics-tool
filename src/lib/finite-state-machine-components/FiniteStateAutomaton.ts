import type {GraphNodeMeta} from "../../types/GraphNodeMeta";
import type {GraphEdgeDictionary} from "../../types/GraphObject";
import type {TransitionMeta} from "../../types/TransitionMeta";
import type {AutomatonState} from "../../types/AutomatonState";
import type {GraphEdgeMeta} from "../../types/GraphEdgeMeta";
import cytoscape from "cytoscape";


export  class FiniteStateAutomaton{
    graph:  cytoscape.Core = cytoscape({});
    div: HTMLDivElement = null;
    status: string = "idle";
    nodes: GraphNodeMeta[] =  [];
    edges: GraphEdgeDictionary = {};
    transitions: TransitionMeta[] = [];
    currentStatus: AutomatonState;
    word: string[] = [];
    isAccepted: boolean = false;
    traversal: TransitionMeta[] = [];
    type: string = "DFA";
    startState: string[] = ["0"];
    finishState?: string[] = ["F"];
    correctStartState: string = "q0";
    followingID : number = 0;
    input_alphabet: string[] = [];

    constructor(nodes : GraphNodeMeta[], transitions : TransitionMeta[], startStare : string[], finishState : string[], type : string) {
        this.graph = null;
        this.nodes = nodes;
        this.transitions = transitions;
        this.startState = startStare;
        this.finishState = finishState;
        this.type = type;
    };

    getNodes(){
        return this.nodes;
    }

    getEdges(){
        return this.edges;
    }

    getTransitions(){
        return this.transitions;
    }

    addEpsilonTransition(state : string, stateLabel : string, stateAfter : string, stateAfterLable : string){
        this.transitions.push({
            state: state,
            stateLabel: stateLabel,
            input: "ε",
            stateAfter: stateAfter,
            stateAfterLabel: stateAfterLable,
        });
    }

    preprocessGraphInputDFA(): TransitionMeta[] | null{
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
                if (transition.state === state && transition.input === "ε") {
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

    preprocessGraphInputNFA(): TransitionMeta[] | null{
        let closestDeclinedPath: TransitionMeta[] | null = null;
        console.log('Pocateni stavy: ', this.startState);
        // Pro každý možný počáteční stav
        for (const startState of this.startState) {
            const queue: { state: string; index: number; path: TransitionMeta[] }[] = [
                { state: startState, index: 0, path: [] },
            ];

            while (queue.length > 0) {
                const { state, index, path } = queue.shift()!;
                const isAccepted = index === this.word.length && this.finishState.includes(state);

                if (isAccepted) {
                    console.log("Accepted");
                    this.isAccepted = true;
                    this.correctStartState = startState;
                    return path; // String is accepted
                }

                closestDeclinedPath = path;

                // Procházení přechodů na vstupním symbolu
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

                // Procházení epsilon přechodů
                for (const transition of this.transitions) {
                    if (transition.state === state && transition.input === "ε") {
                        const newPath = path.concat(transition);
                        queue.push({
                            state: transition.stateAfter,
                            index: index,
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
        return null;
    }

    preprocessGraphInput() : TransitionMeta[] | null {
        const queue: { state: string; index: number; path: TransitionMeta[] }[] = [
            { state: this.startState[0], index: 0, path: [] },
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
                if (transition.state === state && transition.input === "ε") {
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
        // console.log(node);
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
        if (node.class?.includes("start")  && this.startState.filter((startNode : string) => startNode === node.id).length === 0) {
            this.startState.push(node.id);
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
    }

    generateGraphFromTransitions(){
        let savedNodeId = "";
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
            if (this.finishState.includes(node.id) && this.startState.includes(node.id)) {
                this.nodes.push({id: node.id, label: node.label, class: "finish start"});
            }else if (this.finishState.includes(node.id)) {
                this.nodes.push({id: node.id, label: node.label, class: "finish"});
            } else if (this.startState.includes(node.id)) {
                this.nodes.push({id: node.id, label: node.label, class: "start"});
            } else {
                this.nodes.push({id: node.id, label: node.label});
            }
        });

        this.input_alphabet = this.transitions.map(transition => transition.input);
        //remove duplicates
        this.input_alphabet = this.input_alphabet.filter((value, index, self) => self.indexOf(value) === index);

    }

    nextTransition(){

        if (this.status !== "testing") {
            return;
        }

        if (!this.traversal[this.currentStatus.step]) {
            console.log(this.isAccepted);
            this.status = "idle";
            let myIsAccepted = this.isAccepted;
            return { myIsAccepted};
        }


        let  currenStatus = this.currentStatus;
        let nextNode = this.traversal[this.currentStatus.step].stateAfter;
        let nextEdge = this.traversal[this.currentStatus.step].state + "-" + nextNode;

        return {nextNode, nextEdge, currenStatus};
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
        this.traversal = [];
        this.word = [];
        this.currentStatus = {
            state: this.startState,
            input: "",
            step: 0,
        };
    }

    changeGraphStyle() {

        const isDarkMode = window.document.body.classList.contains("dark-mode");

        this.graph.style()
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