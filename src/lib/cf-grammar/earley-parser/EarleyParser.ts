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


export class EarleyParser {
    // Grammar of the parser
    grammar: Rule[] = [];

    // Starting point of the grammar
    startingPoint: string;

    // Nullable non-terminals
    nullables: string[] = [];

    // States of the chart
    states: State[] = [];

    //
    reversedStates: State[] = [];

    constructor(startingPoint: string, grammar: Rule[]) {
        this.grammar = grammar;
        this.states[0] = new State();
        this.startingPoint = startingPoint;
    }

    setStartingRules() {
        // add the starting rules to the first state
        const startingRules = this.grammar.filter(rule => rule.lhs === this.startingPoint);
        startingRules.forEach(rule => {
            this.states[0].push(new EarleyItem(rule, 0, 0, ItemAction.PREDICT));
        });
    }

    // check if the symbol is non-terminal
    isNonTerminal(symbol: string) {
        return this.grammar.some(rule => rule.lhs === symbol);
    }

    restart() { // restart the parser
        this.states = [];
        this.states[0] = new State();
        this.reversedStates = [];
    }

    reset() { // reset the parser
        this.grammar = [];
        // this.nullableRules = [];
        this.nullables = [];
        this.states = [];
        this.states[0] = new State();
    }

    // function to find nullable rules
    findNullables() {
        // find direct nullables
        this.nullables.push(
            ...this.grammar
                .filter((rule) => rule.rhs.length === 0)
                .map((rule) => rule.lhs),
        );

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

        // console.log(this.nullables);
        // remove duplicates
        this.nullables = this.nullables.filter((value, index, self) => self.indexOf(value) === index);
    }

    // parse the input
    parse(input: string) {
        // set starter rules
        this.setStartingRules();

        // initialize nullable rules
        this.findNullables();

        // outer loop
        for (let i = 0; i < this.states.length; i++) {
            // inner loop
            for (let j = 0; j < this.states[i].size(); j++) {
                const item = this.states[i].get(j);

                if (item.dot === item.rule.rhs.length) {
                    this.complete(this.states[i], i, j);
                } else {
                    const symbol = item.rule.rhs[item.dot];
                    if (this.isNonTerminal(symbol)) {
                        this.predict(symbol, this.states[i], item.start, i, j);
                    } else {
                        if (i < input.length) {
                            this.scan(input[i], this.states[i], j, i);
                        }
                    }
                }
            }
        }

        // check if we read the whole input
        if (this.states.length < input.length + 1) {
            // console.log('\nThe input is not valid');
            return { accepted: false, length: -1, derivation: [] };
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

                return this.createTree(root, input);
            });

            let acc: boolean = false
            trees.forEach((tree, index) => {
                if (tree) {
                    console.log(`\nParser tree ${index}`);
                    tree.print();
                    acc = tree.findAllLeaves() === input;
                }
            });

            if (trees.length > 1) {
                let derivations = trees.map(tree => {
                    if (tree === undefined) return;
                    return tree.getDerivation(this)
                });
                return { accepted: acc, length: derivations.length, derivation: derivations };
            }

            let derivation: { rule: string; result: string }[] = trees[0].getDerivation(this);
            return { accepted: acc, length: 1, derivation: derivation };
        }

        return { accepted: false, length: -1, derivation: [] };
    }

    createTree(root: TreeNode, input: string) {
        let tree = new ParserTree(root);
        let stack = [root];

        while (stack.length > 0) {
            let node = stack.pop();

            if (!node) continue;

            if (node.item.rule.rhs.length === 0) {
                let child = new TreeNode("");
                node.addChild(child);
            }

            let stI = 0;
            for (let rhs of node.item.rule.rhs) {
                if (!this.isNonTerminal(rhs)) {
                    let child = new TreeNode(rhs);
                    node.addChild(child);
                    continue;
                }

                if (node.item.from[stI] === undefined) continue;

                let start = node.item.from[stI][0];
                let end = node.item.from[stI][1];
                let item = this.states[start].items[end];

                let child = new TreeNode(item.rule.lhs);
                child.setItem(item);
                node.addChild(child);
                stack.push(child);
                stI++;
            }
        }

        // console.log(tree);
        return tree;
    }

    // predict the next non-terminal symbol
    predict(symbol: string, state: State, start: number, stateIndex: number, itemIndex: number) {
        const rules = this.grammar.filter((rule) => rule.lhs === symbol);

        rules.forEach((rule) => {
            state.push(new EarleyItem(rule, 0, stateIndex, ItemAction.PREDICT));

            // magical completion
            if (this.nullables.includes(rule.lhs)) {
                let newItem = new EarleyItem(state.get(itemIndex).rule, state.get(itemIndex).dot + 1, state.get(itemIndex).start, ItemAction.COMPLETE);
                state.push(newItem);
                // console.log(`\nPredicting nullable ${state.items[state.items.length - 1].toString()}`);
            }
        });

        // remove duplicates or we will be stuck in an infinite loop
        state.items = state.items.filter((item, index) => {
            return state.items.findIndex((i) => i.equals(item)) === index;
        });
    }

    // scan the next terminal symbol
    scan(input: string, state: State, index: number, stateIndex: number) {
        if (input === state.get(index).rule.rhs[state.get(index).dot]) {
            // we copy the item and move the dot one position to the right
            let item = new EarleyItem(
                state.get(index).rule,
                state.get(index).dot + 1,
                state.get(index).start,
                ItemAction.SCAN,
                state.get(index).from,
            );
            this.states[stateIndex + 1] = this.states[stateIndex + 1] || new State();
            this.states[stateIndex + 1].push(item);
        }
    }

    // complete the items
    complete(state: State, stateIndex: number, itemIndex: number) {
        let stateSet = this.states[state.get(itemIndex).start];
        const rules = stateSet.items.filter(
            (item) => item.rule.rhs[item.dot] === state.get(itemIndex).rule.lhs,
        );


        rules.forEach((rule) => {
            let f = [...rule.from];
            f.push([stateIndex, itemIndex]);
            let item = new EarleyItem(rule.rule, rule.dot + 1, rule.start, ItemAction.COMPLETE, f);

            // if item is already completed we don't need to add it again
            if (state.items.some((i) => i.equals(item))) {
                return;
            }

            // push the completed item into the current state
            state.push(item);
        });
    }

    setRules(rules: Rule[]) {
        this.grammar = rules;
    }
}



