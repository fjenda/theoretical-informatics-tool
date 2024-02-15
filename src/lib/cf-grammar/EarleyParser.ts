import {grammar_results_store} from "../../stores/graphInitStore";
import {derived} from "svelte/store";

export class Rule {
    // S -> E+T
    lhs: string; // S
    rhs: string[]; // [E, +, T]

    constructor(lhs: string, rhs: string[]) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    toString() {
        return `${this.lhs} -> ${this.rhs.join('')}`;
    }
}

class EarleyItem {
    // S -> . E+T (0)
    rule: Rule; // S -> E+T
    dot: number; // .
    start: number; // (0)

    constructor(rule: Rule, dot: number, start: number) {
        this.rule = rule;
        this.dot = dot;
        this.start = start;
    }

    equals(item: EarleyItem) {
        return this.rule.lhs === item.rule.lhs &&
            this.rule.rhs.join('') === item.rule.rhs.join('') &&
            this.dot === item.dot &&
            this.start === item.start;
    }

    toString() {
        return `${this.rule.lhs} -> ${this.rule.rhs.slice(0, this.dot).join(' ')} . ${this.rule.rhs.slice(this.dot).join(' ')} (${this.start})`;
    }
}

class State {
    items: EarleyItem[] = [];

    push(item: EarleyItem) {
        this.items.push(item);
    }

    pop() {
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }

    get(index: number) {
        return this.items[index];
    }

    size() {
        return this.items.length;
    }

    toString() {
        return this.items.map(item => item.toString()).join('\n');
    }
}

export class EarleyParser {
    grammar: Rule[] = [];
    nullableRules: boolean[] = [];
    states: State[] = [];
    startingPoint: string
    reversedStates: State[] = [];

    constructor(startingPoint: string, grammar: Rule[]) {
        this.grammar = grammar;
        // this.grammar = [
        //     new Rule('A', []),
        //     new Rule('A', ['B']),
        //     new Rule('B', ['A'])
        // ]
        this.states[0] = new State();
        this.startingPoint = startingPoint;
        // this.startingPoint = 'A';
    }

    setStartingRules() {
        // add the starting rules to the first state
        const startingRules = this.grammar.filter(rule => rule.lhs === this.startingPoint);
        startingRules.forEach(rule => {
            this.states[0].push(new EarleyItem(rule, 0, 0));
        });
    }

    // check if the symbol is non-terminal
    isNonTerminal(symbol: string) {
        return this.grammar.some(rule => rule.lhs === symbol);
    }

    restart() { // restart the parser
        this.states = [];
        this.states[0] = new State();
    }

    reset() { // reset the parser
        this.grammar = [];
        this.nullableRules = [];
        this.states = [];
        this.states[0] = new State();
    }

    // function to find nullable rules
    findNullables(rules: Rule[]): boolean[] {
        const lhsRules: { [key: string]: Rule[] } = {}; // Table of lists of rules indexed by LHS
        const rhsRules: { [key: string]: Rule[] } = {}; // Table of lists of rules indexed by RHS symbol
        const nullable: boolean[] = []; // Array of booleans indexed by symbol ID
        const workStack: string[] = []; // Work stack

        // Initialize tables and arrays
        for (const rule of rules) {
            if (!lhsRules[rule.lhs]) {
                lhsRules[rule.lhs] = [];
            }
            lhsRules[rule.lhs].push(rule);

            for (const symbol of rule.rhs) {
                if (!rhsRules[symbol]) {
                    rhsRules[symbol] = [];
                }
                rhsRules[symbol].push(rule);
            }
        }

        // Initialize nullable array, marking LHS of empty rules as nullable
        for (let i = 0; i < rules.length; i++) {
            nullable[i] = false;

            if (rules[i].rhs.length === 0) {
                nullable[i] = true;
                workStack.push(rules[i].lhs);
            }
        }

        // Symbol loop
        while (workStack.length > 0) {
            const workSymbol = workStack.pop();

            // Rule loop
            if (workSymbol === undefined) continue;
            const rulesWithWorkSymbol = rhsRules[workSymbol];

            if (rulesWithWorkSymbol) {
                for (const workRule of rulesWithWorkSymbol) {
                    if (nullable[rules.indexOf(workRule)]) continue; // LHS already marked nullable

                    // console.log(`\nworkRule -> ${workRule.lhs} -> ${workRule.rhs}`);

                    // For every RHS symbol of the work rule
                    for (const symbol of workRule.rhs) {
                        // if it is not marked nullable, continue with the next rule of the rule loop.
                        if (!this.isMarkedNullable(symbol, nullable)) break;
                    }

                    // If we reach this point, the LHS of the work rule is nullable, but is not marked nullable.
                    // Mark the LHS of the work rule nullable.
                    nullable[rules.indexOf(workRule)] = true;

                    // Push the LHS of the work rule onto the "work stack".
                    workStack.push(workRule.lhs);

                    // Continue with the next rule of the rule loop.
                }
            }
        }

        return nullable;
    }

    // check if the symbol is nullable
    isMarkedNullable(symbol: string, nullableArray: boolean[]) {
        return nullableArray[this.grammar.findIndex(rule => rule.lhs === symbol)];
    }

    // parse the input
    parse(input: string) {
        // set starter rules
        this.setStartingRules();

        // initialize nullable rules
        this.nullableRules = this.findNullables(this.grammar);

        // outer loop
        for (let i = 0; i < this.states.length; i++) {
            // inner loop
            for (let j = 0; j < this.states[i].size(); j++) {
                const item = this.states[i].get(j);

                if (item.dot === item.rule.rhs.length) {
                    this.complete(this.states[i], j);
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
        // print the result
        // this.states.forEach((state, index) => {
        //     console.log(`\nState ${index}`);
        //     console.log(state.toString());
        // });

        // check if we read the whole input
        if (this.states.length < input.length + 1) {
            console.log('\nThe input is not valid');
            return { accepted: false, length: -1, derivation: [] };
        }

        // make a copy of the last state and check if it contains the starting rule
        let lastState = new State();
        this.states[this.states.length - 1].items.forEach(item => lastState.push(item));

        // find the items that match
        const lastItems = lastState.items.filter(item => item.rule.lhs === this.startingPoint &&
                                                                            item.start === 0 &&
                                                                            item.dot === item.rule.rhs.length);

        // console.log(`\nmatching states: ${lastItems.length}`)

        // create the parser tree
        if (lastItems.length > 0) {
            const finishedItems: State[] = [];
            // filter the states into finishedItems array that contain only the finished items (dot at the end)
            this.states.forEach((state) => {
                let tmpState: State = new State();
                tmpState.items = state.items.filter(item => item.dot === item.rule.rhs.length);
                finishedItems.push(tmpState);
            });

            // dully reverse the finishedItems array
            // start is the state number and the state number is the start
            for (let i = 0; i < finishedItems.length; i++) {
                // initialize the array with the same size
                this.reversedStates[i] = new State();
            }

            // for (let i = finishedItems.length - 1; i >= 0; i--) {
            //     for (let j = finishedItems[i].items.length - 1; j >= 0; j--) {
            //         let tmpItem = new EarleyItem(finishedItems[i].items[j].rule, finishedItems[i].items[j].dot, i);
            //         this.reversedStates[finishedItems[i].items[j].start].push(tmpItem);
            //     }
            // }

            for (let i = 0; i < finishedItems.length; i++) {
                for (let j = 0; j < finishedItems[i].items.length; j++) {
                    let tmpItem = new EarleyItem(finishedItems[i].items[j].rule, finishedItems[i].items[j].dot, i);
                    this.reversedStates[finishedItems[i].items[j].start].push(tmpItem);
                }
            }


            // there could still be a rule position issue (the biggest priority should be at the top of the array)
            // we need to fix that
            let rulePriority: { [key: string]: number } = {};

            // find the priority of the rules
            this.grammar.forEach((rule) => {
                if (rulePriority[rule.lhs] === undefined)
                    // give the rule a priority of the dict length
                    rulePriority[rule.lhs] = Object.keys(rulePriority).length;
            });

            // now we need to sort the reversedStates array
            this.reversedStates.forEach((state) => {
                state.items.sort((a, b) => {
                    return rulePriority[a.rule.lhs] - rulePriority[b.rule.lhs];
                });
            });


            // print the completed results
            // this.reversedStates.forEach((state, index) => {
            //     console.log(`\nState ${index}`);
            //     console.log(state.toString());
            // });

            // let tree = this.createTree();
            // console.log('\nParser tree');
            // tree.print();

            let trees: ParserTree[] = lastItems.map((item) => {
                let root: TreeNode = new TreeNode(item.rule.lhs);
                root.setRule(item.rule);

                console.log(`root -> ${root.value}, ${root.rule.toString()}`);
                return this.createTree(root, input);
            });

            trees.forEach((tree, index) => {
                if (tree === undefined) return;

                console.log(`\nParser tree ${index}`);
                tree.print();
            });

            if (trees.length > 1) {
                let derivations = trees.map(tree => {
                    if (tree === undefined) return;
                    return tree.getDerivation()
                });
                return { accepted: true, length: derivations.length, derivation: derivations };
            }

            let derivation: { rule: string; result: string }[] = trees[0].getDerivation();
            return { accepted: true, length: 1, derivation: derivation };
        }

        return { accepted: false, length: -1, derivation: [] };
    }

    createTree(root: TreeNode, input: string): ParserTree {
        // create the tree
        let tree = new ParserTree(root);
        let lastTree = new ParserTree(root);

        // create the children
        this.reversedStates.forEach((state) => {
            state.items.forEach((item) => {
                // split the right side and create nodes from it
                let nodes: TreeNode[];

                // if the rule is empty, create a node with an empty string
                if (item.rule.rhs.length === 0) {
                    nodes = [new TreeNode('')];
                } else {
                    nodes = item.rule.rhs.map((value) => new TreeNode(value));
                }

                let parent = tree.findLeaf(item.rule.lhs);

                // if the parent isn't the root, set the rule
                if (parent?.rule?.lhs !== root.rule.lhs) parent?.setRule(item.rule);

                // handling the case when the rule is empty
                if (parent?.rule.rhs.length === 0 && item.rule.rhs.length === 0) {
                    nodes.forEach((node) => {
                        parent?.addChild(node);
                    });
                } else if (parent?.rule.rhs === item.rule.rhs) {
                    nodes.forEach((node) => {
                        parent?.addChild(node);
                    });
                }
            });
        });

        // check if the tree is completed
        if (tree.findAllLeaves().join("") === input) {
            return tree;
        } else if (tree.findAllLeaves().join("") === lastTree.findAllLeaves().join("")) {
            return undefined;
        } else {
            // remove the starter rule used
            let found = false;
            this.reversedStates[0].items.forEach(item => {
                if (found) return;

                if (item.rule === root.rule) {
                    this.reversedStates[0].items.splice(this.reversedStates[0].items.indexOf(item), 1);
                    found = true;
                }
            })

            return this.createTree(tree.root, input);
        }
    }

    // predict the next non-terminal symbol
    predict(symbol: string, state: State, start: number, stateIndex: number, itemIndex: number) {
        const rules = this.grammar.filter(rule => rule.lhs === symbol);

        rules.forEach(rule => {
            state.push(new EarleyItem(rule, 0, stateIndex));

            // magical completion
            if (this.nullableRules[this.grammar.findIndex(r => r.lhs === rule.lhs)]) {
                state.push(new EarleyItem(rule, state.items[itemIndex].dot + 1, stateIndex));
            }
        });

        // remove duplicates or we will be stuck in an infinite loop
        state.items = state.items.filter((item, index) => {
            return state.items.findIndex(i => i.equals(item)) === index;
        });
    }

    // scan the next terminal symbol
    scan(input: string, state: State, index: number, stateIndex: number) {
        if (input === state.get(index).rule.rhs[state.get(index).dot]) {
            // we copy the item and move the dot one position to the right
            let item = new EarleyItem(state.get(index).rule, state.get(index).dot + 1, state.get(index).start);
            this.states[stateIndex + 1] = this.states[stateIndex + 1] || new State();
            this.states[stateIndex + 1].push(item);
        }
    }

    // complete the items
    complete(state: State, index: number) {
        let stateSet = this.states[state.get(index).start];
        const rules = stateSet.items.filter(item => item.rule.rhs[item.dot] === state.get(index).rule.lhs);

        rules.forEach(rule => {
            // if item is already completed we don't need to add it again
            if (state.items.some(item => item.equals(new EarleyItem(rule.rule, rule.dot + 1, rule.start)))) {
                return;
            }

            // shift the dot one position to the right
            let item = new EarleyItem(rule.rule, rule.dot + 1, rule.start);

            // push the completed item into the current state
            state.push(item);
        });
    }

    setRules(rules: Rule[]) {
        this.grammar = rules;
    }
}

class TreeNode {
    value: string;
    children: TreeNode[];
    visited: boolean;
    rule: Rule;

    constructor(value: string) {
        this.value = value;
        this.children = [];
        this.visited = false;
    }

    setRule(rule: Rule) {
        this.rule = rule;
    }

    addChild(child: TreeNode) {
        this.children.push(child);
    }

    print(node: TreeNode, indent: string, last: boolean) {
        console.log(indent + (last ? '└─' : '├─') + node.value);
        indent += last ? '  ' : '│ ';

        for (let i = 0; i < node.children.length; i++) {
            this.print(node.children[i], indent, i === node.children.length - 1);
        }
    }
}

class ParserTree {
    root: TreeNode;

    constructor(root: TreeNode) {
        this.root = root;
    }

    // look through the whole tree using depth-first search and find the leaf with the given value
    findLeaf(value: string) {
        let stack = [this.root];

        while (stack.length > 0) {
            let node = stack.pop();

            if (!node) continue;

            if (node.value === value && node.children.length === 0) {
                return node;
            }

            stack.push(...node.children);
        }
    }

    // returns all the leaves (using depth-first search) in the tree (this function is for testing purposes,
    // it should give us the input we put in the parser tree)
    findAllLeaves() {
        let leaves: string[] = [];
        let stack = [this.root];

        while (stack.length > 0) {
            let node = stack.pop();

            if (!node) continue;

            if (node.children.length === 0) {
                leaves.push(node.value);
            }

            stack.push(...node.children);
        }

        return leaves.reverse();
    }

    // using the breadth-first search we can find the derivation by traversing the tree
    getDerivation() {
        let queue = [this.root];
        let derivation: {rule: string, result: string}[] = [{rule: `Start -> ${this.root.value}`, result: `${this.root.value}`}];
        let result = this.root.value;

        while (queue.length > 0) {
            let node = queue.shift();

            if (!node) continue;

            if (!node.visited) {
                if (node.rule) {
                    result = this.parseChar(result, node.rule);
                    derivation.push({rule: `${node.rule.toString()}`, result: result});
                }
            }

            queue.push(...node.children);
            node.visited = true;
        }

        return derivation;
    }

    // helper function to parse the character
    parseChar(input: string, rule: Rule) {
        for (let char of input) {
            if (char === rule.lhs) {
                // replace the char with the rule lhs
                input = input.replace(char, rule.rhs.join(''));
                break;
            }
        }

        return input;
    }


    // pretty print the tree
    print() {
        this.root.print(this.root, '', true);
    }
}

//
// const grammar = [
//     new Rule('S', ['E']),
//     new Rule('S', []),
//     new Rule('E', ['E', '+', 'T']),
//     new Rule('E', ['T']),
//     new Rule('T', ['T', '*', 'F']),
//     new Rule('T', ['F']),
//     new Rule('F', ['(', 'E', ')']),
//     new Rule('F', ['x']),
//     new Rule('F', [])
// ];
//
// const parser = new EarleyParser('S', grammar);
// parser.parse('');