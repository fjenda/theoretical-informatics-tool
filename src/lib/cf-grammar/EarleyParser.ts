export class Rule {
    // S -> E+T
    lhs: string; // S
    rhs: string[]; // [E, +, T]

    constructor(lhs: string, rhs: string[]) {
        this.lhs = lhs;
        this.rhs = rhs;
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

class NullbaleRule {
    name: string;
    nullable: boolean = true;

    constructor(name: string) {
        this.name = name;
    }
}

export class EarleyParser {
    grammar: Rule[] = [];
    nullableRules: NullbaleRule[] = [];
    states: State[] = [];
    startingPoint: string

    constructor(startingPoint: string, grammar: Rule[]) {
        this.grammar = grammar;
        this.states[0] = new State();
        this.startingPoint = startingPoint;
    }

    setStartingRules() {
        // add the starting rules to the first state
        const startingRules = this.grammar.filter(rule => rule.lhs === this.startingPoint);
        startingRules.forEach(rule => {
            this.states[0].push(new EarleyItem(rule, 0, 0));
        });
    }

    addNullableRule(ruleName: string) {
        // check if the rule is already in the list
        if (this.nullableRules.some(rule => rule.name === ruleName)) {
            return;
        }

        // add the rule to the list
        this.nullableRules.push(new NullbaleRule(ruleName));
    }

    // check if the rule is nullable (its rhs is in the nullable list)
    isNullable(rule: Rule) {
        return rule.rhs.every(symbol => this.nullableRules.some(rule => rule.name === symbol));
    }

    // update the nullable rules
    updateNullableRules() {
        this.grammar.forEach(rule => {
            if (this.isNullable(rule)) {
                this.addNullableRule(rule.lhs);
            }
        });
    }

    // update the nullable rules until the list is stable
    nullableRulesFunction() {
        let nss: NullbaleRule[] = [];
        let oldSize;
        do {
            oldSize = nss.length;
            this.updateNullableRules();
            nss = this.nullableRules;
        } while (oldSize === nss.length);
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

    // parse the input
    parse(input: string) {
        // set starter rules
        this.setStartingRules();

        // update the nullable rules
        // this.nullableRulesFunction();

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

        // before checking if input is valid we need to check if we even read the whole input
        // (we should be in the state that has the same length as the input)
        // TODO: fix this for ambiguous grammars
        if (this.states.length < input.length + 1) {
            console.log(this.states.length, input.length + 1)
            return false;
        }

        // check if the input is valid
        // make a copy of the last state into a new variable and check if it contains the starting rule
        let lastState = new State();
        this.states[this.states.length - 1].items.forEach(item => lastState.push(item));

        // find the items that match
        const lastItems = lastState.items.filter(item => item.rule.lhs === this.startingPoint &&
                                                                                item.start === 0 &&
                                                                                item.dot === item.rule.rhs.length);

        // if there are items that match, the input is valid
        return lastItems.length > 0;
    }

    // predict the next non-terminal symbol
    predict(symbol: string, state: State, start: number, stateIndex: number, itemIndex: number) {
        const rules = this.grammar.filter(rule => rule.lhs === symbol);
        rules.forEach(rule => {
            state.push(new EarleyItem(rule, 0, stateIndex));

            // magical completion
            // if (this.nullableRules.some(rule => rule.name === symbol)) {
            //     state.push(new EarleyItem(rule, state.get(itemIndex).dot + 1, start));
            // }
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