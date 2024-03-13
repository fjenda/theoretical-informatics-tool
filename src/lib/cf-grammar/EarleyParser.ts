export class Rule {
    // S -> E+T
    lhs: string; // S
    rhs: string[]; // [E, +, T]

    constructor(lhs: string, rhs: string[]) {
        this.lhs = lhs;
        this.rhs = rhs;
    }

    equals(other: Rule) {
        return this.lhs === other.lhs && this.rhs.join("") === other.rhs.join("");
    }

    toString() {
        return `${this.lhs} -> ${this.rhs.join(" ")}`;
    }
}

class EarleyItem {
    // S -> . E+T (0)
    rule: Rule; // S -> E+T
    dot: number; // .
    start: number; // (0)
    action: ItemAction;
    from: [number, number][];

    constructor(rule: Rule, dot: number, start: number, action: ItemAction, from: [number, number][] = []) {
        this.rule = rule;
        this.dot = dot;
        this.start = start;
        this.action = action;
        this.from = from;
    }

    equals(item: EarleyItem) {
        return (
            this.rule.lhs === item.rule.lhs &&
            this.rule.rhs.join("") === item.rule.rhs.join("") &&
            this.dot === item.dot &&
            this.start === item.start
        );
    }

    toString() {
        return `${this.rule.lhs} -> ${this.rule.rhs.slice(0, this.dot).join(" ")} . ${this.rule.rhs.slice(this.dot).join(" ")} (${this.start}) - ${ItemAction[this.action]} - ${this.from.map(f => `S[${f[0]},${f[1]}]`).join(" ")}`;
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

enum ItemAction {
    PREDICT,
    SCAN,
    COMPLETE,
};

export class EarleyParser {
    grammar: Rule[] = [];
    nullableRules: boolean[] = [];
    states: State[] = [];
    startingPoint: string;
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

            for (let i = 0; i < finishedItems.length; i++) {
                for (let j = 0; j < finishedItems[i].items.length; j++) {
                    let tmpItem = new EarleyItem(
                        finishedItems[i].items[j].rule,
                        finishedItems[i].items[j].dot,
                        i,
                        finishedItems[i].items[j].action,
                        finishedItems[i].items[j].from,
                    );
                    this.reversedStates[finishedItems[i].items[j].start].push(tmpItem);
                }
            }

            // there could still be a rule position issue (the biggest priority should be at the top of the array)
            // we need to fix that
            let rulePriority: { [key: string]: number } = {};

            // find the priority of the rules
            this.grammar.forEach((rule) => {
                let index = `${rule.lhs} -> ${rule.rhs.join(" ")}`;
                if (rulePriority[index] === undefined) {
                    // give the rule a priority of the dict length
                    rulePriority[index] = Object.keys(rulePriority).length;
                }
            });

            // now we need to sort the reversedStates array using the rulePriority
            this.reversedStates.forEach((state) => {
                state.items.sort((a, b) => {
                    let indexA = `${a.rule.lhs} -> ${a.rule.rhs.join(" ")}`;
                    let indexB = `${b.rule.lhs} -> ${b.rule.rhs.join(" ")}`;

                    if (indexA === indexB) return b.start - a.start;
                    return rulePriority[indexA] - rulePriority[indexB];
                });
            });


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
                    console.log(`\n${tree.findAllLeaves()} === ${input}`);

                    console.log(
                        `\n${tree.findAllLeaves() === input ? "The input is valid" : "The input is not valid"}`,
                    );
                    acc = tree.findAllLeaves() === input;
                }
            });

            if (trees.length > 1) {
                let derivations = trees.map(tree => {
                    if (tree === undefined) return;
                    return tree.getDerivation()
                });
                return { accepted: acc, length: derivations.length, derivation: derivations };
            }

            let derivation: { rule: string; result: string }[] = trees[0].getDerivation();
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
        return tree;
    }

    // predict the next non-terminal symbol
    predict(symbol: string, state: State, start: number, stateIndex: number, itemIndex: number) {
        const rules = this.grammar.filter((rule) => rule.lhs === symbol);

        rules.forEach((rule) => {
            state.push(new EarleyItem(rule, 0, stateIndex, ItemAction.PREDICT));

            // magical completion
            if (this.nullableRules[this.grammar.findIndex((r) => r.lhs === rule.lhs)]) {
                state.push(new EarleyItem(rule, state.items[itemIndex].dot + 1, stateIndex, ItemAction.COMPLETE));
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

class TreeEdge {
    start: string;
    end: string;
    item: EarleyItem;

    constructor(start: string, end: string, item: EarleyItem) {
        this.start = start;
        this.end = end;
        this.item = item;
    }

    equals(other: TreeEdge) {
        return (
            this.start === other.start &&
            this.end === other.end &&
            this.item.equals(other.item)
        );
    }

    toString() {
        return `${this.start} -> ${this.end} (${this.item.rule.lhs} -> ${this.item.rule.rhs.join(" ")})`;
    }
}

class TreeNode {
    value: string;
    children: TreeNode[] = [];
    visited: boolean;
    item: EarleyItem = {} as EarleyItem;
    edges: TreeEdge[] = [];

    constructor(value: string) {
        this.value = value;
        this.children = [];
        this.visited = false;
    }

    setItem(item: EarleyItem) {
        this.item = item;
    }

    addEdge(edge: TreeEdge) {
        this.edges.push(edge);
    }

    addChild(child: TreeNode) {
        this.children.push(child);
    }

    print(node: TreeNode, indent: string, last: boolean) {
        console.log(indent + (last ? "└─" : "├─") + node.value);
        indent += last ? "  " : "│ ";

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
    findLeaf(symbol: string) {
        let stack = [this.root];

        while (stack.length > 0) {
            let node = stack.pop();

            if (!node) continue;

            if (node.value === symbol && node.children.length === 0) {
                return node;
            }

            stack.push(...node.children);
        }

        return undefined;
    }

    // returns all the leaves (using depth-first search) in the tree (this function is for testing purposes,
    // it should give us the input we put in the parser tree)
    findAllLeaves() {
        let leaves: string[] = [];
        let stack = [this.root];

        while (stack.length > 0) {
            let node = stack.pop();

            if (!node) continue;

            if (node.children.length === 0 && node.value.length === 1) {
                leaves.push(node.value);
            }

            stack.push(...node.children);
        }

        return leaves.reverse().join("");
    }

    // using the depth-first search we can find the derivation by traversing the tree
    getDerivation() {
        let stack = [this.root];
        let derivation: {rule: string, result: string}[] = [{rule: `Start -> ${this.root.value}`, result: `${this.root.value}`}];
        let result = this.root.value;

        while (stack.length > 0) {
            let node = stack.pop();

            if (!node) continue;

            if (!node.visited) {
                if (node.children.length > 0) {
                    result = this.parseChar(result, node.item.rule);
                    derivation.push({rule: `${node.item.rule.toString()}`, result: result});
                }
            }

            stack.push(...node.children.reverse());
            node.visited = true;
        }

        return derivation;
    }

    parseChar(input: string, rule: Rule) {
        console.log(rule.toString());
        for (let char of input) {
            if (char === rule.lhs) {
                // replace the char with the rule lhs
                input = input.replace(char, rule.rhs.join(""));
                break;
            }
        }

        return input;
    }

    // pretty print the tree
    print() {
        this.root.print(this.root, "", true);
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