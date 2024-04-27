/*
    FiniteStateAutomaton.ts
    Class for creating finite state automaton from regular expression

    Author: Marek Krúpa
*/

//types
import type {TransitionMeta} from "../../../types/TransitionMeta";
import {FiniteStateAutomaton} from "../FiniteStateAutomaton";
import type {GraphNodeMeta} from "../../../types/GraphNodeMeta";

//classes
import {TreeNode} from "./TreeNode";


export class  RegexAutomaton{

    // properties
    finAut : FiniteStateAutomaton;
    regex : string;
    position : number;

    // constructor
    constructor(regex : string){
        this.regex = regex;
        this.position = 0;
        this.finAut = new FiniteStateAutomaton([], [], [], [], "DFA");
    };

    // Method for printing the parse tree
    printTree(node: TreeNode | null, depth: number = 0): void {
        if (node === null) {
            return;
        }

        if (node.children) {
            for (const child of node.children) {
                this.printTree(child, depth + 1);
            }
        }
    }

    //
    regexProcessFunc() : FiniteStateAutomaton | null {
        //remove . from the this.regex
        this.regex = this.regex.replace(/\./g, "");

        let tree = this.parse();

        if (tree === null) {
            return null;
        }
        //Uncomment for printing the parse tree
        // console.log("Regex Tree:");
        // this.printTree(tree);

        return this.fromTreeToAutomaton(tree);
    }

    // Method for converting parse tree to finite state automaton, recursively goes through the tree
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

        return null;
    }

    // Method for getting the next character in the regex
    peek() : string | null {
        if (this.position < this.regex.length) {
            return this.regex[this.position];
        } else {
            return null;
        }
    }

    // Method for parsing the regex to a parse tree
    parse() : TreeNode | null {
        return this.expression();
    }

    // Method for matching the character in the regex
    match(c : string) : boolean {
        if (this.peek() === c) {
            this.position++;
            return true;
        }
        return false;
    }

    // Method for checking if there are more characters in the regex
    hasMore() : boolean {
        return this.position < this.regex.length;
    }

    // Method for checking if the character is a metacharacter
    isMetaChar(c : string) : boolean {
        return c === "*";
    }

    // Method for getting the next character in the regex return character or null
    next() : string | null {
        let ch = this.peek();
        this.match(ch);

        return ch;
    }

    // Method for expression in the regex
    expression(): TreeNode | null {
        let term = this.term();
        while (this.hasMore() && this.peek() === "+") {
            this.match("+");
            let expression = this.expression();

            return new TreeNode("expression", [term, new TreeNode("+", null), expression]);
        }
        return new TreeNode("expression", [term]);
    }

    // Method for term in the regex
    term(): TreeNode | null {
        let factor = this.factor();

        while (this.hasMore() && !(this.peek() === "+") && !(this.peek() === ")")) {
            let term = this.term();

            return new TreeNode("term", [factor, term]);
        }

        return new TreeNode("term", [factor]);
    }

    // Method for factor in the regex
    factor(): TreeNode | null {
        let atom = this.atom();

        while (this.hasMore() && this.isMetaChar(this.peek())) {
            let meta = this.next();
            return new TreeNode("factor", [atom, new TreeNode(meta, null)]);
        }

        return new TreeNode("factor", [atom]);
    }

    // Method for atom in the regex
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

    // Method for character in the regex
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

    // Method for creating union of two automata in regex
    union(first : FiniteStateAutomaton, second : FiniteStateAutomaton) : FiniteStateAutomaton{
        let nodes : GraphNodeMeta[] = [];
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
        let nodes : GraphNodeMeta[] = first.getNodes();
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

    // Method for creating closure of automaton in regex
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

    // Method for creating automaton from symbol
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