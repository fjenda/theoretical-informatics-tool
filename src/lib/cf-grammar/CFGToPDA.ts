export class ContextFreeGrammar {
    startSymbol: string;
    nonTerminals: string[];
    terminals: string[];
    rules: CFGRule[];

    constructor(startSymbol: string, nonTerminals: string[], terminals: string[], rules: CFGRule[]) {
        this.startSymbol = startSymbol;
        this.nonTerminals = nonTerminals;
        this.terminals = terminals;
        this.rules = rules;
    }
}

export class CFGRule {
    leftSide: string;
    rightSide: string[];

    constructor(leftSide: string, rightSide: string[]) {
        this.leftSide = leftSide;
        this.rightSide = rightSide;
    }
}

export class PushdownAutomaton {
    states: string[];
    inputAlphabet: string[];
    stackAlphabet: string[];
    initialState: string;
    finalStates: string[];
    transitions: PDATransition[];

    constructor() {
        this.states = [];
        this.inputAlphabet = [];
        this.stackAlphabet = [];
        this.initialState = '';
        this.finalStates = [];
        this.transitions = [];
    }

    addTransition(transition: PDATransition) {
        this.transitions.push(transition);
    }

    //to string
    toString() {
        let str = '';
        str += `Q = { ${this.states.join(', ')} }\n`;
        str += `Σ = { ${this.inputAlphabet.join(', ')} }\n`;
        str += `Γ = { ${this.stackAlphabet.join(', ')} }\n`;
        str += `q0 = ${this.initialState}\n`;
        str += `F = { ${this.finalStates.join(', ')} }\n`;
        str += `δ = {\n`;
        for (const transition of this.transitions) {
            str += `\t(${transition.sourceState}, ${transition.inputSymbol}, ${transition.stackTop}) -> (${transition.destinationState}, ${transition.pushSymbols.join('')})\n`;
        }
        str += `}\n`;
        return str;
    }
}

export class PDATransition {
    sourceState: string;
    inputSymbol: string;
    stackTop: string;
    destinationState: string;
    pushSymbols: string[];

    constructor(
        sourceState: string,
        inputSymbol: string,
        stackTop: string,
        destinationState: string,
        pushSymbols: string[]
    ) {
        this.sourceState = sourceState;
        this.inputSymbol = inputSymbol;
        this.stackTop = stackTop;
        this.destinationState = destinationState;
        this.pushSymbols = pushSymbols;
    }
}

export class CFGtoPDAConverter {
    convertToPDA(grammar: ContextFreeGrammar): PushdownAutomaton {
        const pda = new PushdownAutomaton();

        // Create PDA states
        pda.states = [...grammar.nonTerminals, 'q_accept', 'q_reject'];

        // Create PDA input alphabet
        pda.inputAlphabet = grammar.terminals;

        // Create PDA stack alphabet
        pda.stackAlphabet = [...grammar.terminals, ...grammar.nonTerminals];

        // Set initial state and final state
        pda.initialState = grammar.startSymbol;
        pda.finalStates = ['q_accept'];

        // Iterate through grammar rules and generate PDA transitions
        for (const rule of grammar.rules) {
            const nonTerminal = rule.leftSide;
            for (const production of rule.rightSide) {
                const transition = new PDATransition(
                    nonTerminal,
                    production,
                    nonTerminal,
                    'q_accept',
                    production.split('').reverse()
                );
                pda.addTransition(transition);
            }
        }

        return pda;
    }
}

// Usage example
const cfg = new ContextFreeGrammar(
    'S',
    ['S', 'A', 'B'],
    ['a', 'b'],
    [
        new CFGRule('S', ['a', 'A']),
        new CFGRule('A', ['b', 'B']),
        new CFGRule('B', ['a', 'S']),
        new CFGRule('B', ['b'])
    ]
);

const converter = new CFGtoPDAConverter();
const pda = converter.convertToPDA(cfg);

console.log(pda);