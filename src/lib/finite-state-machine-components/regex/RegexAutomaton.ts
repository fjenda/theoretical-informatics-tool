import {graph_store} from "../../../stores/graphInitStore";
import type {TransitionMeta} from "../../../types/TransitionMeta";
import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
import {TreeNode} from "./TreeNode";

export class  RegexAutomaton{

    finAut : FiniteStateAutomaton;
    regex : string;
    position : number;
    constructor(regex : string){
        this.regex = regex;
        this.position = 0;
        this.finAut = new FiniteStateAutomaton([], [], [], [], [], "DFA");
    };

    getAlphabet() : string[] {
        let alphabet = this.regex.split("");
        return alphabet;
    }

    printTree(node: TreeNode | null, depth: number = 0): void {
        if (node === null) {
            console.log("".padStart(depth * 4) + "null");
            return;
        }

        console.log("".padStart(depth * 4) + node.label);

        if (node.children) {
            for (const child of node.children) {
                this.printTree(child, depth + 1);
            }
        }
    }



    regexProcessFunc() : FiniteStateAutomaton | null {
        const queue: { state: string; index: number; path: TransitionMeta[] }[] = [
            { state: this.finAut.startState, index: 0, path: [] },
        ];

        //remove . from the this.regex
        this.regex = this.regex.replace(/\./g, "");

        let alphabet = this.regex.split("");

        let tree = this.parse();

        if (tree === null) {
            return null;
        }
        console.log("Regex Tree full:", tree);
        console.log("Regex Tree:");
        this.printTree(tree);

        // let result = this.fromTreeToAutomaton(tree);
        // console.log("Result:", result);
        return this.fromTreeToAutomaton(tree);
    }

    fromTreeToAutomaton(root: TreeNode | null) : FiniteStateAutomaton | null {
        if (root.label === "expression") {
            let term = this.fromTreeToAutomaton(root.children[0]);
            if (root.children.length === 3) {
                return this.union(term, this.fromTreeToAutomaton(root.children[2]));
            }
            return term;
        }

        if (root.label === "term") {
            let factor = this.fromTreeToAutomaton(root.children[0]);
            if (root.children.length === 2) {
                return this.concat(factor, this.fromTreeToAutomaton(root.children[1]));
            }
            return factor;
        }

        if (root.label === "factor") {
            let atom = this.fromTreeToAutomaton(root.children[0]);
            if (root.children.length === 2) {
                if (root.children[1].label === "*") {
                    return this.closure(atom);
                }
                if (root.children[1].label === "+") {
                    return this.oneOrMore(atom);
                }
                if (root.children[1].label === "?") {
                    return this.zeroOrOne(atom);
                }
            }
            return atom;
        }

        if (root.label === "atom") {
            if (root.children.length === 3) {
                return this.fromTreeToAutomaton(root.children[1]);
            }
            return this.fromTreeToAutomaton(root.children[0]);
        }

        if (root.label === "char") {
            if(root.children.length === 2){
                return this.fromSymbol(root.children[1].label);
            }
            return this.fromSymbol(root.children[0].label);
        }

        console.log("Jsem tady dokoncuji prevod");
        return null;
    }

    peek() : string | null {
        if (this.position < this.regex.length) {
            return this.regex[this.position];
        } else {
            return null;
        }
    }

    parse() : TreeNode | null {

        return this.expression();
    }

    match(c : string) : boolean {
        if (this.peek() === c) {
            this.position++;
            return true;
        }
        return false;
    }

    hasMore() : boolean {
        return this.position < this.regex.length;
    }

    isMetaChar(c : string) : boolean {
        // return c === "*" || c === "+" || c === "?";
        return c === "*";
    }

    next() : string | null {
        let ch = this.peek();
        this.match(ch);

        return ch;
    }

    expression(): TreeNode | null {
        let term = this.term();
        while (this.hasMore() && this.peek() === "+") {
            this.match("+");
            let expression = this.expression();

            // if (expression === null) {
            //     return null;
            // }

            // term = new TreeNode("expression", [term, new TreeNode("|", null), expression]);
            return new TreeNode("expression", [term, new TreeNode("+", null), expression]);
        }
        return new TreeNode("expression", [term]);
    }

    term(): TreeNode | null {
        let factor = this.factor();

        while (this.hasMore() && !(this.peek() === "+") && !(this.peek() === ")")) {
            let term = this.term();

            return new TreeNode("term", [factor, term]);
        }

        return new TreeNode("term", [factor]);
    }

    factor(): TreeNode | null {
        let atom = this.atom();

        while (this.hasMore() && this.isMetaChar(this.peek())) {
            let meta = this.next();
            return new TreeNode("factor", [atom, new TreeNode(meta, null)]);
        }

        return new TreeNode("factor", [atom]);
    }

    atom(): TreeNode | null {
        if (this.peek() === "(") {
            this.match("(");
            let expression = this.expression();
            this.match(")");

            return new TreeNode("atom", [new TreeNode("(", null), expression, new TreeNode(")", null)]);
        }
        let ch = this.char();
        return new TreeNode("atom", [ch]);
    }

    char(): TreeNode | null {
        if (this.isMetaChar(this.peek())) {
            return null;
        }

        if (this.peek() === "\\") {
            this.match("\\");
            let ch = this.next();
            return new TreeNode("char", [new TreeNode("\\", null), new TreeNode(ch, null)]);
        }

        let ch = this.next();
        return new TreeNode("char", [new TreeNode(ch, null)]);
    }

    union(first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton{
        let nodes : GrapNodeMeta[] = [];
        let transitions : TransitionMeta[] = [];

        let startNode = {id: "0", label: "q0", class: "start"};

        nodes.push(startNode);

        let nodesFirst = first.getNodes();

        let numberShift = nodes.length;

        nodesFirst.forEach((node : GraphNodeMeta) => {
            let newId = (numberShift + parseInt(node.id)).toString();
            nodes.push({id: newId, label: "q" + newId});
        });

        let firstStateOfFirst = nodes[1].id;

        let transitionsFirst = first.getTransitions();
        transitionsFirst.forEach((transition : TransitionMeta) => {
            let newState = (parseInt(transition.state) + numberShift).toString();
            let newStateAfter = (parseInt(transition.stateAfter) + numberShift).toString();
            transitions.push({
                state:  newState,
                stateLabel: "q" + newState,
                input: transition.input,
                stateAfter: newStateAfter,
                stateAfterLabel: "q" + newStateAfter
            });
        });


        let lastStateOfFirst = nodes[nodes.length - 1].id;
        let firstStateOfSecond = (parseInt(lastStateOfFirst) + 1).toString();
        numberShift = nodes.length;
        let nodesSecond = second.getNodes();
        nodesSecond.forEach((node : GraphNodeMeta) => {
            let newId = (parseInt(node.id) + numberShift).toString();
            nodes.push({id: newId, label: "q" + newId});
        });

        let transitionsSecond = second.getTransitions();
        transitionsSecond.forEach((transition : TransitionMeta) => {
            let newState = (parseInt(transition.state) + numberShift).toString();
            let newStateAfter = (parseInt(transition.stateAfter) + numberShift).toString();
            transitions.push({
                state:  newState,
                stateLabel: "q" + newState,
                input: transition.input,
                stateAfter: newStateAfter,
                stateAfterLabel: "q" + newStateAfter
            });
        });

        let lastStateOfSecond = nodes[nodes.length - 1].id;
        let end = {id: (parseInt(lastStateOfSecond) + 1).toString(), label: "q" + (parseInt(lastStateOfSecond) + 1).toString(), class: "finish"};
        nodes.push(end);

        transitions.push({
            state:  "0",
            stateLabel: "q0",
            input: "ε",
            stateAfter: firstStateOfFirst,
            stateAfterLabel: "q" + firstStateOfFirst
        });

        transitions.push({
            state:  "0",
            stateLabel: "q0",
            input: "ε",
            stateAfter: firstStateOfSecond,
            stateAfterLabel: "q" + firstStateOfSecond
        });

        let foundEpsilonToEnd = false;
        transitions.forEach((transition : TransitionMeta) => {
           if (transition.input === "ε"){
               if (transition.state === lastStateOfFirst){
                   if (transition.stateAfter === end.id){
                       foundEpsilonToEnd = true;
                   }
               }
           }
        });
        if (!foundEpsilonToEnd){
            transitions.push({
                state:  lastStateOfFirst,
                stateLabel: "q" + lastStateOfFirst,
                input: "ε",
                stateAfter: end.id,
                stateAfterLabel: "q" + end.id
            });
        }

        foundEpsilonToEnd = false;
        transitions.forEach((transition : TransitionMeta) => {
            if (transition.input === "ε"){
                if (transition.state === lastStateOfSecond){
                    if (transition.stateAfter === end.id){
                        foundEpsilonToEnd = true;
                    }
                }
            }
        });

        if (!foundEpsilonToEnd){
            transitions.push({
                state:  lastStateOfSecond,
                stateLabel: "q" + lastStateOfSecond,
                input: "ε",
                stateAfter: end.id,
                stateAfterLabel: "q" + end.id
            });
        }

        return new FiniteStateAutomaton(nodes, transitions, [startNode.id], [end.id], "NFA");
    }

    concat(first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton{
        let nodes : GrapNodeMeta[] = first.getNodes();
        let transitions : TransitionMeta[] = first.getTransitions();

        let lastStateOfFirst = nodes[nodes.length - 1].id;
        nodes[lastStateOfFirst].class = "";

        let firstStateOfSecond = (parseInt(lastStateOfFirst) + 1).toString();

        let nodesSecond = second.getNodes();
        let numberShift = nodes.length;

        nodesSecond.forEach((node : GraphNodeMeta) => {
            let newId = (parseInt(node.id) + numberShift).toString();

            if (node.class === "finish"){
                nodes.push({id: newId, label: "q" + newId, class: "finish"});
            } else {
                nodes.push({id: newId, label: "q" + newId});
            }
        });

        let transitionsSecond = second.getTransitions();
        transitionsSecond.forEach((transition : TransitionMeta) => {
            let newState = (parseInt(transition.state) + numberShift).toString();
            let newStateAfter = (parseInt(transition.stateAfter) + numberShift).toString();
            transitions.push({
                state:  newState,
                stateLabel: "q" + newState,
                input: transition.input,
                stateAfter: newStateAfter,
                stateAfterLabel: "q" + newStateAfter
            });
        });

        let foundEpsilonToEnd = false;
        transitions.forEach((transition : TransitionMeta) => {
            if (transition.input === "ε"){
                if (transition.state === lastStateOfFirst){
                    if (transition.stateAfter === firstStateOfSecond){
                        foundEpsilonToEnd = true;
                    }
                }
            }
        });
        if (!foundEpsilonToEnd){
            transitions.push({
                state:  lastStateOfFirst,
                stateLabel: "q" + lastStateOfFirst,
                input: "ε",
                stateAfter: firstStateOfSecond,
                stateAfterLabel: "q" + firstStateOfSecond
            });
        }


        return new FiniteStateAutomaton(nodes, transitions, [nodes[0].id], [nodes[nodes.length - 1].id], "NFA");
    }

    closure(automaton : FiniteStateAutomaton) : FiniteStateAutomaton{
        let nodes : GraphNodeMeta[] = [];
        let transitions : TransitionMeta[] = [];

        let startNode = {id: "0", label: "q0", class: "start"};
        nodes.push(startNode);

        let automatonNodes = automaton.getNodes();

        automatonNodes.forEach((node : GraphNodeMeta) => {
            let newID = (parseInt(node.id) + 1).toString();
           nodes.push({id: newID, label: "q" + newID});
        });

        let automatonTransitions = automaton.getTransitions();
        automatonTransitions.forEach((transition : TransitionMeta) => {
            let newState = (parseInt(transition.state) + 1).toString();
            let newStateAfter = (parseInt(transition.stateAfter) + 1).toString();
            transitions.push({
                state:  newState,
                stateLabel: "q" + newState,
                input: transition.input,
                stateAfter: newStateAfter,
                stateAfterLabel: "q" + newStateAfter
            });
        });

        let firstState = nodes[1].id;
        let lastState = nodes[nodes.length - 1].id;

        let endNode = {id: (parseInt(lastState) + 1).toString(), label: "q" + (parseInt(lastState) + 1).toString(), class: "finish"};
        nodes.push(endNode);

        transitions.push({
            state:  "0",
            stateLabel: "q0",
            input: "ε",
            stateAfter: firstState,
            stateAfterLabel: "q" + firstState
        });

        transitions.push({
            state:  "0",
            stateLabel: "q0",
            input: "ε",
            stateAfter:  endNode.id,
            stateAfterLabel: "q" +  endNode.id
        });

        let foundEpsilonToEnd = false;
        transitions.forEach((transition : TransitionMeta) => {
            if (transition.input === "ε"){
                if (transition.state === lastState){
                    if (transition.stateAfter === firstState){
                        foundEpsilonToEnd = true;
                    }
                }
            }
        });
        if (!foundEpsilonToEnd){
            transitions.push({
                state:  lastState,
                stateLabel: "q" + lastState,
                input: "ε",
                stateAfter: firstState,
                stateAfterLabel: "q" + firstState
            });
        }

        transitions.push({
            state:  lastState,
            stateLabel: "q" + lastState,
            input: "ε",
            stateAfter: endNode.id,
            stateAfterLabel: "q" + endNode.id
        });

        return new FiniteStateAutomaton(nodes, transitions, [startNode.id], [endNode.id], "NFA");
    }

    oneOrMore(automaton : FiniteStateAutomaton) : FiniteStateAutomaton{
        let nodes : GraphNodeMeta[] = [];
        let transitions : TransitionMeta[] = [];

        let startNode = {id: "0", label: "q0", class: "start"};
        nodes.push(startNode);

        let automatonNodes = automaton.getNodes();
        automatonNodes.forEach((node : GraphNodeMeta) => {
            let newID = (parseInt(node.id) + 1).toString();
            nodes.push({id: newID, label: "q" + newID});
        });

        let automatonTransitions = automaton.getTransitions();
        automatonTransitions.forEach((transition : TransitionMeta) => {
            let newState = (parseInt(transition.state) + 1).toString();
            let newStateAfter = (parseInt(transition.stateAfter) + 1).toString();
            transitions.push({
                state:  newState,
                stateLabel: "q" + newState,
                input: transition.input,
                stateAfter: newStateAfter,
                stateAfterLabel: "q" + newStateAfter
            });
        });

        let firstState = nodes[1].id;
        let lastState = nodes[nodes.length - 1].id;

        let endNode = {id: (parseInt(lastState) + 1).toString(), label: "q" + (parseInt(lastState) + 1).toString(), class: "finish"};
        nodes.push(endNode);

        transitions.push({
            state:  "0",
            stateLabel: "q0",
            input: "ε",
            stateAfter: firstState,
            stateAfterLabel: "q" + firstState
        });

        let foundEpsilonToEnd = false;
        transitions.forEach((transition : TransitionMeta) => {
            if (transition.input === "ε"){
                if (transition.state === lastState){
                    if (transition.stateAfter === firstState){
                        foundEpsilonToEnd = true;
                    }
                }
            }
        });

        if (!foundEpsilonToEnd){
            transitions.push({
                state:  lastState,
                stateLabel: "q" + lastState,
                input: "ε",
                stateAfter: firstState,
                stateAfterLabel: "q" + firstState
            });
        }

        transitions.push({
            state:  lastState,
            stateLabel: "q" + lastState,
            input: "ε",
            stateAfter: endNode.id,
            stateAfterLabel: "q" + endNode.id
        });

        return new FiniteStateAutomaton(nodes, transitions, [startNode.id], [endNode.id], "NFA");
    }

    zeroOrOne(automaton : FiniteStateAutomaton) : FiniteStateAutomaton{
        let nodes : GraphNodeMeta[] = [];
        let transitions : TransitionMeta[] = [];

        let startNode = {id: "0", label: "q0", class: "start"};
        nodes.push(startNode);

        let automatonNodes = automaton.getNodes();
        automatonNodes.forEach((node : GraphNodeMeta) => {
            let newID = (parseInt(node.id) + 1).toString();
            nodes.push({id: newID, label: "q" + newID});
        });

        let automatonTransitions = automaton.getTransitions();
        automatonTransitions.forEach((transition : TransitionMeta) => {
            let newState = (parseInt(transition.state) + 1).toString();
            let newStateAfter = (parseInt(transition.stateAfter) + 1).toString();
            transitions.push({
                state:  newState,
                stateLabel: "q" + newState,
                input: transition.input,
                stateAfter: newStateAfter,
                stateAfterLabel: "q" + newStateAfter
            });
        });

        let firstState = nodes[1].id;
        let lastState = nodes[nodes.length - 1].id;

        let endNode = {id: (parseInt(lastState) + 1).toString(), label: "q" + (parseInt(lastState) + 1).toString(), class: "finish"};
        nodes.push(endNode);

        transitions.push({
            state:  "0",
            stateLabel: "q0",
            input: "ε",
            stateAfter: firstState,
            stateAfterLabel: "q" + firstState
        });

        transitions.push({
            state:  "0",
            stateLabel: "q0",
            input: "ε",
            stateAfter:  endNode.id,
            stateAfterLabel: "q" +  endNode.id
        });

        let foundEpsilonToEnd = false;
        transitions.forEach((transition : TransitionMeta) => {
            if (transition.input === "ε"){
                if (transition.state === lastState){
                    if (transition.stateAfter === endNode.id){
                        foundEpsilonToEnd = true;
                    }
                }
            }
        });

        if (!foundEpsilonToEnd){
            transitions.push({
                state:  lastState,
                stateLabel: "q" + lastState,
                input: "ε",
                stateAfter: endNode.id,
                stateAfterLabel: "q" + endNode.id
            });
        }

        return new FiniteStateAutomaton(nodes, transitions, [startNode.id], [endNode.id], "NFA");
    }

    fromSymbol(edgeLabel : string) : FiniteStateAutomaton{
        let nodes : GraphNodeMeta[] = [];
        let transitions : TransitionMeta[] = [];

        let startNode = {id: "0", label: "q0", class: "start"};
        let endNode = {id: "1", label: "q1", class: "finish"};

        nodes.push(startNode);
        nodes.push(endNode);

        transitions.push({
            state: "0",
            stateLabel: "q0",
            input: edgeLabel,
            stateAfter: "1",
            stateAfterLabel: "q1"
        });

        return new FiniteStateAutomaton(nodes, transitions, [startNode.id], [endNode.id], "DFA");
    }





}