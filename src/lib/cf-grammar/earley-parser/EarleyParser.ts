/*
    EarleyParser.ts
    Class containing the Earley parser implementation
    EarleyParser is a parser that can parse any context-free grammar.
    It is a chart parser that uses dynamic programming to parse the input.

    Author: Jan Fojtík
*/

import {Rule} from "./Rule";
import {ItemAction} from "./ItemAction";
import {EarleyItem} from "./EarleyItem";
import {State} from "./State";

import {TreeNode} from "./TreeNode";
import {ParserTree} from "./ParserTree";
import {Converter} from "../cfg/Converter";
import {ContextFreeGrammar} from "../cfg/ContextFreeGrammar";
import {CFGRule} from "../cfg/CFGRule";


export class EarleyParser {
    // Grammar of the parser
    grammar: Rule[] = [];

    // Starting point of the grammar
    startingPoint: string;

    // Nullable non-terminals
    nullables: string[] = [];

    // States of the chart
    states: State[] = [];

    // Variable that says if the grammar is recursive
    isRecursive: boolean = false;

    // Constructor of the EarleyParser
    constructor(startingPoint: string, grammar: Rule[]) {
        this.grammar = grammar;
        this.states[0] = new State();
        this.startingPoint = startingPoint;
    }

    // Function that adds the starting rules of the parser to the first state
    private setStartingRules() {
        // add the starting rules to the first state
        const startingRules = this.grammar.filter(rule => rule.lhs === this.startingPoint);
        startingRules.forEach(rule => {
            this.states[0].push(new EarleyItem(rule, 0, 0, ItemAction.PREDICT));
        });
    }

    // Function that checks if the given symbol is a non-terminal
    // params: symbol: string - symbol to check
    private isNonTerminal(symbol: string) {
        return this.grammar.some(rule => rule.lhs === symbol);
    }

    // Function that restarts the parser
    // It's called for every test input
    restart() {
        // remove all the states and create a new one
        this.states = [];
        this.states[0] = new State();
    }

    // Function that resets the parser
    reset() {
        // reset the parser to its initial state
        this.grammar = [];
        this.nullables = [];
        this.states = [];
        this.states[0] = new State();
    }

    // Function to find nullable rules
    private findNullables() {
        // find direct nullables
        this.nullables.push(
            ...this.grammar
                .filter((rule) => rule.rhs.length === 0)
                .map((rule) => rule.lhs),
        );

        // while the size of the nullable array changes
        let sizeBefore = 0;
        while (sizeBefore !== this.nullables.length) {
            sizeBefore = this.nullables.length;
            // find nullables on the right side
            this.grammar.filter((rule) => {
                // if the production is made of nullables
                if (rule.rhs.every((symbol) => this.nullables.some((nullable) => nullable === symbol),)) {
                    if (!this.nullables.includes(rule.lhs)) this.nullables.push(rule.lhs);
                }
            });
        }

        // remove duplicates
        this.nullables = this.nullables.filter((value, index, self) => self.indexOf(value) === index);
    }

    // Function that parses the given input
    // params: input: string - input to parse
    //
    // returns: {accepted: boolean, length: number, derivation: {rule: string, result: string}[][]} |
    //          {accepted: boolean, length: number, derivation: {rule: string, result: string}[]}
    //      accepted: boolean - if the input is accepted
    //      length: number - number of derivations
    //
    //   if length is 1:
    //      derivation: {rule: string, result: string}[] - derivation of the input
    //   if length is > 1:
    //      derivation: {rule: string, result: string}[][] - derivations of the input
    parse(input: string) {
        // set starter rules
        this.setStartingRules();

        // initialize nullable rules
        this.findNullables();

        // check if grammar is recursive
        this.isRecursive = this.isGrammarRecursive();

        // outer loop
        for (let i = 0; i < this.states.length; i++) {
            // inner loop
            for (let j = 0; j < this.states[i].size(); j++) {
                // get the item
                const item = this.states[i].get(j);

                // if the dot is at the end of the rule
                if (item.dot === item.rule.rhs.length) {
                    // complete the item
                    this.complete(this.states[i], i, j);
                } else {
                    // get the symbol after the dot
                    const symbol = item.rule.rhs[item.dot];

                    if (this.isNonTerminal(symbol)) { // if the symbol is a non-terminal
                        // predict the next non-terminal symbol
                        this.predict(symbol, this.states[i], item.start, i, j);
                    } else { // if the symbol is a terminal
                        if (i < input.length) {
                            // scan the next terminal symbol
                            this.scan(input[i], this.states[i], j, i);
                        }
                    }
                }
            }
        }

        // make a copy of the last state and check if it contains the starting rule
        let lastState = new State();
        this.states[this.states.length - 1].items.forEach(item => lastState.push(item));

        // find the items that match
        const lastItems = lastState.items.filter(item => item.rule.lhs === this.startingPoint &&
            item.start === 0 &&
            item.dot === item.rule.rhs.length);

        // create the parser tree
        if (lastItems.length > 0) {
            let trees = lastItems.map((item) => {
                let root: TreeNode = new TreeNode(item.rule.lhs);
                root.setItem(item);

                return this.createTree(root);
            });


            trees.forEach((tree, index) => {
                if (tree) {
                    console.log(`\nParser tree ${index}`);
                    tree.print();
                }
            });

            // if there are more trees we return all of them
            if (trees.length > 1) {
                let derivations = trees.map(tree => {
                    if (tree === undefined) return;

                    const der = tree.getDerivation(this);
                    if (der[der.length - 1].result !== input) return;

                    return der;
                }).filter(der => der !== undefined);

                if (derivations.length === 0) return { accepted: false, length: -1, derivation: [] };
                if (derivations.length === 1) return { accepted: true, length: 1, derivation: derivations[0] };

                // remove duplicates
                derivations = this.removeDuplicateDerivations(derivations);
                if (derivations.length === 1) return { accepted: true, length: 1, derivation: derivations[0] };
                const firstDerivations = derivations.splice(0, 4);
                return { accepted: true, length: firstDerivations.length, derivation: firstDerivations };
            }

            // if there is only one tree we return it
            let derivation: { rule: string; result: string }[] = trees[0].getDerivation(this);
            let acc = derivation[derivation.length - 1].result === input;
            return { accepted: acc, length: 1, derivation: derivation };
        }

        // if the input is not accepted
        return { accepted: false, length: -1, derivation: [] };
    }

    // Function that creates the parser tree from the given root and input
    // @param: root: TreeNode   - root of the tree (the starting rule)
    //
    // returns: ParserTree      - parser tree
    private createTree(root: TreeNode) {
        let tree = new ParserTree(root);
        let stack = [root];

        while (stack.length > 0) {
            let node = stack.pop();

            if (!node) continue;

            // check if the node is a leaf
            if (node.item.rule.rhs.length === 0) {
                let child = new TreeNode("");
                node.addChild(child);
            } else {
                let stI = 0;

                // check every symbol of the rules rhs
                for (let rhs of node.item.rule.rhs) {

                    // if the symbol is not a non-terminal we add it to the tree
                    if (!this.isNonTerminal(rhs)) {
                        let child = new TreeNode(rhs);
                        node.addChild(child);
                        continue;
                    }

                    // check if there's a symbol
                    if (node.item.from[stI] === undefined) {
                        let child = new TreeNode(rhs);
                        node.addChild(child);
                        continue;
                    }

                    // get the start and end of the item
                    let start = node.item.from[stI][0];
                    let end = node.item.from[stI][1];
                    let item = this.states[start].items[end];

                    // create the child node, set its item and add it to the tree
                    let child = new TreeNode(item.rule.lhs);
                    child.setItem(item);
                    node.addChild(child);
                    stack.push(child);
                    stI++;
                }
            }
        }

        // return the tree
        return tree;
    }

    // Function that predicts the next non-terminal symbol
    // params: symbol: string       - symbol to predict
    //         state: State         - current state
    //         start: number        - start index
    //         stateIndex: number   - index of the state
    //         itemIndex: number    - index of the item
    private predict(symbol: string, state: State, start: number, stateIndex: number, itemIndex: number) {
        // get the rules that have the symbol on the left side
        const rules = this.grammar.filter((rule) => rule.lhs === symbol);

        // loop through the rules and add them to the state
        rules.forEach((rule) => {
            state.push(new EarleyItem(rule, 0, stateIndex, ItemAction.PREDICT));

            // magical completion
            // happens when the symbol is nullable
            if (this.nullables.includes(rule.lhs)) {
                // create a new item with the dot moved one position to the right
                let newItem = new EarleyItem(state.get(itemIndex).rule, state.get(itemIndex).dot + 1, state.get(itemIndex).start, ItemAction.COMPLETE);
                state.push(newItem);
            }
        });

        // remove duplicates, or we will be stuck in an infinite loop
        state.items = state.items.filter((item, index) => {
            if (this.isRecursive) return state.items.findIndex((i) => i.equalsSimple(item)) === index;
            else return state.items.findIndex((i) => i.equals(item)) === index;
        });
    }

    // Function that scans the next terminal symbol
    // params: input: string        - input to scan
    //         state: State         - current state
    //         index: number        - index of the item
    //         stateIndex: number   - index of the state
    private scan(input: string, state: State, index: number, stateIndex: number) {
        // check if the input matches the symbol after the dot
        if (input === state.get(index).rule.rhs[state.get(index).dot]) {
            // we copy the item and move the dot one position to the right
            let item = new EarleyItem(
                state.get(index).rule,
                state.get(index).dot + 1,
                state.get(index).start,
                ItemAction.SCAN,
                state.get(index).from,
            );

            // push the item into the next state
            this.states[stateIndex + 1] = this.states[stateIndex + 1] || new State();
            this.states[stateIndex + 1].push(item);
        }
    }

    // Function that completes the items
    // params: state: State         - current state
    //         stateIndex: number   - index of the state
    //         itemIndex: number    - index of the item
    private complete(state: State, stateIndex: number, itemIndex: number) {
        // get the start state set of the current item
        let stateSet = this.states[state.get(itemIndex).start];

        // get the rules that have the symbol on the right side of the dot
        const rules = stateSet.items.filter(
            (item) => item.rule.rhs[item.dot] === state.get(itemIndex).rule.lhs,
        );


        // loop through the rules and add them to the state with the dot moved one position to the right
        rules.forEach((rule) => {
            let f = [...rule.from];
            f.push([stateIndex, itemIndex]);
            let item = new EarleyItem(rule.rule, rule.dot + 1, rule.start, ItemAction.COMPLETE, f);

            // if item is already completed we don't need to add it again
            if (this.isRecursive) {
                if (state.items.some((i) => i.equalsSimple(item))) {
                    return;
                }
            } else {
                if (state.items.some((i) => i.equals(item))) {
                    return;
                }
            }

            // push the completed item into the current state
            state.push(item);
        });
    }

    // Function that sets the grammar rules
    // params: rules: Rule[] - rules to set
    setRules(rules: Rule[]) {
        this.grammar = rules;
    }

    // Function that removes duplicate derivations
    // params: derivations: {rule: string, result: string}[][] - derivations to remove duplicates from
    //
    // returns: {rule: string, result: string}[][] - derivations without duplicates
    private removeDuplicateDerivations(derivations: {rule: string, result: string}[][]): {rule: string, result: string}[][] {
        let newDerivations: {rule: string, result: string}[][] = [];
        derivations.forEach(der => {
            let found = false;
            newDerivations.forEach(newDer => {
                if (der.length !== newDer.length) return;
                let equal = true;
                for (let i = 0; i < der.length; i++) {
                    if (der[i].rule !== newDer[i].rule || der[i].result !== newDer[i].result) {
                        equal = false;
                        break;
                    }
                }
                if (equal) found = true;
            });
            if (!found) newDerivations.push(der);
        });
        return newDerivations;
    }

    private isGrammarRecursive(): boolean {
        // is directly recursive
        let r = false;
        this.grammar.forEach(rule => {
            if (rule.lhs === rule.rhs[0]) r = true;
        });

        if (r) return true;

        const nonTerminals = this.grammar.map(rule => rule.lhs).filter((value, index, self) => self.indexOf(value) === index);
        const terminals = this.grammar.map(rule => rule.rhs).flat().filter(symbol => !nonTerminals.includes(symbol)).filter((value, index, self) => self.indexOf(value) === index);
        let cfgRules = this.grammar.map(rule => new CFGRule(rule.lhs, [rule.rhs.join("")]));
        let g = new ContextFreeGrammar(nonTerminals, terminals, cfgRules);
        g.removeRule(0);
        let c = new Converter(g);
        c.renameNonTerminals();
        return c.isRecursive();
    }
}